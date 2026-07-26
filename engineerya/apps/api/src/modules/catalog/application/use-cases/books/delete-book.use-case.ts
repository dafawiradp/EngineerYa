import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { BOOK_REPOSITORY, IBookRepository } from "../../../domain/repositories/book.repository";
import { BOOK_DELETED_EVENT, BookDeletedEvent } from "../../../domain/events/book.events";

@Injectable()
export class DeleteBookUseCase {
  constructor(
    @Inject(BOOK_REPOSITORY) private readonly books: IBookRepository,
    private readonly events: EventEmitter2
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.books.findById(id);
    if (!existing) {
      throw new NotFoundException("Book not found.");
    }
    await this.books.delete(id);
    this.events.emit(BOOK_DELETED_EVENT, new BookDeletedEvent(id));
  }
}
