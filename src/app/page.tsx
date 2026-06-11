import { getLogos, getMockupsByTitle, driveProxyUrl, LogoItem } from '@/lib/google';
import LogoGrid from '@/components/LogoGrid';

export const revalidate = 3600;

// Env check helper — tampil di UI kalau ada yg missing
function checkEnvVars() {
  const required = {
    GOOGLE_SERVICE_ACCOUNT_JSON: process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
    GOOGLE_SHEET_ID: process.env.GOOGLE_SHEET_ID,
    GOOGLE_DRIVE_MOCKUP_FOLDER_ID: process.env.GOOGLE_DRIVE_MOCKUP_FOLDER_ID,
  };
  const missing = Object.entries(required)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  return missing;
}

export default async function Home() {
  let logos: LogoItem[] = [];
  let errorMessage: string | null = null;

  // Cek env dulu sebelum fetch
  const missingEnv = checkEnvVars();
  if (missingEnv.length > 0) {
    errorMessage = `Missing env vars: ${missingEnv.join(', ')}`;
  }

  if (!errorMessage) {
    try {
      // Validasi JSON service account bisa di-parse
      JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!);
    } catch {
      errorMessage = 'GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON';
    }
  }

  if (!errorMessage) {
    try {
      const raw = await getLogos();
      const mockupFolderId = process.env.GOOGLE_DRIVE_MOCKUP_FOLDER_ID ?? '';

      logos = await Promise.all(
        raw.map(async (logo) => {
          try {
            const mockupImages = await getMockupsByTitle(logo.title, mockupFolderId);
            return {
              ...logo,
              mockupImages: mockupImages.map((f) => ({
                ...f,
                thumbnailLink: driveProxyUrl(f.id),
                webContentLink: driveProxyUrl(f.id),
              })),
            };
          } catch (mockupErr) {
            // Mockup gagal → tetap tampil logo tanpa mockup
            console.warn(`Mockup fetch failed for "${logo.title}":`, mockupErr);
            return { ...logo, mockupImages: [] };
          }
        })
      );
    } catch (err) {
      const e = err as Error;
      errorMessage = e.message ?? 'Unknown error fetching logos';
      console.error('[VibeLogo] getLogos error:', e);
    }
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

      {/* Error Banner — visible di UI, bukan cuma di logs */}
      {errorMessage && (
        <section className="px-4 pb-6 max-w-3xl mx-auto">
          <div className="border border-red-500/30 bg-red-500/10 rounded-xl p-4">
            <p className="text-red-400 text-xs font-semibold uppercase tracking-wider mb-1">Error</p>
            <p className="text-red-300 text-sm font-mono break-all">{errorMessage}</p>
            <p className="text-white/30 text-xs mt-2">
              Check Vercel → Settings → Environment Variables, then redeploy.
            </p>
          </div>
        </section>
      )}

      {/* Grid */}
      <section className="px-4 pb-20 max-w-7xl mx-auto">
        {!errorMessage && logos.length === 0 ? (
          <div className="text-center py-24 text-white/30">
            <p className="text-lg">No logos found.</p>
            <p className="text-sm mt-2">Sheet might be empty or range is wrong (Sheet1!A2:L).</p>
          </div>
        ) : (
          <LogoGrid logos={logos} />
        )}
      </section>
    </main>
  );
}
