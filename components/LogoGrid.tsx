'use client';

import { useState } from 'react';
import { LogoItem } from '@/lib/google';

export default function LogoGrid({ logos }: { logos: LogoItem[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {logos.map((logo) => (
        <LogoCard key={logo.index} logo={logo} />
      ))}
    </div>
  );
}

function LogoCard({ logo }: { logo: LogoItem }) {
  const [mockupIndex, setMockupIndex] = useState(0);
  const hasMockups = logo.mockupImages.length > 0;

  const prev = () => setMockupIndex((i) => (i - 1 + logo.mockupImages.length) % logo.mockupImages.length);
  const next = () => setMockupIndex((i) => (i + 1) % logo.mockupImages.length);

  return (
    <article className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden flex flex-col hover:border-[#f5c842]/20 transition-colors duration-300 group">
      {/* Mockup / Placeholder */}
      <div className="relative aspect-video bg-[#1a1a1a] overflow-hidden">
        {hasMockups ? (
          <>
            <img
              src={logo.mockupImages[mockupIndex].thumbnailLink}
              alt={`${logo.title} mockup ${mockupIndex + 1}`}
              className="w-full h-full object-cover transition-opacity duration-300"
              loading="lazy"
            />

            {/* Carousel controls */}
            {logo.mockupImages.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 text-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black text-xs"
                  aria-label="Previous mockup"
                >
                  ‹
                </button>
                <button
                  onClick={next}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 text-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black text-xs"
                  aria-label="Next mockup"
                >
                  ›
                </button>

                {/* Dots */}
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                  {logo.mockupImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setMockupIndex(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        i === mockupIndex ? 'bg-[#f5c842] w-3' : 'bg-white/30'
                      }`}
                      aria-label={`Mockup ${i + 1}`}
                    />
                  ))}
                </div>

                {/* Counter */}
                <span className="absolute top-2 right-2 text-[10px] bg-black/50 text-white/60 px-2 py-0.5 rounded-full">
                  {mockupIndex + 1}/{logo.mockupImages.length}
                </span>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-white/10 text-sm">No mockup</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        {/* Title + Category */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h2 className="font-semibold text-[#ededed] text-sm leading-snug line-clamp-1">
              {logo.title}
            </h2>
            <span className="text-[#f5c842] font-bold text-sm whitespace-nowrap">
              ${logo.price}
            </span>
          </div>
          <span className="text-[10px] text-white/30 uppercase tracking-wider">
            {logo.mainCategory}
          </span>
        </div>

        {/* Description */}
        <p className="text-white/40 text-xs leading-relaxed line-clamp-3 flex-1">
          {logo.description}
        </p>

        {/* Keywords */}
        {logo.keywords && (
          <div className="flex flex-wrap gap-1">
            {logo.keywords
              .split(' ')
              .slice(0, 5)
              .map((kw, i) => (
                <span
                  key={i}
                  className="text-[9px] bg-white/5 text-white/30 px-1.5 py-0.5 rounded"
                >
                  {kw}
                </span>
              ))}
          </div>
        )}

        {/* CTA */}
        <a
          href={logo.logoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 w-full text-center text-xs font-medium py-2 rounded-lg bg-[#f5c842]/10 text-[#f5c842] hover:bg-[#f5c842]/20 transition-colors border border-[#f5c842]/10"
        >
          View on LogoGround →
        </a>
      </div>
    </article>
  );
}
