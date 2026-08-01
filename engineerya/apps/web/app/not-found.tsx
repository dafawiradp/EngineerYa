import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0B0F19] text-[#E2E8F0] px-4 text-center">
      <div className="bg-[#00B4D8]/10 border border-[#00B4D8]/20 p-4 rounded-full mb-6">
        <span className="text-4xl">🔍</span>
      </div>
      <h1 className="text-4xl font-extrabold text-white mb-2">404 - Page Not Found</h1>
      <p className="text-slate-400 max-w-md mb-8">
        The page you are looking for does not exist or has been moved. Check the URL and try again.
      </p>
      <Link
        href="/"
        className="bg-[#0077B6] hover:bg-[#00B4D8] text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-[#0077B6]/20 transition-all hover:scale-105"
      >
        Go back home
      </Link>
    </div>
  );
}
