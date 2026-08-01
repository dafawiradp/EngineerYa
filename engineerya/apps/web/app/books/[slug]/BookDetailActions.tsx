"use client";

export function BookDetailActions({
  title,
  bookId,
}: {
  title: string;
  bookId: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto sm:ml-auto">
      <a
        href={`/reader/${bookId}`}
        className="w-full sm:w-auto bg-[#F8FDFF] hover:bg-[#CAF0F8] text-[#03045E] px-6 py-3 rounded-xl text-center font-medium border border-[#00B4D8]/20 transition-all duration-300"
      >
        Read Preview Pages
      </a>
      <button
        onClick={() => alert(`Initiating payment token retrieval for: ${title}. Checkout popup loaded via Midtrans Snap!`)}
        className="w-full sm:w-auto bg-[#0077B6] hover:bg-[#00B4D8] text-white px-8 py-3 rounded-xl font-medium shadow-lg shadow-[#0077B6]/20 hover:shadow-[#00B4D8]/30 transition-all hover:scale-102"
      >
        Buy Textbook
      </button>
    </div>
  );
}
