import { useState } from 'react';

interface Props {
  clients: any[];
  workers: any[];
  tasks: any[];
  rules: any[];
  priorities: any;
}

export default function ExportPanel({ clients, workers, tasks, rules, priorities }: Props) {
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const exportData = async () => {
    setIsExporting(true);
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      if (exportFormat === 'json') {
        const exportData = {
          metadata: includeMetadata ? {
            exportedAt: new Date().toISOString(),
            version: '1.0.0',
            totalRecords: {
              clients: clients.length,
              workers: workers.length,
              tasks: tasks.length
            }
          } : undefined,
          data: { clients, workers, tasks },
          configuration: { rules, priorities }
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        downloadFile(blob, `data-alchemist-export-${timestamp}.json`);
      } else {
        const csvData = {
          clients: convertToCSV(clients),
          workers: convertToCSV(workers),
          tasks: convertToCSV(tasks)
        };
        const JSZip = (await import('jszip')).default;
        const zip = new JSZip();
        zip.file('clients.csv', csvData.clients);
        zip.file('workers.csv', csvData.workers);
        zip.file('tasks.csv', csvData.tasks);
        if (rules.length > 0) {
          zip.file('rules.json', JSON.stringify(rules, null, 2));
        }
        if (priorities) {
          zip.file('priorities.json', JSON.stringify(priorities, null, 2));
        }
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        downloadFile(zipBlob, `data-alchemist-export-${timestamp}.zip`);
      }
    } catch (error) {
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const convertToCSV = (data: any[]): string => {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvRows.push(values.join(','));
    });
    return csvRows.join('\n');
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportIndividualFiles = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    if (clients.length > 0) {
      const clientsBlob = new Blob([convertToCSV(clients)], { type: 'text/csv' });
      downloadFile(clientsBlob, `clients-${timestamp}.csv`);
    }
    if (workers.length > 0) {
      const workersBlob = new Blob([convertToCSV(workers)], { type: 'text/csv' });
      downloadFile(workersBlob, `workers-${timestamp}.csv`);
    }
    if (tasks.length > 0) {
      const tasksBlob = new Blob([convertToCSV(tasks)], { type: 'text/csv' });
      downloadFile(tasksBlob, `tasks-${timestamp}.csv`);
    }
    if (rules.length > 0) {
      const rulesBlob = new Blob([JSON.stringify(rules, null, 2)], { type: 'application/json' });
      downloadFile(rulesBlob, `rules-${timestamp}.json`);
    }
    if (priorities) {
      const prioritiesBlob = new Blob([JSON.stringify(priorities, null, 2)], { type: 'application/json' });
      downloadFile(prioritiesBlob, `priorities-${timestamp}.json`);
    }
  };

  const totalRecords = clients.length + workers.length + tasks.length;

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem'}}>
        <h3 style={{fontWeight: 700, fontSize: '1.25rem'}}>📤 Export Data</h3>
        <div style={{fontSize: '1rem', color: '#059669', fontWeight: 600}}>{totalRecords} total records ready</div>
      </div>
      <div style={{display: 'flex', gap: '1rem', marginBottom: '1rem'}}>
        <button onClick={exportData} disabled={isExporting || totalRecords === 0} style={{
          flex: 1,
          background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          padding: '0.75rem 1.5rem',
          fontWeight: 600,
          fontSize: '1rem',
          cursor: isExporting || totalRecords === 0 ? 'not-allowed' : 'pointer',
          opacity: isExporting || totalRecords === 0 ? 0.5 : 1,
          boxShadow: '0 2px 8px 0 rgba(16,185,129,0.15)'
        }}>{isExporting ? '📤 Exporting...' : `📤 Export All (${exportFormat.toUpperCase()})`}</button>
        <button onClick={exportIndividualFiles} disabled={totalRecords === 0} style={{
          background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          padding: '0.75rem 1.5rem',
          fontWeight: 600,
          fontSize: '1rem',
          cursor: totalRecords === 0 ? 'not-allowed' : 'pointer',
          opacity: totalRecords === 0 ? 0.5 : 1,
          boxShadow: '0 2px 8px 0 rgba(59,130,246,0.15)'
        }}>📁 Individual Files</button>
      </div>
      <div style={{display: 'flex', gap: '1rem', marginBottom: '1rem'}}>
        <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500}}>
          <input type="radio" value="json" checked={exportFormat === 'json'} onChange={e => setExportFormat(e.target.value as 'json' | 'csv')} />
          <span style={{background: '#f3f4f6', color: '#059669', borderRadius: '0.5rem', padding: '0.25rem 0.75rem', fontWeight: 600}}>Single JSON file</span>
        </label>
        <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500}}>
          <input type="radio" value="csv" checked={exportFormat === 'csv'} onChange={e => setExportFormat(e.target.value as 'json' | 'csv')} />
          <span style={{background: '#f3f4f6', color: '#3b82f6', borderRadius: '0.5rem', padding: '0.25rem 0.75rem', fontWeight: 600}}>Multiple CSV files (ZIP)</span>
        </label>
        <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500}}>
          <input type="checkbox" checked={includeMetadata} onChange={e => setIncludeMetadata(e.target.checked)} />
          <span style={{background: '#f3f4f6', color: '#64748b', borderRadius: '0.5rem', padding: '0.25rem 0.75rem', fontWeight: 600}}>Include metadata and configuration</span>
        </label>
      </div>
      <div style={{background: 'linear-gradient(90deg, #f0fdf4 0%, #bbf7d0 100%)', borderRadius: '0.75rem', padding: '1rem', color: '#166534', fontWeight: 500, marginBottom: '1rem'}}>
        <div style={{fontWeight: 700, marginBottom: '0.5rem'}}>📊 Data Summary:</div>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem', fontSize: '0.95rem'}}>
          <div style={{textAlign: 'center'}}>
            <div style={{fontWeight: 700, color: '#3b82f6', fontSize: '1.25rem'}}>{clients.length}</div>
            <div style={{color: '#64748b'}}>Clients</div>
          </div>
          <div style={{textAlign: 'center'}}>
            <div style={{fontWeight: 700, color: '#10b981', fontSize: '1.25rem'}}>{workers.length}</div>
            <div style={{color: '#64748b'}}>Workers</div>
          </div>
          <div style={{textAlign: 'center'}}>
            <div style={{fontWeight: 700, color: '#8b5cf6', fontSize: '1.25rem'}}>{tasks.length}</div>
            <div style={{color: '#64748b'}}>Tasks</div>
          </div>
          <div style={{textAlign: 'center'}}>
            <div style={{fontWeight: 700, color: '#ef4444', fontSize: '1.25rem'}}>{rules.length}</div>
            <div style={{color: '#64748b'}}>Rules</div>
          </div>
        </div>
      </div>
      <div style={{background: 'linear-gradient(90deg, #f3f4f6 0%, #e0e7ef 100%)', borderRadius: '0.75rem', padding: '1rem', color: '#6366f1', fontWeight: 500}}>
        <div style={{fontWeight: 700, marginBottom: '0.5rem'}}>💡 Export Tips:</div>
        <ul style={{fontSize: '0.95rem', marginLeft: '1.5rem', color: '#64748b'}}>
          <li>JSON format includes all data and configuration in one file</li>
          <li>CSV format creates separate files for each data type</li>
          <li>Individual files option downloads each dataset separately</li>
          <li>Metadata includes export timestamp and record counts</li>
        </ul>
      </div>
    </div>
  );
} 