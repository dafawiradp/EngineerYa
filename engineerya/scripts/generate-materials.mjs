/** 
 * generate-materials.mjs
 *
 * Auto-scan /apps/web/public/materials/ dan generate materials.json.
 * Jalankan sebelum build: node scripts/generate-materials.mjs
 *
 * Cara pakai:
 *   1. Taruh file PDF/MD ke apps/web/public/materials/
 *   2. Jalankan: node scripts/generate-materials.mjs
 *   3. File materials.json otomatis di-update
 *   4. Build seperti biasa: npm run build
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MATERIALS_DIR = path.resolve(__dirname, "../apps/web/public/materials");
const OUTPUT_FILE = path.resolve(MATERIALS_DIR, "materials.json");
const EXISTING_INDEX = path.resolve(MATERIALS_DIR, "index.json");

// Supported file types
const SUPPORTED_EXTENSIONS = new Set([".pdf", ".md", ".docx", ".txt"]);

// Category detection berdasarkan nama file / folder
function detectCategory(filename) {
  const name = filename.toLowerCase();
  if (name.includes("ai") || name.includes("machine-learning") || name.includes("ml") || name.includes("deep-learning")) return "AI & Machine Learning";
  if (name.includes("kalkulus") || name.includes("calculus") || name.includes("matematika") || name.includes("math")) return "Matematika";
  if (name.includes("python") || name.includes("javascript") || name.includes("java") || name.includes("programming")) return "Pemrograman";
  if (name.includes("mesin") || name.includes("mechanical") || name.includes("industri")) return "Teknik Mesin";
  if (name.includes("elektro") || name.includes("electrical") || name.includes("circuit")) return "Teknik Elektro";
  if (name.includes("sipil") || name.includes("civil") || name.includes("struktur")) return "Teknik Sipil";
  if (name.includes("kimia") || name.includes("chemical") || name.includes("process")) return "Teknik Kimia";
  if (name.includes("data") || name.includes("database") || name.includes("sql")) return "Data Science";
  if (name.includes("network") || name.includes("jaringan") || name.includes("cisco")) return "Jaringan";
  return "General";
}

// Buat slug dari nama file
function toSlug(filename) {
  return filename
    .replace(/\.[^.]+$/, "") // hapus extension
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Buat judul yang lebih readable dari nama file
function toTitle(filename) {
  return filename
    .replace(/\.[^.]+$/, "") // hapus extension
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Format bytes ke string readable
function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Baca existing index.json sebagai sumber metadata manual
function loadExistingMetadata() {
  const existingMap = new Map();

  // Coba baca index.json (metadata manual)
  if (fs.existsSync(EXISTING_INDEX)) {
    try {
      const data = JSON.parse(fs.readFileSync(EXISTING_INDEX, "utf-8"));
      if (Array.isArray(data)) {
        for (const item of data) {
          if (item.id) existingMap.set(item.id, item);
          // Juga index by file basename
          if (item.file) {
            const basename = path.basename(item.file, path.extname(item.file)).toLowerCase();
            existingMap.set(basename, item);
          }
        }
      }
    } catch (e) {
      console.warn("Warning: could not parse index.json:", e.message);
    }
  }

  // Coba baca materials.json yang sudah ada
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(OUTPUT_FILE, "utf-8"));
      if (Array.isArray(data)) {
        for (const item of data) {
          if (item.id && !existingMap.has(item.id)) {
            existingMap.set(item.id, item);
          }
        }
      }
    } catch {
      // ignore
    }
  }

  return existingMap;
}

function main() {
  if (!fs.existsSync(MATERIALS_DIR)) {
    console.error(`Directory not found: ${MATERIALS_DIR}`);
    process.exit(1);
  }

  const existingMetadata = loadExistingMetadata();
  const entries = fs.readdirSync(MATERIALS_DIR);

  const materials = [];

  for (const filename of entries) {
    // Skip JSON files dan hidden files
    if (filename.startsWith(".") || filename.endsWith(".json")) continue;

    const fullPath = path.join(MATERIALS_DIR, filename);
    const stat = fs.statSync(fullPath);

    // Skip directories dan file yang tidak didukung
    if (stat.isDirectory()) continue;
    const ext = path.extname(filename).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.has(ext)) continue;

    const slug = toSlug(filename);
    const fileType = ext.replace(".", "");
    const fileSizeBytes = stat.size;

    // Cek apakah ada metadata manual yang cocok
    const existing =
      existingMetadata.get(slug) ||
      existingMetadata.get(filename.replace(/\.[^.]+$/, "").toLowerCase()) ||
      null;

    const material = {
      id: existing?.id || slug,
      title: existing?.title || toTitle(filename),
      description: existing?.description || `Materi ${fileType.toUpperCase()} — ${toTitle(filename)}`,
      category: existing?.category || detectCategory(filename),
      author: existing?.author || "EngineerYa Team",
      thumbnail: existing?.thumbnail || "",
      file: `/materials/${filename}`,
      fileType,
      fileSizeBytes,
      fileSizeDisplay: formatBytes(fileSizeBytes),
      date: existing?.date || stat.mtime.toISOString().split("T")[0],
      tags: existing?.tags || [fileType, detectCategory(filename).toLowerCase()],
    };

    materials.push(material);
    console.log(`  ✓ ${filename} → ${material.id} (${material.fileSizeDisplay})`);
  }

  // Sort by date descending (terbaru dulu)
  materials.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(materials, null, 2), "utf-8");

  console.log(`\n✅ Generated ${materials.length} material(s) → ${OUTPUT_FILE}`);

  if (materials.length === 0) {
    console.log("\n💡 Tip: Taruh file PDF/MD ke folder apps/web/public/materials/ lalu jalankan script ini lagi.");
  }
}

console.log("🔍 Scanning materials folder...");
main();
