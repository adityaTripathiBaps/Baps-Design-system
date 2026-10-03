const fs = require('fs');
const path = 'd:/baps-projects/react-app-shell-sampark/src/components/Table.tsx';
let content = fs.readFileSync(path, 'utf8');

const missingComponents = `
  function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
    return (
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.25rem 0' }}>
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ margin: 0, width: '1.25rem', height: '1.25rem', accentColor: 'var(--color-sampark-primary-default, #c96868)' }} />
        <span style={{ fontSize: '0.875rem' }}>{label}</span>
      </label>
    );
  }

  function Radio({ label, name, checked, onChange }: { label: string; name: string; checked: boolean; onChange: (v: boolean) => void }) {
    return (
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.25rem 0' }}>
        <input type="radio" name={name} checked={checked} onChange={e => onChange(e.target.checked)} style={{ margin: 0, width: '1.25rem', height: '1.25rem', accentColor: 'var(--color-sampark-primary-default, #c96868)' }} />
        <span style={{ fontSize: '0.875rem' }}>{label}</span>
      </label>
    );
  }

  function ChipSelect({ options, selected, onChange }: { options: string[]; selected: string[]; onChange: (v: string[]) => void }) {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {options.map(opt => {
          const isSelected = selected.includes(opt);
          return (
            <button key={opt} type="button" onClick={() => onChange(isSelected ? selected.filter(s => s !== opt) : [...selected, opt])}
              style={{
                background: isSelected ? 'var(--color-sampark-primary-default, #c96868)' : 'var(--color-sampark-surface-card, #fff)',
                color: isSelected ? '#fff' : 'var(--color-sampark-text-primary, #151414)',
                border: '1px solid var(--color-sampark-border-default, #e1e0e0)',
                padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer'
              }}>
              {opt} {isSelected && <i className="pi pi-times" style={{ fontSize: '0.625rem', marginLeft: '0.25rem' }} />}
            </button>
          );
        })}
      </div>
    );
  }

  function RangeInputs({ min, max, value, onChange }: { min: number; max: number; value: [number, number]; onChange: (v: [number, number]) => void }) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <input type="range" min={min} max={max} value={value[1]} onChange={e => onChange([value[0], Number(e.target.value)])} style={{ width: '100%', accentColor: 'var(--color-sampark-primary-default, #c96868)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input type="number" value={value[0]} onChange={e => onChange([Number(e.target.value), value[1]])} style={{ width: '100%', padding: '0.25rem', border: '1px solid var(--color-sampark-border-default, #e1e0e0)', borderRadius: '4px' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--color-sampark-text-muted, #595656)' }}>To</span>
          <input type="number" value={value[1]} onChange={e => onChange([value[0], Number(e.target.value)])} style={{ width: '100%', padding: '0.25rem', border: '1px solid var(--color-sampark-border-default, #e1e0e0)', borderRadius: '4px' }} />
        </div>
      </div>
    );
  }

`;

content = content.replace('function FilterDrawer', missingComponents + '  function FilterDrawer');
fs.writeFileSync(path, content, 'utf8');
console.log('Restored missing components!');
