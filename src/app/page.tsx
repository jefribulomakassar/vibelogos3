import { getLogos, getMockupsByTitle, driveProxyUrl, LogoItem } from '@/lib/google';
import LogoGrid from '@/components/LogoGrid';

export const revalidate = 3600; // revalidate tiap 1 jam

export default async function Home() {
  let logos: LogoItem[] = [];

  try {
    const raw = await getLogos();
    const mockupFolderId = process.env.GOOGLE_DRIVE_MOCKUP_FOLDER_ID ?? '';

    logos = await Promise.all(
      raw.map(async (logo) => {
        const mockupImages = await getMockupsByTitle(logo.title, mockupFolderId);
        return {
          ...logo,
          mockupImages: mockupImages.map((f) => ({
            ...f,
            thumbnailLink: driveProxyUrl(f.id),
            webContentLink: driveProxyUrl(f.id),
          })),
        };
      })
    );
  } catch (err) {
    console.error('Failed to load logos:', err);
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#ededed]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <header className="border-b border-white/5 px-6 py-5 flex items-center justify-between sticky top-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="text-[#f5c842] font-bold text-xl tracking-tight">VibeLogo</span>
          <span className="text-white/20 text-sm">by jeflodesign</span>
        </div>
        <div className="text-white/40 text-sm">{logos.length} logos</div>
      </header>

      {/* Hero */}
      <section className="px-6 pt-16 pb-10 max-w-5xl mx-auto text-center">
        <p className="text-[#f5c842] text-xs font-semibold tracking-[0.2em] uppercase mb-4">Logo Portfolio</p>
        <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
          Premium Logo Designs
        </h1>
        <p className="text-white/40 max-w-md mx-auto text-sm leading-relaxed">
          Modern, unique, and ready-to-use logos. Each comes with mockup previews.
        </p>
      </section>

      {/* Grid */}
      <section className="px-4 pb-20 max-w-7xl mx-auto">
        {logos.length === 0 ? (
          <div className="text-center py-24 text-white/30">
            <p className="text-lg">No logos found.</p>
            <p className="text-sm mt-2">Check your Google Sheet connection.</p>
          </div>
        ) : (
          <LogoGrid logos={logos} />
        )}
      </section>
    </main>
  );
}
