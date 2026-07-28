import Link from "next/link";
import { BookSummaryDto, BookStatus } from "@engineerya/shared-types";

interface BookCardProps {
  book: BookSummaryDto;
}

export function BookCard({ book }: BookCardProps) {
  // Map discipline to color themes
  const getDisciplineStyles = (discipline: string) => {
    switch (discipline?.toLowerCase()) {
      case "software":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      case "electrical":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "mechanical":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "civil":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      default:
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
    }
  };

  const formattedPrice = (book.priceCents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  return (
    <div className="group relative bg-[#0F1626] rounded-xl border border-slate-800/80 hover:border-indigo-550 overflow-hidden shadow-md hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col h-full">
      {/* Cover Image Placeholder */}
      <div className="relative aspect-[3/4] w-full bg-slate-900 overflow-hidden flex items-center justify-center border-b border-slate-850">
        {book.coverUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={book.coverUrl}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-indigo-950/40 flex flex-col items-center justify-center p-4 text-center">
            <span className="text-4xl text-slate-700 font-bold mb-2">📚</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">NO COVER AVAILABLE</span>
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
        <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-1">
          {book.title}
        </h3>
        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
          Comprehensive learning resources for modern engineering challenges.
        </p>
        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className="text-lg font-extrabold text-indigo-400">
            {book.priceCents === 0 ? "Free" : formattedPrice}
          </span>
          <Link
            href={`/books/${book.slug}`}
            className="text-xs font-semibold bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700/60 hover:border-indigo-500 transition-all duration-300"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}
