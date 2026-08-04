import { MaterialReaderClient } from "./MaterialReaderClient";
import materialsJson from "../../../public/materials/materials.json";
import indexJson from "../../../public/materials/index.json";

// Untuk static export GitHub Pages: generate halaman dari materials.json / index.json
export function generateStaticParams() {
  // Gabungkan keduanya, hilangkan duplikat
  const allMaterials = [...(materialsJson as { id: string }[]), ...(indexJson as { id: string }[])];
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
