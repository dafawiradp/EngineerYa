"use client";

import Link from "next/link";
import { useState } from "react";

export function ReaderPreviewClient({ bookId }: { bookId: string }) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 15;

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#90E0EF] text-[#03045E] select-none">
      <header className="h-14 bg-[#F8FDFF] border-b border-[#00B4D8]/20 px-4 flex items-center justify-between z-10">
        <div className="flex items-center space-x-4">
          <Link href="/books" className="text-sm font-semibold text-[#0077B6] hover:text-[#03045E] transition-colors flex items-center space-x-1">
            <span>&larr;</span>
            <span className="hidden sm:inline">Close Reader</span>
          </Link>
          <span className="text-[#00B4D8]">|</span>
          <h2 className="text-sm font-bold text-[#03045E] max-w-xs truncate">
            Book ID: {bookId} (Preview Mode)
          </h2>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ◀
          </button>
          <span className="text-xs font-semibold text-[#03045E]">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ▶
          </button>
        </div>

        <div>
          <button
            onClick={() => alert("Checkouts / Purchases required to unlock full download offline access.")}
            className="bg-[#0077B6] hover:bg-[#00B4D8] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
          >
            Unlock Full
          </button>
        </div>
      </header>

      <div className="flex-grow overflow-auto p-4 md:p-8 flex items-center justify-center relative bg-[#90E0EF]">
        <div className="relative aspect-[3/4] w-full max-w-xl bg-white text-[#03045E] rounded-lg shadow-2xl p-8 md:p-12 overflow-hidden flex flex-col justify-between select-none pointer-events-none">
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-3 opacity-[0.06] select-none pointer-events-none rotate-[-25deg] scale-125">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="text-center font-extrabold text-sm tracking-widest text-[#070A13] uppercase flex items-center justify-center">
                demo_user@engineerya.com - TRACEID_{bookId}
              </div>
            ))}
          </div>

          <div className="border-b border-[#00B4D8]/20 pb-3 flex justify-between items-center text-[10px] text-[#0077B6] font-bold uppercase tracking-wider">
            <span>EngineerYa Academic Preview</span>
            <span>Section {Math.ceil(currentPage / 3)}</span>
          </div>

          <div className="my-6 flex-grow">
            <h3 className="text-lg font-black text-[#03045E] mb-4">
              Chapter {Math.ceil(currentPage / 5)}: Core Engineering Foundations
            </h3>
            <p className="text-xs leading-relaxed text-[#03045E]/80 mb-3">
              This chapter explores the algorithmic complexities and architectural behaviors of high-reliability systems. We analyze throughput characteristics, dynamic page compression layers, and memory allocation layouts in modern processing units.
            </p>
            <p className="text-xs leading-relaxed text-[#03045E]/80">
              When scaling concurrent workloads, maintaining data structure consistency is critical. Index structures like B-Trees and LSM Trees manage updates differently, trading write amplification for read performance as operational density scales. Refer to standard benchmarks in subsequent sections for empirical data.
            </p>
          </div>

          <div className="border-t border-[#00B4D8]/20 pt-3 flex justify-between items-center text-[9px] text-[#0077B6] font-medium">
            <span>Page {currentPage} of {totalPages}</span>
            <span className="italic text-[#03045E]/70">Watermarked Delivery Session ID: WS_{bookId.toString().substring(0, 8)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
