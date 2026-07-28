import Link from "next/link";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { BookCard } from "../components/BookCard";
import { BookStatus, BookSummaryDto } from "@engineerya/shared-types";

const FEATURED_BOOKS: BookSummaryDto[] = [
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
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 md:pt-28 md:pb-36 bg-gradient-to-b from-indigo-950/10 via-[#0B0F19] to-[#0B0F19]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.15),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(168,85,247,0.1),transparent_50%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full mb-6 hover:bg-indigo-500/20 transition-all cursor-pointer">
            <span className="text-xs font-semibold text-indigo-400">Version 0.1.0 Release</span>
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            The Digital Library for <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Modern Engineers
            </span>
          </h1>
          
          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Discover, read, and own industry-standard engineering textbooks and learning resources. Highly secure watermarked reader, progress syncing, and fully offline-capable downloads.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/books" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 rounded-xl font-medium shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all hover:scale-105">
              Explore Library Catalog
            </Link>
            <Link href="#pricing" className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 px-8 py-3.5 rounded-xl font-medium border border-slate-750 hover:border-slate-600 transition-all duration-300">
              Membership Plans
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="py-20 bg-[#0B0F19] border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Featured Textbooks</h2>
              <p className="text-slate-400 mt-2">Handpicked publications from top authors across multiple disciplines.</p>
            </div>
            <Link href="/books" className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold mt-4 md:mt-0 flex items-center space-x-1 hover:underline">
              <span>View all books</span>
              <span>&rarr;</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURED_BOOKS.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing/Memberships Section */}
      <section id="pricing" className="py-20 bg-[#080B12] border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Simple, Predictable Memberships</h2>
            <p className="text-slate-400 mt-4 text-lg">Choose a plan that fits your study pace. Save up to 20% on annual billing cycles.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Student Plan */}
            <div className="bg-[#0F1424] rounded-2xl border border-slate-800 p-8 flex flex-col h-full hover:border-slate-700 transition-colors">
              <h3 className="text-lg font-bold text-slate-200">Student Access</h3>
              <p className="text-slate-400 text-xs mt-1">Perfect for engineering students</p>
              <div className="my-6">
                <span className="text-4xl font-extrabold text-white">$9.99</span>
                <span className="text-slate-400 text-sm"> / month</span>
              </div>
              <ul className="space-y-4 mb-8 text-sm text-slate-350">
                <li className="flex items-center space-x-2">
                  <span className="text-indigo-400">✓</span>
                  <span>Unlimited reading of all books</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-indigo-400">✓</span>
                  <span>Unlimited bookmarking & notes</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-indigo-400">✓</span>
                  <span>Watermarked screen streaming</span>
                </li>
                <li className="text-slate-500 flex items-center space-x-2">
                  <span>✗</span>
                  <span className="line-through">Offline PDF downloads</span>
                </li>
              </ul>
              <button className="w-full bg-slate-800 hover:bg-slate-755 border border-slate-700 hover:border-slate-600 text-white py-2.5 rounded-xl font-medium mt-auto transition-colors">
                Subscribe
              </button>
            </div>

            {/* Professional Plan */}
            <div className="bg-[#0F1424] rounded-2xl border-2 border-indigo-600 p-8 flex flex-col h-full relative shadow-xl shadow-indigo-600/5">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs uppercase tracking-wider font-extrabold px-3 py-1 rounded-full">
                Most Popular
              </div>
              <h3 className="text-lg font-bold text-slate-200 mt-2">Professional</h3>
              <p className="text-slate-400 text-xs mt-1">For practicing engineers & professionals</p>
              <div className="my-6">
                <span className="text-4xl font-extrabold text-white">$24.99</span>
                <span className="text-slate-400 text-sm"> / month</span>
              </div>
              <ul className="space-y-4 mb-8 text-sm text-slate-350">
                <li className="flex items-center space-x-2">
                  <span className="text-indigo-400">✓</span>
                  <span>Unlimited reading of all books</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-indigo-400">✓</span>
                  <span>Unlimited bookmarking & notes</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-indigo-400">✓</span>
                  <span>Watermarked screen streaming</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-indigo-400">✓</span>
                  <span>2 offline PDF downloads per month</span>
                </li>
              </ul>
              <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl font-medium mt-auto transition-all shadow-lg shadow-indigo-600/20 hover:scale-[1.02]">
                Subscribe
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-[#0F1424] rounded-2xl border border-slate-800 p-8 flex flex-col h-full hover:border-slate-700 transition-colors">
              <h3 className="text-lg font-bold text-slate-200">Enterprise</h3>
              <p className="text-slate-400 text-xs mt-1">For university departments & companies</p>
              <div className="my-6">
                <span className="text-4xl font-extrabold text-white">Custom</span>
              </div>
              <ul className="space-y-4 mb-8 text-sm text-slate-350">
                <li className="flex items-center space-x-2">
                  <span className="text-indigo-400">✓</span>
                  <span>Multi-seat volume licensing</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-indigo-400">✓</span>
                  <span>Shared bookmarking & annotations</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-indigo-400">✓</span>
                  <span>SAML SSO integrations</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-indigo-400">✓</span>
                  <span>Bulk PDF downloads entitlement</span>
                </li>
              </ul>
              <button className="w-full bg-slate-800 hover:bg-slate-755 border border-slate-700 hover:border-slate-600 text-white py-2.5 rounded-xl font-medium mt-auto transition-colors">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Status Section */}
      <section id="roadmap" className="py-20 bg-[#0B0F19] border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white">Development Roadmap</h2>
            <p className="text-slate-400 mt-4">We are actively building the ultimate digital learning platform for engineers.</p>
          </div>

          <div className="relative max-w-4xl mx-auto pl-8 sm:pl-0">
            {/* Timeline Vertical Line */}
            <div className="hidden sm:block absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-slate-800" />

            <div className="space-y-12">
              {/* Item 1 */}
              <div className="relative flex flex-col sm:flex-row items-center">
                <div className="absolute left-0 sm:left-1/2 transform -translate-x-1/2 w-4 h-4 bg-indigo-500 border border-indigo-400 rounded-full z-10" />
                <div className="w-full sm:w-1/2 sm:pr-12 text-left sm:text-right">
                  <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Phase 1-4</span>
                  <h4 className="text-lg font-bold text-white mt-1">Foundational Architecture</h4>
                  <p className="text-sm text-slate-400 mt-2">Monorepo scaffolding, Clean Architecture base, OAuth identity layer, and Cloudflare R2 object storage file upload pipeline.</p>
                </div>
                <div className="hidden sm:block w-1/2" />
              </div>

              {/* Item 2 */}
              <div className="relative flex flex-col sm:flex-row items-center">
                <div className="absolute left-0 sm:left-1/2 transform -translate-x-1/2 w-4 h-4 bg-indigo-500 border border-indigo-400 rounded-full z-10" />
                <div className="hidden sm:block w-1/2" />
                <div className="w-full sm:w-1/2 sm:pl-12 text-left">
                  <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Phase 5-7</span>
                  <h4 className="text-lg font-bold text-white mt-1">Watermarked Reader & Sync</h4>
                  <p className="text-sm text-slate-400 mt-2">Dynamic diagonally tiled page-level JPG watermarking, progress syncing APIs, and reader bookmarks support.</p>
                </div>
              </div>

              {/* Item 3 */}
              <div className="relative flex flex-col sm:flex-row items-center">
                <div className="absolute left-0 sm:left-1/2 transform -translate-x-1/2 w-4 h-4 bg-indigo-500 border border-indigo-400 rounded-full z-10" />
                <div className="w-full sm:w-1/2 sm:pr-12 text-left sm:text-right">
                  <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Phase 8-9</span>
                  <h4 className="text-lg font-bold text-white mt-1">Commerce & Memberships</h4>
                  <p className="text-sm text-slate-400 mt-2">Midtrans payment gateway integration, automatic billing webhooks, subscription lifecycle managers, and active Entitlement guards.</p>
                </div>
                <div className="hidden sm:block w-1/2" />
              </div>

              {/* Item 4 */}
              <div className="relative flex flex-col sm:flex-row items-center">
                <div className="absolute left-0 sm:left-1/2 transform -translate-x-1/2 w-4 h-4 bg-emerald-500 border border-emerald-400 rounded-full z-10 animate-pulse" />
                <div className="hidden sm:block w-1/2" />
                <div className="w-full sm:w-1/2 sm:pl-12 text-left">
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Phase 10-12 (Active)</span>
                  <h4 className="text-lg font-bold text-white mt-1">Admin Dashboard & Public Launch</h4>
                  <p className="text-sm text-slate-400 mt-2">Mutating request auditing, detailed aggregate revenue overview, comprehensive unit test suite, and open source publication readiness.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
