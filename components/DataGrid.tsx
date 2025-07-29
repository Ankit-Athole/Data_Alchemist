import React, { useRef } from 'react';

interface Props {
  title: string;
  data: any[];
  setData: (data: any[]) => void;
  highlightedRow?: { entity: string; row: number } | null;
  entityType: string;
}

export default function DataGrid({ title, data, setData, highlightedRow, entityType }: Props) {
  const inputRefs = useRef<(HTMLInputElement | null)[][]>([]);

  const edit = (i: number, k: string, v: string) => {
    const newData = [...data];
    newData[i] = { ...newData[i], [k]: v };
    setData(newData);
  };

  const isRowHighlighted = (i: number) =>
    highlightedRow && highlightedRow.entity === entityType && highlightedRow.row === i;

  const getEntityIcon = () => {
    switch (entityType) {
      case 'clients': return '📊';
      case 'workers': return '👥';
      case 'tasks': return '📋';
      default: return '📄';
    }
  };

  const getEntityColor = () => {
    switch (entityType) {
      case 'clients': return '#3b82f6';
      case 'workers': return '#10b981';
      case 'tasks': return '#8b5cf6';
      default: return '#64748b';
    }
  };

  // Keyboard navigation and edit UX
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, rowIdx: number, colIdx: number, key: string) => {
    if (e.key === 'Enter') {
      // Save and move to next row
      if (inputRefs.current[rowIdx + 1] && inputRefs.current[rowIdx + 1][colIdx]) {
        inputRefs.current[rowIdx + 1][colIdx]?.focus();
      }
    } else if (e.key === 'Escape') {
      // Blur/cancel
      (e.target as HTMLInputElement).blur();
    } else if (e.key === 'Tab') {
      // Move to next cell
      e.preventDefault();
      const nextCol = e.shiftKey ? colIdx - 1 : colIdx + 1;
      if (inputRefs.current[rowIdx] && inputRefs.current[rowIdx][nextCol]) {
        inputRefs.current[rowIdx][nextCol]?.focus();
      } else if (!e.shiftKey && inputRefs.current[rowIdx + 1] && inputRefs.current[rowIdx + 1][0]) {
        inputRefs.current[rowIdx + 1][0]?.focus();
      }
    }
  };

  if (data.length === 0) {
    return (
      <div style={{ background: '#fff', borderRadius: '1.5rem', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 8px 32px 0 rgba(31,41,55,0.08)', minHeight: 320 }}>
        <div style={{ background: `linear-gradient(90deg, ${getEntityColor()} 0%, #6366f1 100%)`, padding: '1.5rem 2rem', color: 'white' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '2rem' }}>{getEntityIcon()}</span>
            {title}
          </h3>
        </div>
        <div style={{ padding: '3rem 0', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>{getEntityIcon()}</div>
          <h4 style={{ fontWeight: 700, fontSize: '1.25rem', color: '#374151', marginBottom: '0.5rem' }}>No {title.toLowerCase()} data</h4>
          <p style={{ color: '#64748b' }}>Upload files to see data here</p>
        </div>
      </div>
    );
  }

  // Prepare refs for keyboard navigation
  inputRefs.current = data.map((row, i) =>
    Object.keys(row).map((_, j) => inputRefs.current[i]?.[j] || null)
  );

  return (
    <div style={{ background: '#fff', borderRadius: '1.5rem', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 8px 32px 0 rgba(31,41,55,0.08)' }}>
      <div style={{ background: `linear-gradient(90deg, ${getEntityColor()} 0%, #6366f1 100%)`, padding: '1.5rem 2rem', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '2rem' }}>{getEntityIcon()}</span>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '1.15rem', margin: 0 }}>{title}</h3>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem', margin: 0 }}>{data.length} records loaded</p>
          </div>
        </div>
        {highlightedRow && highlightedRow.entity === entityType && (
          <span style={{ background: '#fde68a', color: '#b45309', fontWeight: 600, borderRadius: '9999px', padding: '0.5rem 1rem', fontSize: '0.95rem', marginLeft: '1rem' }}>⚠️ Highlighted</span>
        )}
      </div>
      <div style={{ overflow: 'auto', maxHeight: 480 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '1rem' }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 2, background: '#f3f4f6' }}>
            <tr>
              {Object.keys(data[0]).map((k, colIdx) => (
                <th key={k} style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: 700,
                  color: '#374151',
                  borderBottom: '2px solid #e5e7eb',
                  textTransform: 'capitalize',
                  fontSize: '0.98rem',
                  background: '#f3f4f6',
                  position: 'sticky',
                  top: 0,
                  zIndex: 2
                }}>{k.replace(/([A-Z])/g, ' $1').trim()}</th>
              ))}
            </tr>
          </thead>
        <tbody>
            {data.map((row, i) => (
              <tr
                key={i}
                style={{
                  background: isRowHighlighted(i)
                    ? '#fef9c3'
                    : i % 2 === 0
                      ? '#fff'
                      : '#f9fafb',
                  transition: 'background 0.2s',
                  borderLeft: isRowHighlighted(i) ? '4px solid #facc15' : undefined,
                  boxShadow: isRowHighlighted(i) ? '0 2px 8px 0 #fde68a44' : undefined
                }}
              >
                {Object.entries(row).map(([k, v], j) => (
                  <td key={k} style={{
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid #e5e7eb',
                    verticalAlign: 'middle',
                    position: 'relative'
                  }}>
                    <input
                      ref={el => {
                        if (!inputRefs.current[i]) inputRefs.current[i] = [];
                        inputRefs.current[i][j] = el;
                      }}
                      value={v as string}
                      style={{
                        width: '100%',
                        background: isRowHighlighted(i) ? '#fef08a' : '#fff',
                        border: isRowHighlighted(i) ? '1.5px solid #facc15' : '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        fontSize: '1rem',
                        fontWeight: 500,
                        outline: 'none',
                        boxShadow: isRowHighlighted(i) ? '0 0 0 2px #fde68a' : 'none',
                        transition: 'all 0.2s'
                      }}
                      onChange={e => edit(i, k, e.target.value)}
                      onFocus={e => e.target.select()}
                      onKeyDown={e => handleKeyDown(e, i, j, k)}
                      aria-label={`Edit ${k}`}
                    />
                  </td>
                ))}
              </tr>
          ))}
        </tbody>
      </table>
      </div>
      <div style={{ background: 'linear-gradient(90deg, #f3f4f6 0%, #e0e7ef 100%)', padding: '1rem 2rem', borderTop: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '1rem', color: '#64748b' }}>
        <span>{data.length} {title.toLowerCase()} loaded</span>
        {highlightedRow && highlightedRow.entity === entityType && (
          <span style={{ background: '#fef9c3', color: '#b45309', fontWeight: 600, borderRadius: '9999px', padding: '0.5rem 1rem', fontSize: '0.95rem', marginLeft: '1rem' }}>⚠️ Row {highlightedRow.row + 1} highlighted due to validation error</span>
        )}
        <span style={{ fontSize: '0.95rem', color: '#94a3b8' }}>Click to edit · Tab/Shift+Tab to move · Enter to save · Esc to cancel</span>
      </div>
    </div>
  );
}
