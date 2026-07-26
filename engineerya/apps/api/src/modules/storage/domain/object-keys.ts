// Single source of truth for R2 object key layout. Every module that
// reads or writes a book's files imports these instead of hand-building
// path strings, so the layout can change in one place.

export const ObjectKeys = {
  bookSource: (bookId: string) => `books/${bookId}/source.pdf`,
  bookPage: (bookId: string, pageNumber: number) => `books/${bookId}/pages/${pageNumber}.png`,
  bookCover: (bookId: string) => `covers/${bookId}.jpg`,
};
