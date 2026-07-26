// Domain events emitted by Catalog use cases. Search (Phase 3) listens to
// these to keep its index in sync WITHOUT Catalog knowing Search exists —
// avoids a circular module dependency and keeps Catalog free to be used
// standalone (e.g. by future admin tooling) without pulling in Meilisearch.

export const BOOK_UPSERTED_EVENT = "book.upserted";
export const BOOK_DELETED_EVENT = "book.deleted";

export class BookUpsertedEvent {
  constructor(public readonly bookId: string) {}
}

export class BookDeletedEvent {
  constructor(public readonly bookId: string) {}
}
