import { Logger } from "@nestjs/common";
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { execFile } from "child_process";
import { promisify } from "util";
import { mkdtemp, readdir, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { Inject } from "@nestjs/common";
import { R2ClientService } from "./r2-client.service";
import { ObjectKeys } from "../domain/object-keys";
import { BOOK_RENDERING_QUEUE, RenderBookJobData } from "./book-rendering.queue";
import { BOOK_REPOSITORY, IBookRepository } from "../../catalog/domain/repositories/book.repository";

const execFileAsync = promisify(execFile);

/**
 * Consumer side. Uses `pdftoppm` (part of poppler-utils) to rasterize
 * every page of the source PDF to a PNG, uploads each page image to R2,
 * then records the page count back onto the Book row.
 *
 * Deployment requirement: the API container image must have
 * poppler-utils installed (`apt-get install -y poppler-utils`) — this
 * is a system binary, not an npm package, so it's added to the
 * Dockerfile rather than package.json. Documented in apps/api/Dockerfile.
 *
 * We shell out rather than using a pure-JS PDF rasterizer because
 * poppler is dramatically faster and more robust across the wide
 * variety of real-world engineering-textbook PDFs (embedded fonts,
 * scanned pages, huge page counts) this platform needs to handle at
 * production scale.
 */
@Processor(BOOK_RENDERING_QUEUE)
export class BookRenderingProcessor extends WorkerHost {
  private readonly logger = new Logger(BookRenderingProcessor.name);

  constructor(
    private readonly r2: R2ClientService,
    @Inject(BOOK_REPOSITORY) private readonly books: IBookRepository
  ) {
    super();
  }

  async process(job: Job<RenderBookJobData>): Promise<void> {
    const { bookId } = job.data;
    const workDir = await mkdtemp(join(tmpdir(), `engineerya-render-${bookId}-`));

    try {
      this.logger.log(`Rendering book ${bookId}`);

      const sourcePdf = await this.r2.getObjectBuffer(ObjectKeys.bookSource(bookId));
      const localPdfPath = join(workDir, "source.pdf");
      await writeFile(localPdfPath, sourcePdf);

      // Renders to workDir/page-1.png, page-2.png, ... at 150 DPI —
      // a reasonable balance of on-screen sharpness vs. file size/
      // bandwidth for the reader.
      await execFileAsync("pdftoppm", ["-png", "-r", "150", localPdfPath, join(workDir, "page")]);

      const files = (await readdir(workDir)).filter((f) => f.startsWith("page") && f.endsWith(".png"));
      if (files.length === 0) {
        throw new Error("pdftoppm produced no output pages — is the source file a valid PDF?");
      }

      // pdftoppm names output page-1.png, page-2.png, ... (no leading
      // zeros by default), so we sort numerically rather than lexically.
      const sorted = files
        .map((f) => ({ file: f, n: parseInt(f.replace(/^page-?/, "").replace(".png", ""), 10) }))
        .sort((a, b) => a.n - b.n);

      for (const { file, n } of sorted) {
        const buffer = await readFile(join(workDir, file));
        await this.r2.uploadBuffer(ObjectKeys.bookPage(bookId, n), buffer, "image/png");
      }

      await this.books.update(bookId, { pageCount: sorted.length });
      this.logger.log(`Rendered ${sorted.length} pages for book ${bookId}`);
    } finally {
      await rm(workDir, { recursive: true, force: true });
    }
  }
}
