import { BookStatus } from "@engineerya/shared-types";

/**
 * Domain entity. Deliberately has NO fileKey field — that value never
 * needs to flow through application/presentation logic for catalog
 * browsing, so it's structurally impossible to leak it via this entity.
 * Only BookRepository.findFileKeyById() (used by Storage/Reader modules
 * in later phases) ever touches the raw key.
 */
export class BookEntity {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly slug: string,
    public readonly description: string,
    public readonly authorNames: string[],
    public readonly discipline: string,
    public readonly coverUrl: string,
    public readonly pageCount: number,
    public readonly priceCents: number,
    public readonly status: BookStatus,
    public readonly categoryId: string,
    public readonly publishedAt: Date | null,
    public readonly createdAt: Date
  ) {}

  get isPublished(): boolean {
    return this.status === BookStatus.PUBLISHED;
  }
}
