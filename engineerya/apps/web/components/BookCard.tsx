import Link from "next/link";
import { BookSummaryDto, BookStatus } from "@engineerya/shared-types";
import { formatPriceFromCents } from "../lib/format";

interface BookCardProps {
  book: BookSummaryDto;
}

export function BookCard({ book }: BookCardProps) {
  // Map discipline to color themes
  const getDisciplineStyles = (discipline: string) => {
    switch (discipline?.toLowerCase()) {
      case "software":
        return "bg-[#00B4D8]/10 text-[#0077B6] border-[#00B4D8]/20";
      case "electrical":
        return "bg-[#90E0EF]/60 text-[#03045E] border-[#0077B6]/20";
      case "mechanical":
        return "bg-[#CAF0F8]/70 text-[#0077B6] border-[#00B4D8]/20";
      case "civil":
        return "bg-[#90E0EF]/40 text-[#03045E] border-[#0077B6]/20";
      default:
        return "bg-[#00B4D8]/10 text-[#0077B6] border-[#00B4D8]/20";
    }
  };

  const formattedPrice = formatPriceFromCents(book.priceCents);

  return (
    <div className="group relative bg-[#F8FDFF] rounded-xl border border-[#00B4D8]/30 hover:border-[#0077B6] overflow-hidden shadow-md hover:shadow-[#0077B6]/20 transition-all duration-300 flex flex-col h-full">
      {/* Cover Image Placeholder */}
      <div className="relative aspect-[3/4] w-full bg-[#90E0EF] overflow-hidden flex items-center justify-center border-b border-[#00B4D8]/30">
        {book.coverUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={book.coverUrl}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#00B4D8]/20 to-[#0077B6]/20 flex flex-col items-center justify-center p-4 text-center">
            <span className="text-4xl text-[#03045E] font-bold mb-2">📚</span>
            <span className="text-xs font-semibold text-[#0077B6] uppercase tracking-widest">NO COVER AVAILABLE</span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded border ${getDisciplineStyles(book.discipline)}`}>
            {book.discipline}
          </span>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-base font-bold text-[#03045E] group-hover:text-[#0077B6] transition-colors line-clamp-1">
          {book.title}
        </h3>
        <p className="text-xs text-[#0077B6]/80 mt-1 line-clamp-2">
          Comprehensive learning resources for modern engineering challenges.
        </p>
        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className="text-lg font-extrabold text-[#0077B6]">
            {book.priceCents === 0 ? "Free" : formattedPrice}
          </span>
          <Link
            href={`/books/${book.slug}`}
            className="text-xs font-semibold bg-[#0077B6] hover:bg-[#00B4D8] text-white px-3 py-1.5 rounded-lg border border-[#0077B6] transition-all duration-300"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}
