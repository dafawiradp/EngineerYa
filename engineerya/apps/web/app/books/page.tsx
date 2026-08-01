"use client";

import { useState } from "react";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { BookCard } from "../../components/BookCard";
import { BookStatus, BookSummaryDto } from "@engineerya/shared-types";

const MOCK_CATALOG: BookSummaryDto[] = [
  {
    id: "1",
    title: "Modern Database Internals",
    slug: "modern-database-internals",
    coverUrl: "",
    discipline: "Software",
    categoryId: "cat-1",
    priceCents: 4900,
    status: BookStatus.PUBLISHED,
  },
  {
    id: "9",
    title: "Chemical Process Principles",
    slug: "chemical-process-principles",
    coverUrl: "",
    discipline: "Chemical Engineering",
    categoryId: "cat-6",
    priceCents: 5400,
    status: BookStatus.PUBLISHED,
  },
  {
    id: "2",
    title: "Microservices Architecture & Patterns",
    slug: "microservices-architecture-patterns",
    coverUrl: "",
    discipline: "Software",
    categoryId: "cat-1",
    priceCents: 5900,
    status: BookStatus.PUBLISHED,
  },
  {
    id: "3",
    title: "Signals and Systems Engineering",
    slug: "signals-and-systems",
    coverUrl: "",
    discipline: "Electrical",
    categoryId: "cat-2",
    priceCents: 6900,
    status: BookStatus.PUBLISHED,
  },
  {
    id: "4",
    title: "Introduction to Flight Dynamics",
    slug: "flight-dynamics",
    coverUrl: "",
    discipline: "Aerospace",
    categoryId: "cat-3",
    priceCents: 8900,
    status: BookStatus.PUBLISHED,
  },
  {
    id: "5",
    title: "Structural Analysis & Design",
    slug: "structural-analysis-design",
    coverUrl: "",
    discipline: "Civil",
    categoryId: "cat-4",
    priceCents: 7900,
    status: BookStatus.PUBLISHED,
  },
  {
    id: "6",
    title: "Compiler Construction Foundations",
    slug: "compiler-construction",
    coverUrl: "",
    discipline: "Software",
    categoryId: "cat-1",
    priceCents: 3900,
    status: BookStatus.PUBLISHED,
  },
  {
    id: "7",
    title: "Control Systems Theory",
    slug: "control-systems",
    coverUrl: "",
    discipline: "Electrical",
    categoryId: "cat-2",
    priceCents: 7500,
    status: BookStatus.PUBLISHED,
  },
  {
    id: "8",
    title: "Fluid Mechanics for Engineers",
    slug: "fluid-mechanics",
    coverUrl: "",
    discipline: "Mechanical",
    categoryId: "cat-5",
    priceCents: 6500,
    status: BookStatus.PUBLISHED,
  },
];

const DISCIPLINES = ["All", "Software", "Electrical", "Mechanical", "Civil", "Aerospace", "Chemical Engineering"];

export default function CatalogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDiscipline, setSelectedDiscipline] = useState("All");

  const filteredBooks = MOCK_CATALOG.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.discipline.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDiscipline =
      selectedDiscipline === "All" || book.discipline.toLowerCase() === selectedDiscipline.toLowerCase();
    return matchesSearch && matchesDiscipline;
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#90E0EF]">
      <Navbar />

      <main className="flex-grow py-12 bg-[#90E0EF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center md:text-left md:flex md:items-center md:justify-between mb-12">
            <div>
              <h1 className="text-3xl font-extrabold text-[#03045E]">Library Catalog</h1>
              <p className="text-[#0077B6] mt-2">Discover state of the art textbooks and learn modern engineering.</p>
            </div>
            
            {/* Search Input */}
            <div className="mt-6 md:mt-0 relative max-w-sm w-full">
              <input
                type="text"
                placeholder="Search publications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#F8FDFF] border border-[#00B4D8]/30 focus:border-[#0077B6] rounded-xl px-4 py-2.5 text-sm text-[#03045E] focus:outline-none transition-colors"
              />
              <span className="absolute right-3.5 top-3 text-[#0077B6]">🔍</span>
            </div>
          </div>

          {/* Discipline Filters */}
          <div className="flex flex-wrap gap-2 mb-8 border-b border-[#00B4D8]/20 pb-6">
            {DISCIPLINES.map((discipline) => (
              <button
                key={discipline}
                onClick={() => setSelectedDiscipline(discipline)}
                className={`text-xs font-semibold px-4 py-2 rounded-full border transition-all ${
                  selectedDiscipline === discipline
                    ? "bg-[#0077B6] text-white border-[#0077B6]"
                    : "bg-[#F8FDFF] text-[#03045E] border-[#00B4D8]/20 hover:text-[#0077B6] hover:border-[#00B4D8]"
                }`}
              >
                {discipline}
              </button>
            ))}
          </div>

          {/* Catalog Grid */}
          {filteredBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-[#F8FDFF]/70 rounded-2xl border border-[#00B4D8]/20">
              <span className="text-5xl">📚</span>
              <h3 className="text-lg font-bold text-[#03045E] mt-4">No books found</h3>
              <p className="text-[#0077B6] text-sm mt-2">Try adjusting your filters or search keywords.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
