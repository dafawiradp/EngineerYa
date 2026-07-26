import { Inject, Injectable } from "@nestjs/common";
import { ReadingProgressEntity } from "../../domain/entities/reading-progress.entity";
import {
  IReadingProgressRepository,
  READING_PROGRESS_REPOSITORY,
} from "../../domain/repositories/reading-progress.repository";

@Injectable()
export class GetProgressUseCase {
  constructor(@Inject(READING_PROGRESS_REPOSITORY) private readonly progress: IReadingProgressRepository) {}

  execute(userId: string, bookId: string): Promise<ReadingProgressEntity | null> {
    return this.progress.find(userId, bookId);
  }
}
