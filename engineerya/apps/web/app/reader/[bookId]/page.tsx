import { ReaderPreviewClient } from "./ReaderPreviewClient";

export function generateStaticParams() {
  return [{ bookId: "1" }, { bookId: "2" }, { bookId: "3" }, { bookId: "4" }, { bookId: "5" }];
}

export default function DocumentReaderPage({ params }: { params: { bookId: string } }) {
  const { bookId } = params;

  return <ReaderPreviewClient bookId={bookId} />;
}
