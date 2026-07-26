import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";

export const BOOK_RENDERING_QUEUE = "book-rendering";

export interface RenderBookJobData {
  bookId: string;
}

/**
 * Producer side. Rendering a book's pages is slow (seconds-to-minutes
 * for a large PDF) and shells out to an external binary — it must never
 * run inline on an HTTP request thread. The admin "render" endpoint just
 * enqueues; BookRenderingProcessor does the actual work off the request path.
 */
@Injectable()
export class BookRenderingQueue {
  constructor(@InjectQueue(BOOK_RENDERING_QUEUE) private readonly queue: Queue<RenderBookJobData>) {}

  async enqueue(bookId: string): Promise<void> {
    await this.queue.add(
      "render",
      { bookId },
      {
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
        removeOnComplete: 100,
        removeOnFail: 100,
      }
    );
  }
}
