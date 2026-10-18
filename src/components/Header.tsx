import type { Dict, Lang } from '@/lib/i18n';
import { Languages, Sprout, Phone, ExternalLink, CircleDot } from 'lucide-react';
import type { View } from '@/lib/types';

interface HeaderProps {
  t: Dict;
  lang: Lang;
  onLangToggle: () => void;
  view: View;
  onNavigate: (v: View) => void;
  demoMode: boolean;
}

export default function Header({
  t,
  lang,
  onLangToggle,
  view,
  onNavigate,
  demoMode,
}: HeaderProps) {
  const navItems: { key: View; label: string }[] = [
    { key: 'home', label: t.nav.home },
    { key: 'new', label: t.nav.newReport },
    { key: 'about', label: t.nav.about },
  ];

  return (
    <header className="sticky top-0 z-30 bg-canvas/85 backdrop-blur-md border-b border-sand-100">
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 rounded-lg focus-visible:ring-2 focus-visible:ring-forest-500"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-forest-600 text-white shadow-sm">
              <Sprout className="h-5 w-5" />
            </span>
            <span className="flex flex-col leading-tight text-start">
              <span className="text-base font-bold text-forest-700">{t.appName}</span>
              <span className="hidden sm:block text-[11px] text-ink-muted">
                {t.tagline}
              </span>
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-1" aria-label="Primary">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`btn-ghost px-3 py-2 ${
                  view === item.key || (view === 'detail' && item.key === 'home') || (view === 'brief' && item.key === 'home')
                    ? 'bg-forest-50 text-forest-700'
                    : ''
                }`}
                aria-current={view === item.key ? 'page' : undefined}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <span
              className={`hidden sm:inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                demoMode
                  ? 'bg-coral-50 text-coral-700 border border-coral-200'
                  : 'bg-forest-50 text-forest-700 border border-forest-200'
              }`}
              title={demoMode ? t.common.demoModeHint : t.common.liveMode}
            >
              <CircleDot className="h-3 w-3" />
              {demoMode ? t.common.demoMode : t.common.liveMode}
            </span>
            <button
              onClick={onLangToggle}
              className="btn-ghost px-2.5 py-2"
              aria-label={t.common.language}
              title={lang === 'en' ? 'اردو' : 'English'}
            >
              <Languages className="h-4 w-4" />
              <span className="text-sm font-medium">{lang === 'en' ? 'اردو' : 'EN'}</span>
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <nav className="md:hidden flex items-center gap-1 pb-2 -mt-1" aria-label="Primary mobile">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`btn-ghost px-3 py-1.5 text-sm ${
                view === item.key ||
                (view === 'detail' && item.key === 'home') ||
                (view === 'brief' && item.key === 'home')
                  ? 'bg-forest-50 text-forest-700'
                  : ''
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function OfficialHelpLinks({
  t,
  size = 'md',
}: {
  t: Dict;
  size?: 'sm' | 'md';
}) {
  const pad = size === 'sm' ? 'px-3 py-2 text-xs' : 'px-4 py-2.5 text-sm';
  return (
    <div className="flex flex-wrap gap-2">
      <a
        href="https://suthra.punjab.gov.pk/complaint.php"
        target="_blank"
        rel="noopener noreferrer"
        className={`btn-primary ${pad}`}
      >
        <ExternalLink className="h-4 w-4" />
        {t.detail.getOfficialHelp}
      </a>
      <a href="tel:1139" className={`btn-secondary ${pad}`}>
        <Phone className="h-4 w-4" />
        {t.detail.call1139}
      </a>
    </div>
  );
}
