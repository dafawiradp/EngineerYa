"use client";

import { useEffect } from "react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("Next.js error boundary caught an exception:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0B0F19] text-[#E2E8F0] px-4 text-center">
      <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-full mb-6">
        <span className="text-4xl">⚠️</span>
      </div>
      <h1 className="text-3xl font-extrabold text-white mb-2">Something went wrong!</h1>
      <p className="text-slate-400 max-w-md mb-8">
        An error occurred while loading this page. Our team has been notified.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={reset}
          className="w-full sm:w-auto bg-[#0077B6] hover:bg-[#00B4D8] text-white px-6 py-2.5 rounded-xl font-medium transition-all"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="w-full sm:w-auto bg-slate-800 hover:bg-slate-750 text-slate-350 px-6 py-2.5 rounded-xl font-medium border border-slate-750 transition-all"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}
