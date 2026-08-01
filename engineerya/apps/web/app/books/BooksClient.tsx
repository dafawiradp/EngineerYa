"use client";

import { useMemo, useState } from "react";

const disciplines = ["All", "Software", "Electrical", "Aerospace", "Civil", "Mechanical"] as const;

export function BooksClient({ books }: { books: Array<{ id: string; slug: string; title: string; discipline: string; description: string; priceCents: number }> }) {
  const [selectedDiscipline, setSelectedDiscipline] = useState("All");

  const visibleBooks = useMemo(() => {
    if (selectedDiscipline === "All") return books;
    return books.filter((book) => book.discipline === selectedDiscipline);
  }, [books, selectedDiscipline]);

  return (
    <>
      <div className="flex flex-wrap gap-3 mb-10">
        {disciplines.map((discipline) => (
          <button
            key={discipline}
            onClick={() => setSelectedDiscipline(discipline)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              selectedDiscipline === discipline
                ? "bg-[#0077B6] text-white shadow-lg"
                : "bg-[#F8FDFF] text-[#0077B6] border border-[#00B4D8]/20 hover:bg-[#CAF0F8]"
            }`}
          >
            {discipline}
          </button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visibleBooks.map((book) => {
          const formattedPrice = new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
          }).format(book.priceCents * 100);

          return (
            <article key={book.id} className="group rounded-2xl border border-[#00B4D8]/20 bg-[#F8FDFF] p-6 shadow-lg shadow-[#00B4D8]/10 transition-all hover:-translate-y-1 hover:shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase tracking-[0.2em] text-[#0077B6] font-semibold">{book.discipline}</span>
                <span className="text-sm font-bold text-[#03045E]">{formattedPrice}</span>
              </div>
              <h3 className="text-xl font-bold text-[#03045E] mb-2">{book.title}</h3>
              <p className="text-sm text-[#0077B6] leading-relaxed mb-6">{book.description}</p>
              <a href={`/books/${book.slug}`} className="inline-flex items-center text-sm font-semibold text-[#0077B6] hover:text-[#03045E]">
                View details →
              </a>
            </article>
          );
        })}
      </div>
    </>
  );
}
