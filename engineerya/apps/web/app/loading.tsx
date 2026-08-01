export default function LoadingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0B0F19] text-[#E2E8F0]">
      <div className="relative w-16 h-16 mb-4">
        {/* Loading Spinner */}
        <div className="absolute inset-0 rounded-full border-4 border-[#00B4D8]/20 border-t-[#0077B6] animate-spin" />
      </div>
      <p className="text-slate-400 text-sm font-semibold tracking-wider uppercase animate-pulse">
        Loading EngineerYa Library...
      </p>
    </div>
  );
}
