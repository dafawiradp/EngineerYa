import { ReadingProgressEntity } from "../entities/reading-progress.entity";

export interface IReadingProgressRepository {
  find(userId: string, bookId: string): Promise<ReadingProgressEntity | null>;
  upsert(userId: string, bookId: string, lastPage: number, percentComplete: number): Promise<ReadingProgressEntity>;
}

export const READING_PROGRESS_REPOSITORY = Symbol("READING_PROGRESS_REPOSITORY");
