/**
 * lib/materials.ts
 * Type definitions dan utilities untuk Digital Library materials.
 */

export interface Material {
  id: string;
  title: string;
  description: string;
  category: string;
  author: string;
  thumbnail: string;
  file: string;
  fileType: "pdf" | "md" | "docx" | "txt";
  fileSizeBytes: number;
  fileSizeDisplay: string;
  date: string;
  tags: string[];
}

/** Semua kategori unik dari daftar materi */
export function getCategories(materials: Material[]): string[] {
  const cats = new Set(materials.map((m) => m.category));
  return ["Semua", ...Array.from(cats).sort()];
}

/** Semua tahun unik dari daftar materi */
export function getYears(materials: Material[]): string[] {
  const years = new Set(materials.map((m) => m.date?.slice(0, 4)).filter(Boolean));
  return ["Semua", ...Array.from(years).sort((a, b) => Number(b) - Number(a))];
}

/** Semua jenis file unik */
export function getFileTypes(materials: Material[]): string[] {
  const types = new Set(materials.map((m) => m.fileType?.toUpperCase()));
  return ["Semua", ...Array.from(types).sort()];
}

/** Format bytes ke tampilan human-readable */
export function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Mendapatkan basePath dari Next.js config (untuk GitHub Pages) */
export function getBasePath(): string {
  return process.env.NEXT_PUBLIC_BASE_PATH ?? "";
}

/** Membangun URL asset yang benar dengan basePath GitHub Pages */
export function assetUrl(filePath: string): string {
  const base = getBasePath();
  if (!filePath) return filePath;
  // Hindari double slash
  const cleanPath = filePath.startsWith("/") ? filePath : `/${filePath}`;
  return `${base}${cleanPath}`;
}

/** Ikon untuk setiap tipe file */
export function fileTypeIcon(fileType: string): string {
  switch (fileType?.toLowerCase()) {
    case "pdf":
      return "📄";
    case "md":
      return "📝";
    case "docx":
      return "📃";
    case "txt":
      return "📋";
    default:
      return "📁";
  }
}

/** Warna badge untuk kategori */
export function categoryColor(category: string): string {
  const map: Record<string, string> = {
    "AI & Machine Learning": "bg-purple-100 text-purple-700 border-purple-200",
    "Matematika": "bg-blue-100 text-blue-700 border-blue-200",
    "Pemrograman": "bg-green-100 text-green-700 border-green-200",
    "Teknik Mesin": "bg-orange-100 text-orange-700 border-orange-200",
    "Teknik Elektro": "bg-yellow-100 text-yellow-700 border-yellow-200",
    "Teknik Sipil": "bg-stone-100 text-stone-700 border-stone-200",
    "Teknik Kimia": "bg-teal-100 text-teal-700 border-teal-200",
    "Data Science": "bg-indigo-100 text-indigo-700 border-indigo-200",
    "Jaringan": "bg-cyan-100 text-cyan-700 border-cyan-200",
    "General": "bg-[#CAF0F8] text-[#0077B6] border-[#00B4D8]/30",
  };
  return map[category] ?? "bg-[#CAF0F8] text-[#0077B6] border-[#00B4D8]/30";
}
