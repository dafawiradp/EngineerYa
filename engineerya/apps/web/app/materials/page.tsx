"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { MaterialCard } from "../../components/MaterialCard";
import { Material, getCategories, getYears, getFileTypes, assetUrl } from "../../lib/materials";

type SortOption = "terbaru" | "terlama" | "az" | "za";

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const [year, setYear] = useState("Semua");
  const [fileType, setFileType] = useState("Semua");
  const [sort, setSort] = useState<SortOption>("terbaru");

  // Fetch materials.json yang di-generate saat build
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Coba materials.json dulu (auto-generated), fallback ke index.json
        const urls = [
          assetUrl("/materials/materials.json"),
          assetUrl("/materials/index.json"),
        ];

        let data: Material[] | null = null;
        for (const url of urls) {
          try {
            const res = await fetch(url, { cache: "no-store" });
            if (res.ok) {
              const json = await res.json();
              if (Array.isArray(json)) {
                data = json;
                break;
              }
            }
          } catch {
            // try next url
          }
        }

        if (data && data.length > 0) {
          setMaterials(data);
        } else {
          setMaterials([]);
          setError("Belum ada materi yang tersedia. Tambahkan file ke folder /public/materials/ lalu jalankan generate-materials.mjs.");
        }
      } catch (e) {
        setError("Gagal memuat daftar materi.");
        setMaterials([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const categories = useMemo(() => getCategories(materials), [materials]);
  const years = useMemo(() => getYears(materials), [materials]);
  const fileTypes = useMemo(() => getFileTypes(materials), [materials]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    let result = materials.filter((m) => {
      const matchSearch =
        !q ||
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.author.toLowerCase().includes(q) ||
        m.tags?.some((t) => t.toLowerCase().includes(q));

      const matchCategory = category === "Semua" || m.category === category;
      const matchYear = year === "Semua" || m.date?.startsWith(year);
      const matchType = fileType === "Semua" || m.fileType?.toUpperCase() === fileType;

      return matchSearch && matchCategory && matchYear && matchType;
    });

    // Sorting
    result = [...result].sort((a, b) => {
      if (sort === "terbaru") return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sort === "terlama") return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sort === "az") return a.title.localeCompare(b.title, "id");
      if (sort === "za") return b.title.localeCompare(a.title, "id");
      return 0;
    });

    return result;
  }, [materials, search, category, year, fileType, sort]);

  const resetFilters = useCallback(() => {
    setSearch("");
    setCategory("Semua");
    setYear("Semua");
    setFileType("Semua");
    setSort("terbaru");
  }, []);

  const hasActiveFilters = search || category !== "Semua" || year !== "Semua" || fileType !== "Semua" || sort !== "terbaru";

  return (
    <div className="flex flex-col min-h-screen bg-[#90E0EF]">
      <Navbar />
      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="text-center mb-10">
            <p className="text-sm uppercase tracking-[0.3em] text-[#0077B6] font-semibold">DIGITAL LIBRARY</p>
            <h1 className="text-4xl md:text-5xl font-black text-[#03045E] mt-3">
              Materi Teknik Gratis
            </h1>
            <p className="mt-4 text-lg text-[#0077B6] max-w-2xl mx-auto">
              Semua materi dapat dibaca langsung di browser. Tidak perlu login, tidak perlu download.
            </p>
            {!loading && (
              <p className="mt-2 text-sm text-[#03045E]/60">
                {materials.length} materi tersedia
              </p>
            )}
          </div>

          {/* Search bar */}
          <div className="mb-6">
            <div className="relative max-w-2xl mx-auto">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0077B6]/50 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari judul, kategori, penulis, atau topik..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-[#00B4D8]/20 bg-[#F8FDFF] text-[#03045E] placeholder-[#0077B6]/40 text-sm outline-none focus:ring-2 focus:ring-[#0077B6]/30 transition-all"
              />
            </div>
          </div>

          {/* Filter bar */}
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-[#F8FDFF] rounded-2xl border border-[#00B4D8]/20 px-4 py-3">
            <div className="flex flex-wrap gap-2 items-center">
              {/* Category filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-[#03045E]/60 whitespace-nowrap">Kategori:</span>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`text-xs px-3 py-1.5 rounded-full font-semibold border transition-all ${
                        category === cat
                          ? "bg-[#0077B6] border-[#0077B6] text-white"
                          : "border-[#00B4D8]/30 text-[#0077B6] hover:border-[#0077B6]"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              {/* Year filter */}
              {years.length > 2 && (
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="text-xs px-3 py-1.5 rounded-xl border border-[#00B4D8]/30 bg-white text-[#0077B6] font-semibold outline-none focus:ring-2 focus:ring-[#0077B6]/20"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>{y === "Semua" ? "Semua Tahun" : y}</option>
                  ))}
                </select>
              )}

              {/* File type filter */}
              {fileTypes.length > 2 && (
                <select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                  className="text-xs px-3 py-1.5 rounded-xl border border-[#00B4D8]/30 bg-white text-[#0077B6] font-semibold outline-none focus:ring-2 focus:ring-[#0077B6]/20"
                >
                  {fileTypes.map((t) => (
                    <option key={t} value={t}>{t === "Semua" ? "Semua Tipe" : t}</option>
                  ))}
                </select>
              )}

              {/* Sort */}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="text-xs px-3 py-1.5 rounded-xl border border-[#00B4D8]/30 bg-white text-[#0077B6] font-semibold outline-none focus:ring-2 focus:ring-[#0077B6]/20"
              >
                <option value="terbaru">Terbaru</option>
                <option value="terlama">Terlama</option>
                <option value="az">A–Z</option>
                <option value="za">Z–A</option>
              </select>

              {/* Reset filters */}
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-xs px-3 py-1.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 font-semibold transition-all"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-[#F8FDFF] rounded-2xl border border-[#00B4D8]/20 overflow-hidden animate-pulse">
                  <div className="aspect-video bg-[#CAF0F8]" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 bg-[#CAF0F8] rounded-full w-1/3" />
                    <div className="h-4 bg-[#CAF0F8] rounded-full w-4/5" />
                    <div className="h-3 bg-[#CAF0F8] rounded-full w-full" />
                    <div className="h-3 bg-[#CAF0F8] rounded-full w-2/3" />
                    <div className="flex gap-2 pt-2">
                      <div className="h-9 bg-[#CAF0F8] rounded-xl flex-1" />
                      <div className="h-9 bg-[#CAF0F8] rounded-xl w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error && materials.length === 0 ? (
            <div className="rounded-2xl border border-[#00B4D8]/20 bg-[#F8FDFF] p-10 text-center">
              <p className="text-4xl mb-4">📂</p>
              <h2 className="text-xl font-bold text-[#03045E] mb-2">Belum Ada Materi</h2>
              <p className="text-[#0077B6] text-sm max-w-md mx-auto">{error}</p>
              <div className="mt-6 bg-[#CAF0F8] rounded-xl p-4 text-left max-w-lg mx-auto">
                <p className="text-xs font-bold text-[#03045E] mb-2">Cara menambahkan materi:</p>
                <ol className="text-xs text-[#0077B6] space-y-1 list-decimal list-inside">
                  <li>Taruh file PDF/MD ke folder <code className="bg-white px-1 rounded">apps/web/public/materials/</code></li>
                  <li>Jalankan: <code className="bg-white px-1 rounded">node scripts/generate-materials.mjs</code></li>
                  <li>Commit dan push ke GitHub</li>
                  <li>GitHub Actions otomatis build dan deploy</li>
                </ol>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-[#00B4D8]/20 bg-[#F8FDFF] p-10 text-center">
              <p className="text-4xl mb-4">🔍</p>
              <h2 className="text-xl font-bold text-[#03045E] mb-2">Tidak ditemukan</h2>
              <p className="text-[#0077B6] text-sm">Tidak ada materi yang cocok dengan pencarian &ldquo;{search}&rdquo;.</p>
              <button onClick={resetFilters} className="mt-4 text-sm font-semibold text-[#0077B6] underline hover:text-[#03045E]">
                Hapus filter
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-[#03045E]/60 mb-4">
                Menampilkan {filtered.length} dari {materials.length} materi
              </p>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((material) => (
                  <MaterialCard key={material.id} material={material} />
                ))}
              </div>
            </>
          )}

          {/* Info banner */}
          <div className="mt-16 rounded-2xl border border-[#00B4D8]/20 bg-[#F8FDFF] p-8 text-center">
            <h2 className="text-xl font-bold text-[#03045E]">Cara Menambahkan Materi Baru</h2>
            <p className="mt-2 text-sm text-[#0077B6] max-w-xl mx-auto">
              Cukup taruh file PDF, Markdown, atau DOCX ke folder{" "}
              <code className="bg-[#CAF0F8] px-1.5 py-0.5 rounded text-[#03045E] text-xs">/public/materials/</code>{" "}
              di repository. Setelah di-push, GitHub Actions akan otomatis generate metadata dan deploy website.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
