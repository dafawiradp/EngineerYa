import Link from "next/link";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";

const materials = [
  {
    title: "Engineering Study Guide",
    description: "Free beginner-friendly notes and public documentation for learners.",
    link: "/materials/engineering-study-guide.pdf",
    type: "PDF",
    discipline: "Chemical Engineering",
    size: "0.2 MB",
  },
  {
    title: "Public Repository",
    description: "Open the full project repository on GitHub for source code and docs.",
    link: "https://github.com/dafawiradp/EngineerYa",
    type: "Repository",
    discipline: "General",
    size: "Open source",
  },
  {
    title: "Docs Folder",
    description: "Browse project documentation and learning resources directly from GitHub.",
    link: "https://github.com/dafawiradp/EngineerYa/tree/main/docs",
    type: "Docs",
    discipline: "General",
    size: "Public docs",
  },
];

export default function MaterialsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#90E0EF]">
      <Navbar />
      <main className="flex-grow py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.3em] text-[#0077B6] font-semibold">OPEN ACCESS</p>
            <h1 className="text-4xl md:text-5xl font-black text-[#03045E] mt-4">Free materials for everyone</h1>
            <p className="mt-4 text-lg text-[#0077B6] max-w-3xl mx-auto">
              These materials are publicly accessible and can be read without login. You can also use GitHub as the storage place for public documents and resources.
            </p>
          </div>

          <div className="mb-8 flex flex-wrap gap-3">
            {['All', 'Chemical Engineering', 'General'].map((filter) => (
              <span key={filter} className="rounded-full border border-[#00B4D8]/20 bg-[#F8FDFF] px-4 py-2 text-sm font-semibold text-[#0077B6]">
                {filter}
              </span>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {materials.map((item) => (
              <div key={item.title} className="rounded-2xl border border-[#00B4D8]/20 bg-[#F8FDFF] p-6 shadow-lg shadow-[#00B4D8]/10">
                <div className="flex items-center justify-between">
                  <div className="text-xs uppercase tracking-[0.25em] text-[#0077B6] font-semibold">{item.type}</div>
                  <div className="text-xs font-semibold text-[#03045E]">{item.size}</div>
                </div>
                <h2 className="text-xl font-bold text-[#03045E] mt-3">{item.title}</h2>
                <p className="text-sm text-[#0077B6] mt-3 leading-relaxed">{item.description}</p>
                <div className="mt-4 inline-flex rounded-full border border-[#00B4D8]/20 bg-[#CAF0F8] px-3 py-1 text-xs font-semibold text-[#0077B6]">
                  {item.discipline}
                </div>
                <a href={item.link} target="_blank" rel="noreferrer" className="inline-flex mt-6 text-sm font-semibold text-[#0077B6] hover:text-[#03045E]">
                  Open resource →
                </a>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-[#00B4D8]/20 bg-[#F8FDFF] p-8 text-center">
            <h2 className="text-2xl font-bold text-[#03045E]">Use GitHub as a public storage hub</h2>
            <p className="mt-3 text-[#0077B6] max-w-2xl mx-auto">
              For future uploads, you can store PDFs, notes, and e-books in a public GitHub repository and link them here so anyone can access them freely.
            </p>
            <Link href="/books" className="inline-flex mt-6 bg-[#0077B6] hover:bg-[#00B4D8] text-white px-6 py-3 rounded-xl font-medium">
              Browse the public catalog
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
