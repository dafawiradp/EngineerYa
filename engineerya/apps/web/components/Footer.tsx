import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#F8FDFF] border-t border-[#00B4D8]/30 pt-16 pb-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <span className="text-xl font-bold bg-gradient-to-r from-[#0077B6] via-[#00B4D8] to-[#03045E] bg-clip-text text-transparent">
              EngineerYa
            </span>
            <p className="mt-4 text-sm text-[#03045E]/80 max-w-sm leading-relaxed">
              Professional learning library platform for engineering professionals, students, and educators. Read, bookmark, and track your engineering journeys.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#03045E] uppercase tracking-wider mb-4">Library</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/books" className="text-sm text-[#03045E]/80 hover:text-[#0077B6] transition-colors">
                  All Books
                </Link>
              </li>
              <li>
                <Link href="/books?discipline=software" className="text-sm text-[#03045E]/80 hover:text-[#0077B6] transition-colors">
                  Software Engineering
                </Link>
              </li>
              <li>
                <Link href="/books?discipline=electrical" className="text-sm text-[#03045E]/80 hover:text-[#0077B6] transition-colors">
                  Electrical Engineering
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#03045E] uppercase tracking-wider mb-4">Project</h4>
            <ul className="space-y-3">
              <li>
                <Link href="https://github.com/dafawiradp/EngineerYa" target="_blank" className="text-sm text-[#03045E]/80 hover:text-[#0077B6] transition-colors">
                  GitHub Source
                </Link>
              </li>
              <li>
                <Link href="/LICENSE" className="text-sm text-[#03045E]/80 hover:text-[#0077B6] transition-colors">
                  MIT License
                </Link>
              </li>
              <li>
                <Link href="/CONTRIBUTING.md" className="text-sm text-[#03045E]/80 hover:text-[#0077B6] transition-colors">
                  Contributing
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-[#00B4D8]/20 flex flex-col md:flex-row items-center justify-between">
          <p className="text-xs text-[#03045E]/70">
            &copy; {new Date().getFullYear()} EngineerYa. All rights reserved.
          </p>
          <p className="text-xs text-[#03045E]/70 mt-2 md:mt-0 flex items-center space-x-2">
            <span>Built with Next.js, NestJS & Prisma</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
