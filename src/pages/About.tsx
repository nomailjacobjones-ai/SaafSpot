import type { View } from '@/lib/types';
import type { Dict } from '@/lib/i18n';
import { OfficialHelpLinks } from '@/components/Header';
import {
  AlertTriangle,
  Eye,
  HelpCircle,
  Info,
  ListChecks,
  Lock,
  ShieldAlert,
  Sprout,
} from 'lucide-react';

export default function About({
  t,
  onNavigate,
}: {
  t: Dict;
  onNavigate: (v: View) => void;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
        <Info className="h-6 w-6 text-forest-600" />
        {t.about.title}
      </h1>

      <div className="mt-6 space-y-5">
        <Card icon={<Sprout className="h-5 w-5" />} title={t.about.what}>
          <p className="text-sm text-ink-soft">{t.about.whatBody}</p>
        </Card>

        <Card
          icon={<ShieldAlert className="h-5 w-5" />}
          title={t.about.notGov}
          tone="coral"
        >
          <p className="text-sm text-ink-soft">{t.about.notGovBody}</p>
          <div className="mt-3">
            <OfficialHelpLinks t={t} size="sm" />
          </div>
        </Card>

        <Card icon={<Eye className="h-5 w-5" />} title={t.about.evidence}>
          <p className="text-sm text-ink-soft">{t.about.evidenceBody}</p>
        </Card>

        <Card icon={<Lock className="h-5 w-5" />} title={t.about.privacy}>
          <p className="text-sm text-ink-soft">{t.about.privacyBody}</p>
        </Card>

        <Card icon={<ListChecks className="h-5 w-5" />} title={t.about.how}>
          <ol className="space-y-2 text-sm text-ink-soft">
            {t.about.howSteps.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-forest-100 text-forest-700 text-xs font-semibold shrink-0">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <button
            onClick={() => onNavigate('new')}
            className="btn-primary mt-4"
          >
            {t.nav.newReport}
          </button>
        </Card>

        <Card icon={<HelpCircle className="h-5 w-5" />} title={t.about.credits}>
          <p className="text-sm text-ink-soft">{t.about.creditsBody}</p>
          <p className="text-xs text-ink-muted mt-2 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" />
            {t.common.footerNote}
          </p>
        </Card>
      </div>
    </div>
  );
}

function Card({
  icon,
  title,
  children,
  tone = 'forest',
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  tone?: 'forest' | 'coral';
}) {
  const tones = {
    forest: 'bg-forest-50 text-forest-700',
    coral: 'bg-coral-50 text-coral-700',
  };
  return (
    <section className="card p-5">
      <h2 className="flex items-center gap-2 text-base font-semibold mb-2">
        <span className={`grid h-8 w-8 place-items-center rounded-lg ${tones[tone]}`}>
          {icon}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}
