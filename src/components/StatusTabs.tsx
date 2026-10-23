import { STATUS_LABEL, STATUSES } from '../lib/manhwa.ts';
import type { Manhwa, Status } from '../types.ts';

type Tab = Status | 'all';
const TABS: Tab[] = [...STATUSES.map((s) => s.value), 'all'];

interface Props {
  list: Manhwa[];
  active: Tab;
  onChange: (tab: Tab) => void;
}

export function StatusTabs({ list, active, onChange }: Props) {
  const count = (tab: Tab) => (tab === 'all' ? list.length : list.filter((m) => m.status === tab).length);

  return (
    <nav className="tabs" aria-label="Filter by status">
      {TABS.map((tab) => (
        <button
          key={tab}
          type="button"
          className="tab"
          data-status={tab}
          aria-pressed={active === tab}
          onClick={() => onChange(tab)}
        >
          {tab === 'all' ? 'All' : STATUS_LABEL[tab]}
          <span className="tab-count">{count(tab)}</span>
        </button>
      ))}
    </nav>
  );
}
