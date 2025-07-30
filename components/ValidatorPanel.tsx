import { useEffect, useState } from 'react';
import { validateData, ValidationError } from '@/utils/validateData';

interface Props {
  clients: any[];
  workers: any[];
  tasks: any[];
  errors: string[];
  setErrors: (e: string[]) => void;
  setStructuredErrors?: (e: any[]) => void;
  highlightedRow?: { entity: string; row: number } | null;
  setHighlightedRow?: (row: { entity: string; row: number } | null) => void;
}

export default function ValidatorPanel({ 
  clients, 
  workers, 
  tasks, 
  errors, 
  setErrors,
  setStructuredErrors,
  highlightedRow,
  setHighlightedRow 
}: Props) {
  const [detailedErrors, setDetailedErrors] = useState<ValidationError[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const validationErrors = validateData(clients, workers, tasks);
    setDetailedErrors(validationErrors);
    setErrors(validationErrors.map(e => `${e.entity} ${e.row !== undefined ? `(row ${e.row + 1})` : ''}: ${e.message}`));
    if (setStructuredErrors) {
      setStructuredErrors(validationErrors);
    }
  }, [clients, workers, tasks, setErrors, setStructuredErrors]);

  const getErrorColor = (type: string) => {
    switch (type) {
      case 'duplicate': return '#ef4444';
      case 'range': return '#f59e42';
      case 'reference': return '#6366f1';
      case 'malformed': return '#fbbf24';
      case 'coverage': return '#3b82f6';
      case 'overload': return '#ec4899';
      default: return '#ef4444';
    }
  };

  return (
    <div className="card" style={{marginBottom: 0}}>
      <div className="card-header" data-section="validation">
        <h2>
          <span className="icon">✅</span>
          Data Validation
        </h2>
      </div>
      <div className="card-body">
        <div style={{
          background: 'linear-gradient(90deg, #fee2e2 0%, #fca5a5 100%)',
          borderRadius: '0.75rem',
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{
            background: '#ef4444',
            color: 'white',
            borderRadius: '9999px',
            padding: '0.5rem 1rem',
            fontWeight: 600,
            fontSize: '1rem',
            marginRight: '1rem',
            display: 'inline-block'
          }}>Errors: {detailedErrors.length}</span>
          <button style={{
            background: '#fff',
            color: '#ef4444',
            border: '1px solid #ef4444',
            borderRadius: '0.5rem',
            padding: '0.5rem 1rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.2s',
          }} onClick={() => setShowDetails(!showDetails)}>
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
        {detailedErrors.length === 0 ? (
          <div style={{color: '#16a34a', fontWeight: 600, fontSize: '1.125rem', textAlign: 'center', margin: '2rem 0'}}>
            ✅ No validation errors found!
          </div>
        ) : showDetails && (
          <ul style={{marginTop: '1rem', listStyle: 'none', padding: 0}}>
            {detailedErrors.map((err, i) => (
              <li key={i} style={{
                background: '#fff1f2',
                borderLeft: `6px solid ${getErrorColor(err.type)}`,
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                marginBottom: '0.75rem',
                fontWeight: 500,
                color: '#b91c1c',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                cursor: 'pointer',
                boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03)'
              }} onClick={() => setHighlightedRow && err.row !== undefined && setHighlightedRow({ entity: err.entity, row: err.row })}>
                <span style={{
                  background: getErrorColor(err.type),
                  color: 'white',
                  borderRadius: '9999px',
                  padding: '0.25rem 0.75rem',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  marginRight: '0.5rem',
                  display: 'inline-block'
                }}>{err.type}</span>
                <span>{err.entity} {err.row !== undefined ? `(Row ${err.row + 1})` : ''}: {err.message}</span>
              </li>
            ))}
          </ul>
        )}
        <div style={{
          background: 'linear-gradient(90deg, #f0fdf4 0%, #bbf7d0 100%)',
          borderRadius: '0.75rem',
          padding: '1rem',
          marginTop: '2rem',
          color: '#166534',
          fontWeight: 500
        }}>
          <div style={{fontWeight: 700, marginBottom: '0.5rem'}}>💡 Quick Fix Tips:</div>
          <ul style={{fontSize: '0.95rem', marginLeft: '1.5rem'}}>
            <li>• Click on any error to highlight the problematic row in the data grid</li>
            <li>• Duplicate IDs: Ensure each ClientID, WorkerID, and TaskID is unique</li>
            <li>• Priority levels: Must be between 1-5 for clients and workers</li>
            <li>• Phase formats: Use "[1,2,3]" or "1-3" for phase lists</li>
            <li>• Skills: Make sure all required task skills are covered by workers</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
