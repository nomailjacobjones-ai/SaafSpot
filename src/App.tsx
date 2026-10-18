import { useCallback, useEffect, useMemo, useState } from 'react';
import type { View } from '@/lib/types';
import type { Dict, Lang } from '@/lib/i18n';
import { dictionaries } from '@/lib/i18n';
import { backendActive, fetchHotspots } from '@/lib/data';
import { supabase } from '@/lib/supabaseClient';
import { demoReports, demoConfirmations } from '@/lib/demoData';
import type { Hotspot } from '@/lib/types';
import Header from '@/components/Header';
import Home from '@/pages/Home';
import NewReport from '@/pages/NewReport';
import HotspotDetail from '@/pages/HotspotDetail';
import ActionBrief from '@/pages/ActionBrief';
import About from '@/pages/About';

function getInitialLang(): Lang {
  try {
    const saved = localStorage.getItem('saafspot.lang');
    if (saved === 'ur' || saved === 'en') return saved;
  } catch {
    // ignore
  }
  return 'en';
}

export default function App() {
  const [lang, setLang] = useState<Lang>(getInitialLang);
  const [view, setView] = useState<View>('home');
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportCounts, setReportCounts] = useState<Record<string, number>>({});
  const [confirmationCounts, setConfirmationCounts] = useState<Record<string, number>>({});

  const t: Dict = dictionaries[lang];
  const demoMode = !backendActive;

  // Apply language direction to <html> for proper RTL.
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = t.dir;
  }, [lang, t.dir]);

  const loadHotspots = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchHotspots()
      .then((hs) => {
        setHotspots(hs);
        // Counts derived from stored records — computed client-side from the
        // hotspot list plus a separate fetch of counts. For the dashboard we
        // derive counts inline when demo data, and via a quick query when live.
        if (backendActive) {
          if (!supabase) return;
          Promise.all([
            supabase.from('reports').select('hotspot_id'),
            supabase.from('confirmations').select('hotspot_id'),
          ]).then(([r, c]) => {
            const rc: Record<string, number> = {};
            const cc: Record<string, number> = {};
            for (const row of (r.data ?? []) as { hotspot_id: string }[]) {
              rc[row.hotspot_id] = (rc[row.hotspot_id] ?? 0) + 1;
            }
            for (const row of (c.data ?? []) as { hotspot_id: string }[]) {
              cc[row.hotspot_id] = (cc[row.hotspot_id] ?? 0) + 1;
            }
            setReportCounts(rc);
            setConfirmationCounts(cc);
          }).catch(() => {
            /* counts are non-critical */
          });
        } else {
          const rc: Record<string, number> = {};
          const cc: Record<string, number> = {};
          for (const rpt of demoReports) {
            rc[rpt.hotspot_id] = (rc[rpt.hotspot_id] ?? 0) + 1;
          }
          for (const c of demoConfirmations) {
            cc[c.hotspot_id] = (cc[c.hotspot_id] ?? 0) + 1;
          }
          setReportCounts(rc);
          setConfirmationCounts(cc);
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : t.common.error))
      .finally(() => setLoading(false));
  }, [t.common.error]);

  useEffect(() => {
    loadHotspots();
  }, [loadHotspots]);

  // Refresh hotspot list whenever we return to home from a creation/detail flow.
  useEffect(() => {
    if (view === 'home') loadHotspots();
  }, [view, loadHotspots]);

  const navigate = useCallback((v: View) => {
    setView(v);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  const selectHotspot = useCallback(
    (id: string) => {
      setSelectedHotspot(id);
      setView('detail');
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    },
    [],
  );

  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const next = prev === 'en' ? 'ur' : 'en';
      try {
        localStorage.setItem('saafspot.lang', next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const hotspotMemo = useMemo(() => hotspots, [hotspots]);

  return (
    <div className="min-h-screen flex flex-col" dir={t.dir}>
      <Header
        t={t}
        lang={lang}
        onLangToggle={toggleLang}
        view={view}
        onNavigate={navigate}
        demoMode={demoMode}
      />

      <main className="flex-1">
        {view === 'home' && (
          <Home
            t={t}
            lang={lang}
            hotspots={hotspotMemo}
            loading={loading}
            error={error}
            onRetry={loadHotspots}
            onNavigate={navigate}
            onSelectHotspot={selectHotspot}
            demoMode={demoMode}
            reportCounts={reportCounts}
            confirmationCounts={confirmationCounts}
          />
        )}
        {view === 'new' && (
          <NewReport
            t={t}
            lang={lang}
            hotspots={hotspotMemo}
            onNavigate={navigate}
            onSelectHotspot={selectHotspot}
          />
        )}
        {view === 'detail' && selectedHotspot && (
          <HotspotDetail
            t={t}
            lang={lang}
            hotspotId={selectedHotspot}
            onNavigate={navigate}
            onSelectHotspot={selectHotspot}
          />
        )}
        {view === 'brief' && selectedHotspot && (
          <ActionBrief
            t={t}
            lang={lang}
            hotspotId={selectedHotspot}
            onNavigate={navigate}
          />
        )}
        {view === 'about' && <About t={t} onNavigate={navigate} />}
      </main>

      <footer className="border-t border-sand-100 bg-canvas">
        <div className="mx-auto max-w-content px-4 sm:px-6 py-6 text-center text-xs text-ink-muted">
          <p className="flex items-center justify-center gap-1.5">
            <SproutMark />
            {t.common.footerNote}
          </p>
          <p className="mt-1">
            {t.common.demoMode}: {demoMode ? t.common.demoModeHint : t.common.liveMode}
          </p>
        </div>
      </footer>
    </div>
  );
}

function SproutMark() {
  return (
    <span className="inline-grid h-4 w-4 place-items-center rounded bg-forest-600 text-white text-[10px]">
      S
    </span>
  );
}
