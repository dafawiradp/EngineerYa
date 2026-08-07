import { MaterialReaderClient } from "./MaterialReaderClient";

// Untuk static export GitHub Pages: generate halaman dari materials.json / index.json
// Menggunakan dynamic import dengan type assertion untuk menghindari issues saat JSON kosong
export async function generateStaticParams() {
  const [materialsJson, indexJson] = await Promise.all([
    import("../../../public/materials/materials.json").then((m) => m.default as { id: string }[]),
    import("../../../public/materials/index.json").then((m) => m.default as { id: string }[]),
  ]);

  // Gabungkan keduanya, hilangkan duplikat
  const allMaterials = [...(Array.isArray(materialsJson) ? materialsJson : []), ...(Array.isArray(indexJson) ? indexJson : [])];
  const seen = new Set<string>();
  const unique = allMaterials.filter((m) => {
    if (!m.id || seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });

  if (unique.length === 0) {
    // Fallback agar build tidak menghasilkan 0 halaman
    return [{ id: "engineering-study-guide" }];
  }

  return unique.map((m) => ({ id: m.id }));
}

interface PageProps {
  params: { id: string };
}

export default function MaterialReaderPage({ params }: PageProps) {
  return <MaterialReaderClient materialId={params.id} />;
}
