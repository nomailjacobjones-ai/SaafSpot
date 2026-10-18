import type { Category, Status } from '@/lib/types';
import type { Dict } from '@/lib/i18n';
import { categoryColor, statusColor } from '@/lib/format';
import {
  Trash2,
  Waves,
  Truck,
  Ban,
  CircleAlert,
  Flag,
  Users,
  FileText,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export function CategoryBadge({
  category,
  t,
}: {
  category: Category;
  t: Dict;
}) {
  return (
    <span className={`badge border ${categoryColor(category)}`}>
      {categoryIcon(category)}
      {t.categories[category]}
    </span>
  );
}

export function StatusBadge({ status, t }: { status: Status; t: Dict }) {
  return (
    <span className={`badge border ${statusColor(status)}`}>
      {statusIcon(status)}
      {t.statuses[status]}
    </span>
  );
}

export function categoryIcon(c: Category): JSX.Element {
  const map: Record<Category, LucideIcon> = {
    overflowing_bin: Waves,
    uncollected_waste: Truck,
    illegal_dumping: Trash2,
    missing_damaged_bin: Ban,
    other: CircleAlert,
  };
  const Icon = map[c];
  return <Icon className="h-3.5 w-3.5" aria-hidden />;
}

export function statusIcon(s: Status): JSX.Element {
  const map: Record<Status, LucideIcon> = {
    reported: Flag,
    corroborated: Users,
    brief_prepared: FileText,
    cleanup_observed: Sparkles,
    recurring: RotateCcw,
  };
  const Icon = map[s];
  return <Icon className="h-3.5 w-3.5" aria-hidden />;
}
