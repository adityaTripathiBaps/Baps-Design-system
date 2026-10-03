/**
 * Rewrites Table.tsx in react-app-shell-sampark to:
 *
 * 1. Column Config drawer — uses the design system's ct-cfg-* BEM classes,
 *    toggle switches, drag handle SVG, group labels, search, active count,
 *    and the design system drawer layout (header + actions + body).
 *
 * 2. Filter Panel — Sampark filter drawer with accordion sections for:
 *    Project Type, Sampark Type, # Karyakars, # Families, Department/s,
 *    Created By, Created On (radio + custom date range), Status.
 *
 * 3. Table scroll borders — sticky header/frozen column borders that match
 *    the design system's border behaviour.
 */
const fs = require('fs');
const path = 'D:\\baps-projects\\react-app-shell-sampark\\src\\components\\Table.tsx';

const FULL = `import React, { useState, useCallback, useRef, useEffect } from 'react';

/* ══════════════════════════════════════════════════════════════════════
   DATA — same as design system table.stories.ts
   ══════════════════════════════════════════════════════════════════════ */
const templates = [
  {
    name: 'Diwali New Year Prasad - 2025',
    description: 'Celebrate the spirit of Diwali through seva and be a part of the grand festivities at the Mandir.',
    project: 'Family', sampark: 'Home Visit', scope: 'North America', level: 'Center',
    departments: ['Satsang Network'], more: '1',
    duration: '01 Oct 2025 - 15 Nov 2025', cadence: 'Once  (30-45 days)', recurring: false,
    createdBy: 'Rajesh Haripara', createdOn: 'Created on : 01 Jan 2025', status: 'Draft',
  },
  {
    name: 'New Family Introduction Drive',
    description: 'Systematically connects with newly joined families and ensures smooth integration into satsang.',
    project: 'Family', sampark: 'Home Visit', scope: 'NorthEast', level: 'Center',
    departments: ['Satsang Network'], more: '+2',
    duration: '01 Jan 2025 - 31 Dec 2025', cadence: 'Every Qtr (10-15 days)', recurring: true,
    createdBy: 'Rajesh Haripara', createdOn: 'Created on : 01 Jan 2025', status: 'Published',
  },
  {
    name: 'Event Participation Outreach',
    description: 'Tracks invitations, confirmations, and follow-ups for mandal or shibir events.',
    project: 'Family', sampark: 'Home Visit', scope: 'SouthWest', level: 'Center',
    departments: ['BKY', 'Outreach'], more: '+1',
    duration: '12 Jun 2025 - 18 Jun 2025', cadence: 'Once (7 days)', recurring: false,
    createdBy: 'Rajesh Haripara', createdOn: 'Created on : 01 Jan 2025', status: 'Published',
  },
  {
    name: 'Youth Re-Engagement Initiative',
    description: 'Designed to reconnect less-active youths through guided sampark and interest-based touchpoints.',
    project: 'Individual', sampark: 'Phone Call', scope: 'North America', level: 'Center',
    departments: ['Yuvak', 'Yuvati', 'BKY'],
    duration: '15 Aug 2025 - 30 Nov 2025', cadence: 'Ad-hoc (5-7 days)', recurring: true,
    createdBy: 'Rajesh Haripara', createdOn: 'Created on : 01 Jan 2025', status: 'Draft',
  },
  {
    name: 'Family Well-Being Check-In',
    description: 'Captures health, career, or personal concerns to provide appropriate sahay, guidance, or prarthana.',
    project: 'Family', sampark: 'Home Visit', scope: 'East', level: 'Center',
    departments: ['Satsang Network'], more: '+3',
    duration: '01 Jan 2025 - 31 Dec 2025', cadence: 'Every Qtr (10-15 days)', recurring: true,
    createdBy: 'Rajesh Haripara', createdOn: 'Created on : 01 Jan 2025', status: 'Published',
  },
  {
    name: 'Bal Parent Sampark Plan',
    description: 'Focuses on parents of balaks/balikas to understand attendance, behaviour, and satsang needs.',
    project: 'Family', sampark: 'Home Visit', scope: 'Canada', level: 'Center',
    departments: ['Bal', 'Balika', 'BKY'],
    duration: '01 Jan 2025 - 31 Dec 2025', cadence: 'Half Yearly (10-15 days)', recurring: true,
    createdBy: 'Rajesh Haripara', createdOn: 'Created on : 01 Jan 2025', status: 'Published',
  },
  {
    name: 'Festive Greetings & Mahotsav Touchpoints',
    description: 'A structured approach for sending greetings, prasang sharings, and annual festival sampark.',
    project: 'Family', sampark: 'Home Visit', scope: 'North America', level: 'Center',
    departments: ['Satsang Network'], more: '+1',
    duration: '12 Jun 2025 - 18 Jun 2025', cadence: 'Once (7 days)', recurring: false,
    createdBy: 'Rajesh Haripara', createdOn: 'Created on : 01 Jan 2025', status: 'Published',
  },
  {
    name: 'Niyam & Daily Satsang Progress Sampark',
    description: "Helps track members' niyam adherence and offers motivation for daily spiritual practices.",
    project: 'Individual', sampark: 'Phone Call', scope: 'North America', level: 'Center',
    departments: ['Satsang Network'], more: '+2',
    duration: '15 Aug 2025 - 30 Nov 2025', cadence: 'Ad-hoc (5-7 days)', recurring: true,
    createdBy: 'Rajesh Haripara', createdOn: 'Created on : 01 Jan 2025', status: 'Archived',
  },
];

const statusSeverity: Record<string, string | undefined> = {
  Draft: undefined, Published: 'success', Archived: 'warn',
};

/* ══════════════════════════════════════════════════════════════════════
   COLUMN MODEL
   ══════════════════════════════════════════════════════════════════════ */
interface Column {
  key: string;
  label: string;
  locked?: boolean;
  end?: boolean;
  frozen?: boolean;
  visible: boolean;
  group?: string;
}

const initialColumns: Column[] = [
  { key: 'name', label: 'Project Name', locked: true, visible: true },
  { key: 'project', label: 'Project Sampark Type', visible: true, group: 'Project' },
  { key: 'scope', label: 'Location', visible: true, group: 'Project' },
  { key: 'departments', label: 'Department/s', visible: true, group: 'Reach' },
  { key: 'duration', label: 'Duration', visible: true, group: 'Schedule' },
  { key: 'createdBy', label: 'Created By', visible: true, group: 'Schedule' },
  { key: 'status', label: 'Status', visible: true, group: 'Schedule' },
];

const COLUMN_WIDTHS: Record<string, string> = {
  name: '25rem', project: '12.5rem', scope: '10rem',
  departments: '15.625rem', duration: '14.0625rem',
  createdBy: '14.0625rem', status: '7.5rem', actions: '6.0625rem',
};

const COLUMN_WIDTH_NUM: Record<string, number> = {
  name: 400, project: 200, scope: 160,
  departments: 250, duration: 225,
  createdBy: 225, status: 120, actions: 97,
};

/* ══════════════════════════════════════════════════════════════════════
   SHARED HELPER COMPONENTS
   ══════════════════════════════════════════════════════════════════════ */
function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
         style={{ width: '1rem', height: '1rem' }}>
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  );
}

function Tag({ value, severity }: { value: string; severity?: string }) {
  const cls = ['baps-tag', 'baps-sampark'];
  if (severity === 'success') cls.push('baps-tag--success');
  else if (severity === 'warn') cls.push('baps-tag--warn');
  else if (severity === 'contrast') cls.push('baps-tag--contrast');
  return (
    <span className={cls.join(' ')}>
      <span className="baps-tag__label">{value}</span>
    </span>
  );
}

/* ── Drag handle SVG — Figma 17512:83441 ("Arrange"), dot grid ─────── */
function DragHandle({ dimmed }: { dimmed?: boolean }) {
  return (
    <svg width="17" height="18" viewBox="0 0 17 18" fill="none" stroke="currentColor"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
         style={{ opacity: dimmed ? 0.4 : 1 }}>
      <path d="M5.75 4.125C5.33579 4.125 5 3.78921 5 3.375C5 2.96079 5.33579 2.625 5.75 2.625C6.16421 2.625 6.5 2.96079 6.5 3.375C6.5 3.78921 6.16421 4.125 5.75 4.125Z"/>
      <path d="M5.75 7.875C5.33579 7.875 5 7.53921 5 7.125C5 6.71079 5.33579 6.375 5.75 6.375C6.16421 6.375 6.5 6.71079 6.5 7.125C6.5 7.53921 6.16421 7.875 5.75 7.875Z"/>
      <path d="M5.75 11.625C5.33579 11.625 5 11.2892 5 10.875C5 10.4608 5.33579 10.125 5.75 10.125C6.16421 10.125 6.5 10.4608 6.5 10.875C6.5 11.2892 6.16421 11.625 5.75 11.625Z"/>
      <path d="M5.75 15.375C5.33579 15.375 5 15.0392 5 14.625C5 14.2108 5.33579 13.875 5.75 13.875C6.16421 13.875 6.5 14.2108 6.5 14.625C6.5 15.0392 6.16421 15.375 5.75 15.375Z"/>
      <path d="M10.25 4.125C9.83579 4.125 9.5 3.78921 9.5 3.375C9.5 2.96079 9.83579 2.625 10.25 2.625C10.6642 2.625 11 2.96079 11 3.375C11 3.78921 10.6642 4.125 10.25 4.125Z"/>
      <path d="M10.25 7.875C9.83579 7.875 9.5 7.53921 9.5 7.125C9.5 6.71079 9.83579 6.375 10.25 6.375C10.6642 6.375 11 6.71079 11 7.125C11 7.53921 10.6642 7.875 10.25 7.875Z"/>
      <path d="M10.25 11.625C9.83579 11.625 9.5 11.2892 9.5 10.875C9.5 10.4608 9.83579 10.125 10.25 10.125C10.6642 10.125 11 10.4608 11 10.875C11 11.2892 10.6642 11.625 10.25 11.625Z"/>
      <path d="M10.25 15.375C9.83579 15.375 9.5 15.0392 9.5 14.625C9.5 14.2108 9.83579 13.875 10.25 13.875C10.6642 10.125 11 14.2108 11 14.625C11 15.0392 10.6642 15.375 10.25 15.375Z"/>
    </svg>
  );
}

/* ── Toggle Switch — xs size, Sampark brand ─────────────────────────── */
function ToggleSwitch({ checked, disabled, onChange }: {
  checked: boolean; disabled?: boolean; onChange?: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={'baps-toggle-switch baps-sampark baps-toggle-switch--xs' + (checked ? ' baps-toggle-switch--checked' : '')}
      onClick={onChange}
      style={{
        width: '1.75rem', height: '1rem', padding: '2px',
        borderRadius: '9999px', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        background: checked
          ? 'var(--color-sampark-primary-default, #c96868)'
          : 'var(--color-sampark-mono-30, #d5d3d3)',
        opacity: disabled ? 0.5 : 1,
        position: 'relative', display: 'inline-flex', alignItems: 'center',
        transition: 'background 150ms ease',
        flexShrink: 0,
      }}
    >
      <span style={{
        width: '0.75rem', height: '0.75rem', borderRadius: '50%',
        background: '#fff',
        transform: checked ? 'translateX(0.75rem)' : 'translateX(0)',
        transition: 'transform 150ms ease',
      }} />
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   DRAWER — shared layout wrapper that matches design system's drawer
   ══════════════════════════════════════════════════════════════════════ */
function Drawer({ visible, onClose, header, actions, children }: {
  visible: boolean;
  onClose: () => void;
  header: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  if (!visible) return null;
  return (
    <>
      <div className="baps-drawer-mask" onClick={onClose}
           style={{
             position: 'fixed', inset: 0, zIndex: 1000,
             background: 'rgba(0,0,0,0.4)',
           }} />
      <aside
        className="baps-drawer-panel"
        onClick={e => e.stopPropagation()}
        role="dialog" aria-label={header}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 1001,
          width: 'min(28rem, 90vw)',
          background: 'var(--color-sampark-surface-card, #ffffff)',
          display: 'flex', flexDirection: 'column',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
          fontFamily: 'var(--font-family)',
        }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--color-sampark-border-default, #e1e0e0)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600,
                         color: 'var(--color-sampark-text-primary, #151414)' }}>{header}</h2>
            {actions && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
                {actions}
              </div>
            )}
          </div>
          <button type="button" onClick={onClose} aria-label="Close"
                  style={{ background: 'none', border: 'none', cursor: 'pointer',
                           color: 'var(--color-sampark-text-secondary, #9f9c9c)', padding: '0.25rem',
                           marginLeft: '0.75rem' }}>
            <i className="pi pi-times" style={{ fontSize: '1rem' }} aria-hidden="true" />
          </button>
        </div>
        {/* Body */}
        <div style={{ flex: 1, overflow: 'auto', padding: '1rem 1.5rem', minHeight: 0 }}>
          {children}
        </div>
      </aside>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   COLUMN CONFIG DRAWER — design system ct-cfg-* pattern
   ══════════════════════════════════════════════════════════════════════ */
function ColumnConfigDrawer({
  visible, columns, onClose, onApply, onReset,
}: {
  visible: boolean;
  columns: Column[];
  onClose: () => void;
  onApply: (cols: Column[]) => void;
  onReset: () => void;
}) {
  const [draft, setDraft] = useState(columns.map(c => ({ ...c })));
  const [search, setSearch] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  useEffect(() => {
    if (visible) {
      setDraft(columns.map(c => ({ ...c })));
      setSearch('');
      setShowActiveOnly(false);
    }
  }, [columns, visible]);

  if (!visible) return null;

  const locked = draft.filter(c => c.locked && !c.end);
  const regular = draft.filter(c => !c.locked);
  const lockedEnd = draft.filter(c => c.locked && c.end);
  const activeCount = draft.filter(c => c.visible || c.locked).length;

  const filtered = (list: Column[]) => {
    let out = list;
    if (search) out = out.filter(c => c.label.toLowerCase().includes(search.toLowerCase()));
    if (showActiveOnly) out = out.filter(c => c.visible || c.locked);
    return out;
  };

  const toggle = (key: string) =>
    setDraft(prev => prev.map(c => c.key === key ? { ...c, visible: !c.visible } : c));

  const moveItem = (col: Column, dir: -1 | 1) => {
    setDraft(prev => {
      const next = [...prev];
      const idx = next.findIndex(c => c.key === col.key);
      const target = idx + dir;
      if (target < 0 || target >= next.length || next[target].locked) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const actions = (
    <>
      <button type="button"
              className="baps-button baps-sampark baps-button--secondary baps-button--s"
              onClick={onReset}>
        <span className="baps-button__label">Reset Default</span>
      </button>
      <button type="button"
              className="baps-button baps-sampark baps-button--primary baps-button--s"
              onClick={() => { onApply(draft); onClose(); }}>
        <span className="baps-button__label">Apply</span>
      </button>
      <span className="ct-cfg-divider" style={{
        display: 'inline-block', width: '1px', height: '1rem',
        background: 'var(--color-sampark-border-default, #e1e0e0)',
      }} />
    </>
  );

  return (
    <Drawer visible={visible} onClose={onClose} header="Fields" actions={actions}>
      <div className="ct-cfg" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', minHeight: 0 }}>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <i className="pi pi-search" style={{
            position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)',
            color: 'var(--color-sampark-text-muted, #9f9c9c)', fontSize: '0.875rem',
          }} />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search fields" aria-label="Search fields"
            style={{
              width: '100%', height: 'var(--form-field-sampark-height-default, 2rem)',
              padding: '0 0.75rem 0 2.25rem',
              border: '1px solid var(--color-sampark-border-default, #e1e0e0)',
              borderRadius: 'var(--radius-sampark-default, 0.25rem)',
              fontSize: '0.875rem', fontFamily: 'inherit',
              color: 'var(--color-sampark-text-primary, #151414)',
              background: 'var(--color-sampark-surface-card, #fff)',
              outline: 'none',
            }}
          />
        </div>

        {/* Section label + active count */}
        <div className="ct-cfg-section" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-sampark-text-primary, #151414)' }}>
            Column Fields
          </span>
          <button type="button" onClick={() => setShowActiveOnly(!showActiveOnly)} style={{
            display: 'flex', alignItems: 'center', gap: '0.25rem',
            background: 'none', border: 'none', padding: 0,
            fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer',
            color: 'var(--color-sampark-primary-default, #c96868)',
          }}>
            {showActiveOnly ? 'View More' : activeCount + ' Active Columns'}
            <i className={'pi ' + (showActiveOnly ? 'pi-angle-down' : 'pi-angle-right')} aria-hidden="true" />
          </button>
        </div>

        {/* Column list */}
        <div className="ct-cfg-list" style={{
          display: 'flex', flexDirection: 'column', overflowY: 'auto', minHeight: 0,
        }}>
          {/* Locked start */}
          {filtered(locked).map(col => (
            <div key={col.key} className="ct-cfg-item ct-cfg-item--locked" style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 0',
              borderBottom: '1px solid var(--color-sampark-border-default, #e1e0e0)',
              cursor: 'default', opacity: 0.85,
            }}>
              <span className="ct-cfg-drag-handle ct-cfg-drag-handle--static"><DragHandle dimmed /></span>
              <span className="ct-cfg-item-title" style={{
                flex: 1, fontSize: '0.875rem',
                color: 'var(--color-sampark-text-primary, #151414)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{col.label}</span>
              <ToggleSwitch checked disabled />
            </div>
          ))}

          {/* Regular (reorderable) */}
          {filtered(regular).map((col, i, arr) => {
            const prevGroup = i > 0 ? arr[i - 1].group : undefined;
            const showGroup = col.group && col.group !== prevGroup;
            return (
              <React.Fragment key={col.key}>
                {showGroup && (
                  <div className="ct-cfg-group-label" style={{
                    padding: '0.5rem 0 0.25rem',
                    fontSize: '0.75rem', fontWeight: 600,
                    color: 'var(--color-sampark-text-muted, #9f9c9c)',
                  }}>{col.group}</div>
                )}
                <div className="ct-cfg-item" style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.5rem 0',
                  borderBottom: '1px solid var(--color-sampark-border-default, #e1e0e0)',
                  cursor: 'move',
                }}>
                  <button type="button" className="ct-cfg-drag-handle"
                    aria-label={'Reorder ' + col.label}
                    onKeyDown={e => {
                      if (e.key === 'ArrowUp') { e.preventDefault(); moveItem(col, -1); }
                      if (e.key === 'ArrowDown') { e.preventDefault(); moveItem(col, 1); }
                    }}
                    style={{
                      background: 'none', border: 'none', padding: 0, cursor: 'grab',
                      color: 'var(--color-sampark-text-muted, #9f9c9c)',
                      display: 'inline-flex',
                    }}>
                    <DragHandle />
                  </button>
                  <span className="ct-cfg-item-title" style={{
                    flex: 1, fontSize: '0.875rem',
                    color: 'var(--color-sampark-text-primary, #151414)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{col.label}</span>
                  <ToggleSwitch checked={col.visible} onChange={() => toggle(col.key)} />
                </div>
              </React.Fragment>
            );
          })}

          {/* Locked end */}
          {filtered(lockedEnd).map(col => (
            <div key={col.key} className="ct-cfg-item ct-cfg-item--locked" style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 0',
              cursor: 'default', opacity: 0.85,
            }}>
              <span className="ct-cfg-drag-handle ct-cfg-drag-handle--static"><DragHandle dimmed /></span>
              <span className="ct-cfg-item-title" style={{
                flex: 1, fontSize: '0.875rem',
                color: 'var(--color-sampark-text-primary, #151414)',
              }}>{col.label}</span>
              <ToggleSwitch checked disabled />
            </div>
          ))}
        </div>
      </div>
    </Drawer>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   FILTER PANEL — Sampark filter drawer with accordion sections
   ══════════════════════════════════════════════════════════════════════ */
interface FilterState {
  family: boolean;
  individual: boolean;
  homeVisit: boolean;
  phoneCall: boolean;
  karyakars: [number, number];
  families: [number, number];
  departments: string[];
  createdBy: string[];
  createdOn: string;
  complete: boolean;
  pending: boolean;
}

const defaultFilterState: FilterState = {
  family: true,
  individual: false,
  homeVisit: true,
  phoneCall: true,
  karyakars: [50, 200],
  families: [50, 1000],
  departments: ['Satsang Network', 'Outreach', 'BKY', 'Yuvak', 'Yuvati'],
  createdBy: ['Ritesh Gupta', 'Arjun Mehta'],
  createdOn: 'custom',
  complete: true,
  pending: true,
};

const DEPARTMENTS = ['Satsang Network', 'BKY', 'Outreach', 'Yuvak', 'Yuvati', 'Bal', 'Balika'];
const CREATED_BY = ['Ritesh Gupta', 'Arjun Mehta', 'Rajiv Bansal', 'Vivek Iyer', 'Rajesh Patel'];

/* ── Accordion Panel — a single collapsible filter section ──────────── */
function AccordionPanel({ label, count, open, onToggle, children }: {
  label: string; count?: number; open: boolean;
  onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="baps-accordion-panel" style={{
      borderBottom: '1px solid var(--color-sampark-border-default, #e1e0e0)',
    }}>
      <button type="button" onClick={onToggle}
              aria-expanded={open}
              style={{
                display: 'flex', alignItems: 'center', width: '100%',
                padding: '0.75rem 0', background: 'none', border: 'none',
                cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.875rem',
                fontWeight: 600, color: 'var(--color-sampark-text-primary, #151414)',
                gap: '0.5rem',
              }}>
        <i className={'pi ' + (open ? 'pi-chevron-down' : 'pi-chevron-right')}
           aria-hidden="true" style={{ fontSize: '0.75rem' }} />
        <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
        {count != null && count > 0 && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            minWidth: '1.25rem', height: '1.25rem', borderRadius: '9999px',
            background: 'var(--color-sampark-primary-default, #c96868)',
            color: '#fff', fontSize: '0.6875rem', fontWeight: 600,
            padding: '0 0.375rem',
          }}>{count}</span>
        )}
      </button>
      {open && (
        <div style={{ padding: '0 0 0.75rem 1.5rem' }}>
          {children}
        </div>
      )}
    </div>
  );
}

/* ── Checkbox — Sampark style ──────────────────────────────────────── */
function Checkbox({ label, checked, onChange }: {
  label: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label style={{
      display: 'flex', alignItems: 'center', gap: '0.5rem',
      cursor: 'pointer', fontSize: '0.875rem',
      color: 'var(--color-sampark-text-primary, #151414)',
      padding: '0.25rem 0',
    }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
             style={{ accentColor: 'var(--color-sampark-primary-default, #c96868)', width: '1rem', height: '1rem' }} />
      {label}
    </label>
  );
}

/* ── Radio — Sampark style ─────────────────────────────────────────── */
function Radio({ name, value, label, checked, onChange }: {
  name: string; value: string; label: string; checked: boolean; onChange: (v: string) => void;
}) {
  return (
    <label style={{
      display: 'flex', alignItems: 'center', gap: '0.5rem',
      cursor: 'pointer', fontSize: '0.875rem',
      color: 'var(--color-sampark-text-primary, #151414)',
      padding: '0.25rem 0',
    }}>
      <input type="radio" name={name} value={value} checked={checked}
             onChange={() => onChange(value)}
             style={{ accentColor: 'var(--color-sampark-primary-default, #c96868)', width: '1rem', height: '1rem' }} />
      {label}
    </label>
  );
}

/* ── Range slider (simplified, using native range) ─────────────────── */
function RangeInputs({ min, max, value, onChange, ariaLabel }: {
  min: number; max: number; value: [number, number];
  onChange: (v: [number, number]) => void; ariaLabel: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <input type="range" min={min} max={max} value={value[1]}
             onChange={e => onChange([value[0], +e.target.value])}
             aria-label={ariaLabel}
             style={{ accentColor: 'var(--color-sampark-primary-default, #c96868)' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input type="number" value={value[0]}
               onChange={e => onChange([+e.target.value, value[1]])}
               aria-label={ariaLabel + ' from'}
               style={{
                 flex: 1, height: 'var(--form-field-sampark-height-default, 2rem)',
                 border: '1px solid var(--color-sampark-border-default, #e1e0e0)',
                 borderRadius: 'var(--radius-sampark-default, 0.25rem)',
                 padding: '0 0.5rem', fontSize: '0.875rem', fontFamily: 'inherit',
                 textAlign: 'center',
               }} />
        <span style={{ fontSize: '0.75rem', color: 'var(--color-sampark-text-muted, #9f9c9c)' }}>To</span>
        <input type="number" value={value[1]}
               onChange={e => onChange([value[0], +e.target.value])}
               aria-label={ariaLabel + ' to'}
               style={{
                 flex: 1, height: 'var(--form-field-sampark-height-default, 2rem)',
                 border: '1px solid var(--color-sampark-border-default, #e1e0e0)',
                 borderRadius: 'var(--radius-sampark-default, 0.25rem)',
                 padding: '0 0.5rem', fontSize: '0.875rem', fontFamily: 'inherit',
                 textAlign: 'center',
               }} />
      </div>
    </div>
  );
}

/* ── Multi-chip select (simplified) ────────────────────────────────── */
function ChipSelect({ options, selected, onChange, placeholder }: {
  options: string[]; selected: string[];
  onChange: (v: string[]) => void; placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <div onClick={() => setOpen(!open)} style={{
        display: 'flex', flexWrap: 'wrap', gap: '0.25rem',
        minHeight: 'var(--form-field-sampark-height-default, 2rem)',
        padding: '0.25rem 0.5rem',
        border: '1px solid var(--color-sampark-border-default, #e1e0e0)',
        borderRadius: 'var(--radius-sampark-default, 0.25rem)',
        cursor: 'pointer', alignItems: 'center',
        background: 'var(--color-sampark-surface-card, #fff)',
      }}>
        {selected.length === 0 && (
          <span style={{ color: 'var(--color-sampark-text-muted, #9f9c9c)', fontSize: '0.875rem' }}>{placeholder}</span>
        )}
        {selected.map(s => (
          <span key={s} style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
            padding: '0.125rem 0.5rem', borderRadius: '9999px',
            background: 'var(--color-sampark-mono-10, #f8f7f7)',
            fontSize: '0.75rem', color: 'var(--color-sampark-text-primary, #151414)',
          }}>
            {s}
            <i className="pi pi-times" style={{ fontSize: '0.625rem', cursor: 'pointer' }}
               onClick={e => { e.stopPropagation(); onChange(selected.filter(x => x !== s)); }} />
          </span>
        ))}
      </div>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
          background: 'var(--color-sampark-surface-card, #fff)',
          border: '1px solid var(--color-sampark-border-default, #e1e0e0)',
          borderRadius: 'var(--radius-sampark-default, 0.25rem)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)', maxHeight: '12rem', overflow: 'auto',
        }}>
          {options.map(opt => (
            <label key={opt} style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 0.75rem', cursor: 'pointer', fontSize: '0.875rem',
              color: 'var(--color-sampark-text-primary, #151414)',
            }}>
              <input type="checkbox" checked={selected.includes(opt)}
                     onChange={() => {
                       const next = selected.includes(opt) ? selected.filter(x => x !== opt) : [...selected, opt];
                       onChange(next);
                     }}
                     style={{ accentColor: 'var(--color-sampark-primary-default, #c96868)' }} />
              {opt}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterDrawer({ visible, onClose, filterState, setFilterState }: {
  visible: boolean;
  onClose: () => void;
  filterState: FilterState;
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;
}) {
  const [openPanels, setOpenPanels] = useState<Record<string, boolean>>({
    projectType: true, samparkType: true, karyakars: true,
    families: true, departments: true, createdBy: true,
    createdOn: true, status: true,
  });

  const togglePanel = (key: string) =>
    setOpenPanels(prev => ({ ...prev, [key]: !prev[key] }));

  const countOf = (flags: boolean[]) => flags.filter(Boolean).length;

  const clearAll = () => {
    setFilterState({
      family: false, individual: false,
      homeVisit: false, phoneCall: false,
      karyakars: [0, 500], families: [0, 2000],
      departments: [], createdBy: [],
      createdOn: '', complete: false, pending: false,
    });
  };

  const actions = (
    <>
      <button type="button"
              className="baps-button baps-sampark baps-button--secondary baps-button--s"
              onClick={clearAll}>
        <span className="baps-button__label">Clear All</span>
      </button>
      <button type="button"
              className="baps-button baps-sampark baps-button--primary baps-button--s"
              onClick={onClose}>
        <span className="baps-button__label">Apply</span>
      </button>
    </>
  );

  return (
    <Drawer visible={visible} onClose={onClose} header="Filters" actions={actions}>
      <AccordionPanel label="Project Type"
        count={countOf([filterState.family, filterState.individual])}
        open={openPanels.projectType} onToggle={() => togglePanel('projectType')}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem' }}>
          <Checkbox label="Family" checked={filterState.family}
                    onChange={v => setFilterState(s => ({ ...s, family: v }))} />
          <Checkbox label="Individual" checked={filterState.individual}
                    onChange={v => setFilterState(s => ({ ...s, individual: v }))} />
        </div>
      </AccordionPanel>

      <AccordionPanel label="Sampark Type"
        count={countOf([filterState.homeVisit, filterState.phoneCall])}
        open={openPanels.samparkType} onToggle={() => togglePanel('samparkType')}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem' }}>
          <Checkbox label="Home Visit" checked={filterState.homeVisit}
                    onChange={v => setFilterState(s => ({ ...s, homeVisit: v }))} />
          <Checkbox label="Phone Call" checked={filterState.phoneCall}
                    onChange={v => setFilterState(s => ({ ...s, phoneCall: v }))} />
        </div>
      </AccordionPanel>

      <AccordionPanel label="# Karyakars" count={1}
        open={openPanels.karyakars} onToggle={() => togglePanel('karyakars')}>
        <RangeInputs min={0} max={500} value={filterState.karyakars} ariaLabel="Karyakars"
                     onChange={v => setFilterState(s => ({ ...s, karyakars: v }))} />
      </AccordionPanel>

      <AccordionPanel label="# Families" count={1}
        open={openPanels.families} onToggle={() => togglePanel('families')}>
        <RangeInputs min={0} max={2000} value={filterState.families} ariaLabel="Families"
                     onChange={v => setFilterState(s => ({ ...s, families: v }))} />
      </AccordionPanel>

      <AccordionPanel label="Department/s" count={filterState.departments.length}
        open={openPanels.departments} onToggle={() => togglePanel('departments')}>
        <ChipSelect options={DEPARTMENTS} selected={filterState.departments}
                    onChange={v => setFilterState(s => ({ ...s, departments: v }))}
                    placeholder="Select departments" />
      </AccordionPanel>

      <AccordionPanel label="Created By" count={filterState.createdBy.length}
        open={openPanels.createdBy} onToggle={() => togglePanel('createdBy')}>
        <ChipSelect options={CREATED_BY} selected={filterState.createdBy}
                    onChange={v => setFilterState(s => ({ ...s, createdBy: v }))}
                    placeholder="Select people" />
      </AccordionPanel>

      <AccordionPanel label="Created On" count={filterState.createdOn ? 1 : 0}
        open={openPanels.createdOn} onToggle={() => togglePanel('createdOn')}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem' }}>
          <Radio name="createdOn" value="week" label="Last Week"
                 checked={filterState.createdOn === 'week'}
                 onChange={v => setFilterState(s => ({ ...s, createdOn: v }))} />
          <Radio name="createdOn" value="month" label="Last Month"
                 checked={filterState.createdOn === 'month'}
                 onChange={v => setFilterState(s => ({ ...s, createdOn: v }))} />
          <Radio name="createdOn" value="quarter" label="Last Quarter"
                 checked={filterState.createdOn === 'quarter'}
                 onChange={v => setFilterState(s => ({ ...s, createdOn: v }))} />
          <Radio name="createdOn" value="6month" label="Last 6 Month"
                 checked={filterState.createdOn === '6month'}
                 onChange={v => setFilterState(s => ({ ...s, createdOn: v }))} />
          <Radio name="createdOn" value="custom" label="Custom Date Range"
                 checked={filterState.createdOn === 'custom'}
                 onChange={v => setFilterState(s => ({ ...s, createdOn: v }))} />
        </div>
      </AccordionPanel>

      <AccordionPanel label="Status"
        count={countOf([filterState.complete, filterState.pending])}
        open={openPanels.status} onToggle={() => togglePanel('status')}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem' }}>
          <Checkbox label="Complete" checked={filterState.complete}
                    onChange={v => setFilterState(s => ({ ...s, complete: v }))} />
          <Checkbox label="Pending" checked={filterState.pending}
                    onChange={v => setFilterState(s => ({ ...s, pending: v }))} />
        </div>
      </AccordionPanel>
    </Drawer>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   PAGINATOR
   ══════════════════════════════════════════════════════════════════════ */
function getPages(current: number, totalPages: number): (number | null)[] {
  const keep = new Set([1, 2, totalPages - 1, totalPages, current - 1, current, current + 1]);
  const sorted = [...keep].filter(n => n >= 1 && n <= totalPages).sort((a, b) => a - b);
  const out: (number | null)[] = [];
  let prev = 0;
  for (const n of sorted) {
    if (prev && n - prev > 1) out.push(null);
    out.push(n);
    prev = n;
  }
  return out;
}

function Paginator({
  totalRecords, rowsPerPage, page, onPageChange, onRowsChange,
}: {
  totalRecords: number; rowsPerPage: number; page: number;
  onPageChange: (page: number) => void;
  onRowsChange: (rows: number) => void;
}) {
  const pageCount = Math.max(1, Math.ceil(totalRecords / rowsPerPage));
  const pages = getPages(page + 1, pageCount);
  const first = totalRecords === 0 ? 0 : page * rowsPerPage + 1;
  const last = Math.min((page + 1) * rowsPerPage, totalRecords);
  const goTo = (p: number) => onPageChange(Math.max(0, Math.min(p, pageCount - 1)));

  return (
    <nav className="baps-paginator" role="navigation" aria-label="Pagination">
      <span className="baps-paginator__report">Showing {first}-{last} of {totalRecords}</span>
      <select className="baps-paginator__rpp" value={rowsPerPage}
              onChange={e => onRowsChange(+e.target.value)} aria-label="Rows per page"
              style={{
                height: 'var(--form-field-sampark-height-default, 2rem)',
                border: '1px solid var(--color-sampark-border-default, #e1e0e0)',
                borderRadius: 'var(--radius-sampark-default, 0.25rem)',
                padding: '0 1.5rem 0 0.5rem', fontSize: '0.875rem', fontFamily: 'inherit',
                color: 'var(--color-sampark-text-primary, #151414)',
                background: 'var(--color-sampark-surface-card, #fff)', cursor: 'pointer',
              }}>
        {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
      </select>
      <button type="button" className="baps-paginator__nav" disabled={page === 0}
              aria-label="First page" onClick={() => goTo(0)}>
        <i className="pi pi-angle-double-left" aria-hidden="true" />
      </button>
      <button type="button" className="baps-paginator__nav" disabled={page === 0}
              aria-label="Previous page" onClick={() => goTo(page - 1)}>
        <i className="pi pi-angle-left" aria-hidden="true" />
      </button>
      {pages.map((p, i) =>
        p === null
          ? <span key={'gap' + i} className="baps-paginator__gap" aria-hidden="true">...</span>
          : <button key={p} type="button"
              className={'baps-paginator__page' + (p - 1 === page ? ' baps-paginator__page--active' : '')}
              aria-current={p - 1 === page ? 'page' : undefined}
              aria-label={'Page ' + p}
              onClick={() => goTo(p - 1)}>{p}</button>
      )}
      <button type="button" className="baps-paginator__nav" disabled={page >= pageCount - 1}
              aria-label="Next page" onClick={() => goTo(page + 1)}>
        <i className="pi pi-angle-right" aria-hidden="true" />
      </button>
      <button type="button" className="baps-paginator__nav" disabled={page >= pageCount - 1}
              aria-label="Last page" onClick={() => goTo(pageCount - 1)}>
        <i className="pi pi-angle-double-right" aria-hidden="true" />
      </button>
      <span className="baps-paginator__jump">
        <span className="baps-paginator__jump-label">Go to</span>
        <input className="baps-paginator__jump-input" type="text" inputMode="numeric"
               defaultValue={page + 1} key={page} aria-label="Go to page"
               onKeyDown={e => { if (e.key === 'Enter') { goTo(+e.currentTarget.value - 1); e.currentTarget.blur(); } }}
               onBlur={e => goTo(+e.currentTarget.value - 1)} />
      </span>
    </nav>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════════════════════════════ */
function frozenLeftOffset(columns: Column[], colIndex: number): number {
  let left = 0;
  for (let i = 0; i < colIndex; i++) {
    if (columns[i].locked || columns[i].frozen) {
      left += COLUMN_WIDTH_NUM[columns[i].key] ?? 160;
    }
  }
  return left;
}

const secondaryStyle: React.CSSProperties = {
  fontSize: '0.75rem', color: 'var(--table-secondary-text, var(--color-sampark-mono-60, #9f9c9c))',
  overflow: 'hidden', textOverflow: 'ellipsis',
};

const cellStackStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: 0,
};

function renderCell(col: Column, row: typeof templates[0]) {
  switch (col.key) {
    case 'name':
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '2rem', height: '2rem', borderRadius: '50%', flexShrink: 0,
            background: 'var(--color-sampark-mono-10, #f8f7f7)',
            color: 'var(--color-sampark-text-secondary, #9f9c9c)',
          }}>
            <GridIcon />
          </span>
          <span style={cellStackStyle}>
            <span style={{ fontWeight: 500 }}>{row.name}</span>
            <small style={secondaryStyle}>{row.description}</small>
          </span>
        </div>
      );
    case 'project':
      return (
        <span style={cellStackStyle}>
          <span>{row.project}</span>
          <small style={secondaryStyle}>{row.sampark}</small>
        </span>
      );
    case 'scope':
      return (
        <span style={cellStackStyle}>
          <span>{row.scope}</span>
          <small style={secondaryStyle}>{row.level}</small>
        </span>
      );
    case 'departments':
      return (
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap' }}>
          {row.departments.slice(0, 2).map(d => (
            <Tag key={d} value={d} severity="contrast" />
          ))}
          {row.departments.length > 2 && <Tag value={'+' + (row.departments.length - 2)} />}
          {row.more && <Tag value={row.more} />}
        </span>
      );
    case 'duration':
      return (
        <span style={cellStackStyle}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {row.duration}
            {row.recurring && <i className="pi pi-sync" aria-hidden="true" />}
          </span>
          <small style={secondaryStyle}>{row.cadence}</small>
        </span>
      );
    case 'createdBy':
      return (
        <span style={cellStackStyle}>
          <span>{row.createdBy}</span>
          <small style={secondaryStyle}>{row.createdOn}</small>
        </span>
      );
    case 'status':
      return <Tag value={row.status} severity={statusSeverity[row.status]} />;
    default:
      return null;
  }
}

/* ══════════════════════════════════════════════════════════════════════
   TABLE — main export
   ══════════════════════════════════════════════════════════════════════ */
export function Table() {
  const [columns, setColumns] = useState(initialColumns.map(c => ({ ...c })));
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showConfig, setShowConfig] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterState, setFilterState] = useState<FilterState>({ ...defaultFilterState });

  const visibleCols = columns.filter(c => c.visible);

  const activeFilterCount = [
    filterState.family || filterState.individual,
    filterState.homeVisit || filterState.phoneCall,
    filterState.karyakars[0] !== 0 || filterState.karyakars[1] !== 500,
    filterState.families[0] !== 0 || filterState.families[1] !== 2000,
    filterState.departments.length > 0,
    filterState.createdBy.length > 0,
    !!filterState.createdOn,
    filterState.complete || filterState.pending,
  ].filter(Boolean).length;

  return (
    <>
      <div className="baps-table-surface" style={{
        display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0,
      }}>
        <div style={{
          flex: 1, overflow: 'auto',
          border: '1px solid var(--table-border, var(--color-sampark-border-default, #e1e0e0))',
          borderRadius: 'var(--radius-sampark-default, 0.25rem)',
          boxShadow: 'var(--shadow-sampark-xs, 0 1px 2px rgba(16,24,40,0.15))',
          background: 'var(--table-row-bg, #fff)',
        }}>
          <table role="table" style={{
            minWidth: '102rem', borderCollapse: 'separate', borderSpacing: 0, width: '100%',
            fontFamily: 'var(--font-family)', fontSize: '0.875rem',
          }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 3 }}>
              <tr>
                {visibleCols.map((col) => {
                  const frozen = col.locked || col.frozen;
                  const colIdx = columns.indexOf(col);
                  return (
                    <th key={col.key}
                        className={frozen ? 'dt-frozen-left' : ''}
                        style={{
                          width: COLUMN_WIDTHS[col.key],
                          left: frozen ? frozenLeftOffset(columns, colIdx) + 'px' : undefined,
                          position: frozen ? 'sticky' : undefined,
                          zIndex: frozen ? 4 : undefined,
                          height: '2.5rem',
                          background: 'var(--table-header-bg, var(--color-sampark-mono-10, #f8f7f7))',
                          color: 'var(--table-header-text, var(--color-sampark-mono-60, #9f9c9c))',
                          borderRight: '1px solid var(--table-border, #e1e0e0)',
                          borderBottom: '1px solid var(--table-border, #e1e0e0)',
                          padding: '0 0.75rem',
                          fontWeight: 600, lineHeight: 1.3,
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          textAlign: 'left',
                        }}>
                      {col.label}
                    </th>
                  );
                })}
                <th style={{
                  width: '6.0625rem', position: 'sticky', right: 0, zIndex: 4,
                  background: 'var(--table-header-bg, #f8f7f7)',
                  borderBottom: '1px solid var(--table-border, #e1e0e0)',
                  textAlign: 'center', padding: '0 0.75rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                    {/* Filter icon with badge */}
                    <button type="button" aria-label="Filters"
                            onClick={() => setShowFilters(true)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              width: '1.75rem', height: '1.75rem', border: 0, borderRadius: '50%',
                              background: 'transparent', cursor: 'pointer',
                              color: 'var(--color-sampark-text-secondary, #9f9c9c)',
                              position: 'relative',
                            }}>
                      <i className="pi pi-filter" aria-hidden="true" />
                      {activeFilterCount > 0 && (
                        <span style={{
                          position: 'absolute', top: '-4px', right: '-4px',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          minWidth: '1rem', height: '1rem', borderRadius: '9999px',
                          background: 'var(--color-sampark-primary-default, #c96868)',
                          color: '#fff', fontSize: '0.625rem', fontWeight: 600,
                        }}>{activeFilterCount}</span>
                      )}
                    </button>
                    {/* Column config icon */}
                    <button type="button" aria-label="Column settings"
                            onClick={() => setShowConfig(true)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                              width: '1.75rem', height: '1.75rem', border: 0, borderRadius: '50%',
                              background: 'transparent', cursor: 'pointer',
                              color: 'var(--color-sampark-text-secondary, #9f9c9c)',
                            }}>
                      <i className="pi pi-objects-column" aria-hidden="true" />
                    </button>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {templates.map((row) => (
                <tr key={row.name}
                    style={{ background: 'var(--table-row-bg, #fff)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--table-row-hover, #f3f2f2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--table-row-bg, #fff)'; }}>
                  {visibleCols.map((col) => {
                    const frozen = col.locked || col.frozen;
                    const colIdx = columns.indexOf(col);
                    return (
                      <td key={col.key}
                          style={{
                            padding: col.key === 'name' ? '0.625rem 1rem' : '1.125rem 1rem',
                            borderRight: '1px solid var(--table-border, #e1e0e0)',
                            borderBottom: '1px solid var(--table-border, #e1e0e0)',
                            color: 'var(--table-body-text, #151414)',
                            position: frozen ? 'sticky' : undefined,
                            left: frozen ? frozenLeftOffset(columns, colIdx) + 'px' : undefined,
                            zIndex: frozen ? 1 : undefined,
                            background: 'inherit',
                            verticalAlign: 'middle',
                          }}>
                        {renderCell(col, row)}
                      </td>
                    );
                  })}
                  <td style={{
                    position: 'sticky', right: 0, zIndex: 1,
                    borderBottom: '1px solid var(--table-border, #e1e0e0)',
                    background: 'inherit', padding: '0.625rem 1rem',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <button type="button" aria-label="Edit"
                              className="baps-button baps-sampark baps-button--ghost-secondary baps-button--icon-only"
                              style={{ width: '1.75rem', height: '1.75rem', padding: 0 }}>
                        <i className="pi pi-pencil" aria-hidden="true" />
                      </button>
                      <button type="button" aria-label="Delete"
                              className="baps-button baps-sampark baps-button--ghost-secondary baps-button--icon-only"
                              style={{ width: '1.75rem', height: '1.75rem', padding: 0 }}>
                        <i className="pi pi-trash" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <footer className="pj-footer">
        <Paginator totalRecords={250} rowsPerPage={rowsPerPage} page={currentPage}
                   onPageChange={setCurrentPage}
                   onRowsChange={(r) => { setRowsPerPage(r); setCurrentPage(0); }} />
      </footer>

      <ColumnConfigDrawer
        visible={showConfig}
        columns={columns}
        onClose={() => setShowConfig(false)}
        onApply={(next) => setColumns(next)}
        onReset={() => setColumns(initialColumns.map(c => ({ ...c })))}
      />
      <FilterDrawer
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        filterState={filterState}
        setFilterState={setFilterState}
      />
    </>
  );
}
`;

fs.writeFileSync(path, FULL);
console.log('Table.tsx rewritten with Column Config + Filter Panel + proper borders.');
