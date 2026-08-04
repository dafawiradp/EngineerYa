"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Material, assetUrl, fileTypeIcon, categoryColor } from "../../../lib/materials";

interface Props {
  materialId: string;
}

/** Render Markdown ke HTML sederhana (tanpa library, pure regex) */
function renderMarkdown(md: string): string {
  return md
    // Escape HTML
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // Headings
    .replace(/^#{6}\s+(.+)$/gm, "<h6 class='text-base font-bold mt-4 mb-1'>$1</h6>")
    .replace(/^#{5}\s+(.+)$/gm, "<h5 class='text-lg font-bold mt-4 mb-1'>$1</h5>")
    .replace(/^#{4}\s+(.+)$/gm, "<h4 class='text-xl font-bold mt-5 mb-2'>$1</h4>")
    .replace(/^#{3}\s+(.+)$/gm, "<h3 class='text-2xl font-bold mt-6 mb-2'>$1</h3>")
    .replace(/^#{2}\s+(.+)$/gm, "<h2 class='text-3xl font-bold mt-8 mb-3 text-[#03045E]'>$1</h2>")
    .replace(/^#{1}\s+(.+)$/gm, "<h1 class='text-4xl font-black mt-8 mb-4 text-[#03045E]'>$1</h1>")
    // Code block
    .replace(/```[\w]*\n([\s\S]*?)```/gm, "<pre class='bg-gray-900 text-green-300 rounded-xl p-4 overflow-x-auto text-sm my-4'><code>$1</code></pre>")
    // Inline code
    .replace(/`([^`]+)`/g, "<code class='bg-[#CAF0F8] text-[#03045E] px-1.5 py-0.5 rounded text-sm font-mono'>$1</code>")
    // Bold + italic
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/__(.+?)__/g, "<strong>$1</strong>")
    .replace(/_(.+?)_/g, "<em>$1</em>")
    // Strikethrough
    .replace(/~~(.+?)~~/g, "<del>$1</del>")
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "<a href='$2' target='_blank' rel='noreferrer' class='text-[#0077B6] underline hover:text-[#03045E]'>$1</a>")
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "<img src='$2' alt='$1' class='max-w-full rounded-xl my-4' />")
    // Horizontal rule
    .replace(/^---+$/gm, "<hr class='border-[#00B4D8]/30 my-6' />")
    // Blockquote
    .replace(/^&gt;\s(.+)$/gm, "<blockquote class='border-l-4 border-[#00B4D8] pl-4 italic text-[#0077B6] my-3'>$1</blockquote>")
    // Unordered list
    .replace(/^\s*[-*+]\s+(.+)$/gm, "<li class='ml-4 list-disc'>$1</li>")
    // Ordered list
    .replace(/^\s*\d+\.\s+(.+)$/gm, "<li class='ml-4 list-decimal'>$1</li>")
    // Wrap consecutive <li> in <ul>/<ol>
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, (match) => `<ul class='space-y-1 my-3'>${match}</ul>`)
    // Paragraphs (lines not starting with HTML tag)
    .replace(/^(?!<[a-zA-Z]).+$/gm, (line) => line.trim() ? `<p class='leading-relaxed my-2'>${line}</p>` : "")
    // Clean up multiple blank lines
    .replace(/\n{3,}/g, "\n\n");
}

export function MaterialReaderClient({ materialId }: Props) {
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markdownHtml, setMarkdownHtml] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load material metadata
  useEffect(() => {
    const load = async () => {
      try {
        const urls = [
          assetUrl("/materials/materials.json"),
          assetUrl("/materials/index.json"),
        ];

        let data: Material[] | null = null;
        for (const url of urls) {
          try {
            const res = await fetch(url, { cache: "no-store" });
            if (res.ok) {
              const json = await res.json();
              if (Array.isArray(json)) {
                data = json;
                break;
              }
            }
          } catch {
            // try next
          }
        }

        const found = data?.find((m) => m.id === materialId) ?? null;
        if (found) {
          setMaterial(found);
        } else {
          setError("Materi tidak ditemukan.");
        }
      } catch {
        setError("Gagal memuat metadata materi.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [materialId]);

  // Load markdown content jika tipe MD
  useEffect(() => {
    if (!material || material.fileType !== "md") return;

    const loadMd = async () => {
      try {
        const res = await fetch(assetUrl(material.file));
        if (!res.ok) throw new Error("File not found");
        const text = await res.text();
        setMarkdownHtml(renderMarkdown(text));
      } catch {
        setMarkdownHtml("<p class='text-red-500'>Gagal memuat konten Markdown.</p>");
      }
    };

    loadMd();
  }, [material]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#90E0EF] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0077B6] border-t-transparent mb-4" />
        <p className="text-[#03045E] font-semibold">Memuat materi...</p>
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className="flex flex-col min-h-screen bg-[#90E0EF] items-center justify-center p-8">
        <p className="text-5xl mb-4">📭</p>
        <h1 className="text-2xl font-bold text-[#03045E] mb-2">Materi tidak ditemukan</h1>
        <p className="text-[#0077B6] mb-6">{error ?? "ID materi tidak valid."}</p>
        <Link
          href="/materials"
          className="bg-[#0077B6] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#00B4D8] transition-colors"
        >
          ← Kembali ke Perpustakaan
        </Link>
      </div>
    );
  }

  const fileUrl = assetUrl(material.file);
  const icon = fileTypeIcon(material.fileType);

  return (
    <div ref={containerRef} className="flex flex-col h-screen bg-[#03045E]">
      {/* Top bar */}
      <header className="flex-shrink-0 h-14 bg-[#F8FDFF] border-b border-[#00B4D8]/20 px-4 flex items-center gap-3 z-20">
        <Link
          href="/materials"
          className="flex items-center gap-1.5 text-sm font-semibold text-[#0077B6] hover:text-[#03045E] transition-colors whitespace-nowrap"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="hidden sm:inline">Perpustakaan</span>
        </Link>

        <span className="text-[#00B4D8]/40">|</span>

        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-lg">{icon}</span>
          <h1 className="text-sm font-bold text-[#03045E] truncate">{material.title}</h1>
          <span className={`hidden sm:inline-flex text-xs font-semibold px-2 py-0.5 rounded-full border ${categoryColor(material.category)}`}>
            {material.category}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Download button */}
          <a
            href={fileUrl}
            download
            className="flex items-center gap-1.5 text-xs font-semibold text-[#0077B6] border border-[#0077B6]/30 px-3 py-1.5 rounded-lg hover:bg-[#0077B6] hover:text-white transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="hidden sm:inline">Download</span>
          </a>

          {/* Fullscreen button */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "Keluar fullscreen" : "Fullscreen"}
            className="p-1.5 rounded-lg text-[#0077B6] border border-[#0077B6]/30 hover:bg-[#0077B6] hover:text-white transition-all"
          >
            {isFullscreen ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Reader content */}
      <div className="flex-1 overflow-hidden relative">
        {material.fileType === "pdf" && (
          <PDFViewer fileUrl={fileUrl} title={material.title} />
        )}

        {material.fileType === "md" && markdownHtml && (
          <MarkdownViewer html={markdownHtml} title={material.title} />
        )}

        {material.fileType === "md" && !markdownHtml && (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#0077B6] border-t-transparent" />
          </div>
        )}

        {material.fileType === "docx" && (
          <DocxViewer fileUrl={fileUrl} title={material.title} />
        )}

        {material.fileType === "txt" && (
          <TxtViewer fileUrl={fileUrl} />
        )}
      </div>
    </div>
  );
}

// ─── PDF Viewer ──────────────────────────────────────────────────────────────

function PDFViewer({ fileUrl, title }: { fileUrl: string; title: string }) {
  const [useEmbedFallback, setUseEmbedFallback] = useState(false);
  const [useGoogleFallback, setUseGoogleFallback] = useState(false);

  // Encode URL untuk Google Docs viewer
  const absoluteUrl = typeof window !== "undefined"
    ? new URL(fileUrl, window.location.origin).href
    : fileUrl;
  const googleUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(absoluteUrl)}&embedded=true`;

  if (useGoogleFallback) {
    return (
      <div className="flex flex-col h-full">
        <div className="bg-[#03045E]/80 text-[#CAF0F8] text-xs px-4 py-2 flex items-center gap-2 flex-shrink-0">
          <span>📡</span>
          <span>Tampilan via Google Docs Viewer (memerlukan koneksi internet)</span>
          <button
            onClick={() => { setUseGoogleFallback(false); setUseEmbedFallback(false); }}
            className="ml-auto text-[#00B4D8] hover:text-white underline"
          >
            Coba lagi
          </button>
        </div>
        <iframe
          src={googleUrl}
          className="flex-1 w-full border-0"
          title={title}
          loading="lazy"
          allow="fullscreen"
        />
      </div>
    );
  }

  if (useEmbedFallback) {
    return (
      <div className="flex flex-col h-full">
        <div className="bg-[#03045E]/80 text-[#CAF0F8] text-xs px-4 py-2 flex items-center gap-2 flex-shrink-0">
          <span>⚠️</span>
          <span>Mode embed — jika tidak tampil, coba tampilkan via Google Docs</span>
          <button
            onClick={() => setUseGoogleFallback(true)}
            className="ml-auto text-[#00B4D8] hover:text-white underline"
          >
            Buka via Google Docs
          </button>
        </div>
        <embed
          src={`${fileUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
          type="application/pdf"
          className="flex-1 w-full"
          title={title}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-[#03045E]/80 text-[#CAF0F8] text-xs px-4 py-2 flex items-center gap-2 flex-shrink-0">
        <span>💡</span>
        <span>PDF ditampilkan langsung di browser. Gunakan toolbar PDF untuk zoom, search, dan navigasi halaman.</span>
        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => setUseEmbedFallback(true)}
            className="text-[#00B4D8] hover:text-white underline"
          >
            Mode embed
          </button>
          <span className="text-[#0077B6]/40">|</span>
          <button
            onClick={() => setUseGoogleFallback(true)}
            className="text-[#00B4D8] hover:text-white underline"
          >
            Google Docs
          </button>
        </div>
      </div>
      <iframe
        src={`${fileUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
        className="flex-1 w-full border-0"
        title={title}
        loading="lazy"
        allow="fullscreen"
        onError={() => setUseEmbedFallback(true)}
      />
    </div>
  );
}

// ─── Markdown Viewer ──────────────────────────────────────────────────────────

function MarkdownViewer({ html, title }: { html: string; title: string }) {
  return (
    <div className="h-full overflow-auto bg-[#F8FDFF]">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-black text-[#03045E] mb-8 pb-4 border-b border-[#00B4D8]/20">
          {title}
        </h1>
        <article
          className="prose prose-sm md:prose-base max-w-none text-[#03045E] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}

// ─── DOCX Viewer ──────────────────────────────────────────────────────────────

function DocxViewer({ fileUrl, title }: { fileUrl: string; title: string }) {
  const absoluteUrl = typeof window !== "undefined"
    ? new URL(fileUrl, window.location.origin).href
    : fileUrl;
  const googleUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(absoluteUrl)}&embedded=true`;
  const officeUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(absoluteUrl)}`;

  const [viewer, setViewer] = useState<"office" | "google">("office");

  return (
    <div className="flex flex-col h-full">
      <div className="bg-[#03045E]/80 text-[#CAF0F8] text-xs px-4 py-2 flex items-center gap-3 flex-shrink-0">
        <span>📃</span>
        <span>DOCX Viewer</span>
        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => setViewer("office")}
            className={`underline ${viewer === "office" ? "text-white font-bold" : "text-[#00B4D8] hover:text-white"}`}
          >
            Microsoft Office
          </button>
          <span className="text-[#0077B6]/40">|</span>
          <button
            onClick={() => setViewer("google")}
            className={`underline ${viewer === "google" ? "text-white font-bold" : "text-[#00B4D8] hover:text-white"}`}
          >
            Google Docs
          </button>
        </div>
      </div>
      <iframe
        key={viewer}
        src={viewer === "office" ? officeUrl : googleUrl}
        className="flex-1 w-full border-0"
        title={title}
        loading="lazy"
        allow="fullscreen"
      />
    </div>
  );
}

// ─── TXT Viewer ───────────────────────────────────────────────────────────────

function TxtViewer({ fileUrl }: { fileUrl: string }) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(fileUrl)
      .then((r) => r.text())
      .then((text) => { setContent(text); setLoading(false); })
      .catch(() => { setContent("Gagal memuat konten file."); setLoading(false); });
  }, [fileUrl]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#0077B6] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-[#F8FDFF] p-6">
      <pre className="max-w-4xl mx-auto text-sm text-[#03045E] whitespace-pre-wrap leading-relaxed font-mono">
        {content}
      </pre>
    </div>
  );
}
