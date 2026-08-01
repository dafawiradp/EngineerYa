"use client";

import Link from "next/link";
import { useState } from "react";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#90E0EF]/90 border-b border-[#00B4D8]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold bg-gradient-to-r from-[#0077B6] via-[#00B4D8] to-[#03045E] bg-clip-text text-transparent">
                EngineerYa
              </span>
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-6">
                <Link href="/books" className="text-[#03045E] hover:text-[#0077B6] px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Public Library
                </Link>
                <Link href="/materials" className="text-[#03045E] hover:text-[#0077B6] px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Free Materials
                </Link>
                <Link href="/#roadmap" className="text-[#03045E] hover:text-[#0077B6] px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Roadmap
                </Link>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/materials" className="text-[#03045E] hover:text-[#0077B6] px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Open Access
            </Link>
            <Link href="/books" className="bg-[#0077B6] hover:bg-[#00B4D8] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg shadow-[#0077B6]/20 transition-all hover:scale-105">
              Start Reading
            </Link>
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-[#03045E] hover:text-[#0077B6] hover:bg-[#CAF0F8] focus:outline-none transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#F8FDFF] border-b border-[#00B4D8]/30 px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            href="/books"
            className="text-slate-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Public Library
          </Link>
          <Link
            href="/materials"
            className="text-slate-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Free Materials
          </Link>
          <Link
            href="/#roadmap"
            className="text-slate-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Roadmap
          </Link>
          <div className="pt-4 border-t border-slate-800 flex flex-col space-y-2">
            <Link
              href="/materials"
              className="text-[#03045E] hover:text-[#0077B6] block px-3 py-2 rounded-md text-base font-medium transition-colors text-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Open Access
            </Link>
            <Link
              href="/books"
              className="bg-[#0077B6] hover:bg-[#00B4D8] text-white block px-3 py-2 rounded-md text-base font-medium text-center transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Start Reading
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
