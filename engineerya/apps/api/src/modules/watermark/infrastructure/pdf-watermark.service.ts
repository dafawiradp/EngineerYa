import { Injectable } from "@nestjs/common";
import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";

export interface PdfWatermarkContext {
  userEmail: string;
  bookId: string;
  timestamp: Date;
}

/**
 * Watermarks the DOWNLOADABLE PDF (as opposed to WatermarkService, which
 * watermarks individual rendered page IMAGES for the in-browser reader).
 * Same philosophy, different artifact: stamps every page with the
 * purchasing user's email + a timestamp, generated fresh per download
 * rather than once and cached — so a redistributed copy still traces
 * back to whoever downloaded it.
 */
@Injectable()
export class PdfWatermarkService {
  async apply(sourcePdf: Buffer, ctx: PdfWatermarkContext): Promise<Buffer> {
    const pdfDoc = await PDFDocument.load(sourcePdf);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const label = `EngineerYa · ${ctx.userEmail} · ${ctx.timestamp.toISOString()}`;

    for (const page of pdfDoc.getPages()) {
      const { width, height } = page.getSize();

      // Footer strip — always legible, identifies the download.
      page.drawText(label, {
        x: 20,
        y: 14,
        size: 8,
        font,
        color: rgb(0.35, 0.35, 0.35),
      });

      // One faint diagonal stamp across the page center — harder to crop
      // out without noticeably damaging the page than the footer alone.
      page.drawText(label, {
        x: width / 4,
        y: height / 2,
        size: 20,
        font,
        color: rgb(0.85, 0.85, 0.85),
        opacity: 0.35,
        rotate: degrees(35),
      });
    }

    const bytes = await pdfDoc.save();
    return Buffer.from(bytes);
  }
}
