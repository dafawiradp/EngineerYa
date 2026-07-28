"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Navbar } from "../../../components/Navbar";
import { Footer } from "../../../components/Footer";

// Mock database to match slugs
const MOCK_BOOKS_DETAILS = [
  {
    id: "1",
    title: "Modern Database Internals",
    slug: "modern-database-internals",
    coverUrl: "",
    discipline: "Software",
    description: "An in-depth guide to storage engines, page layouts, index structures, concurrency control, and transactions in high-performance transactional and analytical databases.",
    authorNames: ["Alex Petrov", "Martin Kleppmann"],
    pageCount: 384,
    publishedAt: "2024-03-12",
    priceCents: 4900,
  },
  {
    id: "2",
    title: "Microservices Architecture & Patterns",
    slug: "microservices-architecture-patterns",
    coverUrl: "",
    discipline: "Software",
    description: "Design robust, scalable distributed systems using advanced architectural patterns: CQRS, Event Sourcing, Saga orchestrations, API Gateways, and service meshes.",
    authorNames: ["Chris Richardson", "Sam Newman"],
    pageCount: 512,
    publishedAt: "2023-08-25",
    priceCents: 5900,
  },
  {
    id: "3",
    title: "Signals and Systems Engineering",
    slug: "signals-and-systems",
    coverUrl: "",
    discipline: "Electrical",
    description: "A mathematical framework for analyzing continuous-time and discrete-time signals, linear time-invariant systems, Fourier transforms, Laplace transforms, and Z-transforms.",
    authorNames: ["Alan V. Oppenheim", "Ronald W. Schafer"],
    pageCount: 420,
    publishedAt: "2022-11-05",
    priceCents: 6900,
  },
  {
    id: "4",
    title: "Introduction to Flight Dynamics",
    slug: "flight-dynamics",
    coverUrl: "",
    discipline: "Aerospace",
    description: "A complete reference manual for aircraft aerodynamic stability, performance, flight safety configurations, and structural control design systems.",
    authorNames: ["Robert C. Nelson"],
    pageCount: 450,
    publishedAt: "2021-04-14",
    priceCents: 8900,
  },
  {
    id: "5",
    title: "Structural Analysis & Design",
    slug: "structural-analysis-design",
    coverUrl: "",
    discipline: "Civil",
    description: "Complete study of structural engineering designs, mechanics, structural members, shear walls, concrete framing, and earthquake-resistant code configurations.",
    authorNames: ["Russell C. Hibbeler"],
    pageCount: 610,
    publishedAt: "2023-01-20",
    priceCents: 7900,
  },
  {
    id: "6",
    title: "Compiler Construction Foundations",
    slug: "compiler-construction",
    coverUrl: "",
    discipline: "Software",
    description: "Learn how to build a complete compiler from scratch: lexical analysis, AST parsing, symbol tables, intermediate representations, register allocation, and code generation.",
    authorNames: ["Alfred V. Aho", "Jeffrey D. Ullman"],
    pageCount: 400,
    publishedAt: "2022-06-30",
    priceCents: 3900,
  },
  {
    id: "7",
    title: "Control Systems Theory",
    slug: "control-systems",
    coverUrl: "",
    discipline: "Electrical",
    description: "State-space modeling, feedback loops, root locus design, Bode plots, Nyquist stability criterion, and digital controllers for automated machinery.",
    authorNames: ["Katsuhiko Ogata"],
    pageCount: 480,
    publishedAt: "2021-09-15",
    priceCents: 7500,
  },
  {
    id: "8",
    title: "Fluid Mechanics for Engineers",
    slug: "fluid-mechanics",
    coverUrl: "",
    discipline: "Mechanical",
    description: "Statics, dynamics, boundary layers, pipe flow friction, Navier-Stokes equations, and computational fluid simulation benchmarks.",
    authorNames: ["Frank M. White"],
    pageCount: 520,
    publishedAt: "2023-05-18",
    priceCents: 6500,
  },
];

export default function BookDetailPage() {
  const { slug } = useParams();
  const book = MOCK_BOOKS_DETAILS.find((b) => b.slug === slug);

  if (!book) {
    return (
      <div className="flex flex-col min-h-screen bg-[#0B0F19]">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
          <span className="text-4xl mb-4">📖</span>
          <h2 className="text-2xl font-bold text-white">Book not found</h2>
          <p className="text-slate-400 mt-2">The textbook you requested does not exist in our catalog.</p>
          <Link href="/books" className="mt-6 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm transition-all">
            Return to Catalog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const formattedPrice = (book.priceCents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow py-12 md:py-20 bg-[#0B0F19] relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.08),transparent_50%)] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link href="/books" className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold mb-8 inline-flex items-center space-x-1">
            <span>&larr;</span>
            <span>Back to Catalog</span>
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 mt-4">
            {/* Book Cover Banner */}
            <div className="md:col-span-4">
              <div className="relative aspect-[3/4] w-full bg-slate-900 rounded-2xl border border-slate-800/80 overflow-hidden flex items-center justify-center shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/45 to-slate-950 flex flex-col items-center justify-center p-6 text-center">
                  <span className="text-6xl mb-4">📚</span>
                  <span className="text-[10px] tracking-widest font-extrabold text-slate-500 uppercase">ENGINEERYA TEXTBOOK</span>
                  <h2 className="text-xl font-extrabold text-white mt-4 line-clamp-3 px-2">{book.title}</h2>
                </div>
              </div>
            </div>

            {/* Book Meta Details */}
            <div className="md:col-span-8 flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full font-bold">
                  {book.discipline}
                </span>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-6 leading-tight">
                  {book.title}
                </h1>

                <p className="text-slate-400 mt-2 text-sm">
                  by <span className="text-slate-200 font-semibold">{book.authorNames.join(", ")}</span>
                </p>

                <div className="flex flex-wrap gap-x-8 gap-y-2 mt-4 text-xs text-slate-400 border-y border-slate-900 py-3.5 my-6">
                  <div>
                    Pages: <span className="text-slate-200 font-semibold">{book.pageCount} pages</span>
                  </div>
                  <div>
                    Published: <span className="text-slate-200 font-semibold">{book.publishedAt}</span>
                  </div>
                  <div>
                    Platform: <span className="text-slate-200 font-semibold">Web & Offline PDF</span>
                  </div>
                </div>

                <div className="text-slate-300 leading-relaxed text-sm md:text-base">
                  <p>{book.description}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center gap-4">
                <div className="text-left w-full sm:w-auto">
                  <span className="text-xs text-slate-500 uppercase block tracking-wider font-semibold">PRICE</span>
                  <span className="text-2xl font-black text-indigo-400">{formattedPrice}</span>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto sm:ml-auto">
                  <Link
                    href={`/reader/${book.id}`}
                    className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-3 rounded-xl text-center font-medium border border-slate-750 transition-all duration-300"
                  >
                    Read Preview Pages
                  </Link>
                  <button
                    onClick={() => alert(`Initiating payment token retrieval for: ${book.title}. Checkout popup loaded via Midtrans Snap!`)}
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-medium shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all hover:scale-102"
                  >
                    Buy Textbook
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
