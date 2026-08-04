"use client";

import Link from "next/link";
import { Material, categoryColor, fileTypeIcon, assetUrl } from "../lib/materials";

interface MaterialCardProps {
  material: Material;
}

export function MaterialCard({ material }: MaterialCardProps) {
  const icon = fileTypeIcon(material.fileType);
  const badgeClass = categoryColor(material.category);
  const fileUrl = assetUrl(material.file);

  return (
    <div className="group flex flex-col bg-[#F8FDFF] rounded-2xl border border-[#00B4D8]/20 shadow-md hover:shadow-[#0077B6]/20 hover:border-[#0077B6]/40 transition-all duration-300 overflow-hidden">
      {/* Thumbnail / Cover */}
      <div className="relative w-full aspect-video bg-gradient-to-br from-[#90E0EF]/60 to-[#00B4D8]/20 flex items-center justify-center overflow-hidden border-b border-[#00B4D8]/20">
        {material.thumbnail ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={assetUrl(material.thumbnail)}
            alt={material.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-center p-4">
            <span className="text-5xl">{icon}</span>
            <span className="text-xs font-bold uppercase tracking-widest text-[#0077B6]">
              {material.fileType?.toUpperCase() ?? "FILE"}
            </span>
          </div>
        )}

        {/* File type badge top-right */}
        <div className="absolute top-3 right-3">
          <span className="bg-[#03045E]/80 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md">
            {material.fileType?.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-grow p-5 gap-3">
        {/* Category badge */}
        <span className={`self-start text-xs font-semibold px-2.5 py-0.5 rounded-full border ${badgeClass}`}>
          {material.category}
        </span>

        {/* Title */}
        <h2 className="text-base font-bold text-[#03045E] group-hover:text-[#0077B6] transition-colors line-clamp-2 leading-snug">
          {material.title}
        </h2>

        {/* Description */}
        <p className="text-sm text-[#0077B6]/80 line-clamp-2 leading-relaxed flex-grow">
          {material.description}
        </p>

        {/* Meta info */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#03045E]/60">
          {material.author && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {material.author}
            </span>
          )}
          {material.date && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(material.date).toLocaleDateString("id-ID", { year: "numeric", month: "short", day: "numeric" })}
            </span>
          )}
          {material.fileSizeDisplay && material.fileSizeDisplay !== "—" && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {material.fileSizeDisplay}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-1 border-t border-[#00B4D8]/20">
          <Link
            href={`/materials/${material.id}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#0077B6] hover:bg-[#00B4D8] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 hover:scale-[1.02]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Baca
          </Link>
          <a
            href={fileUrl}
            download
            className="inline-flex items-center justify-center gap-1.5 border border-[#0077B6] text-[#0077B6] hover:bg-[#0077B6] hover:text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200"
            title="Download file"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </a>
        </div>
      </div>
    </div>
  );
}
