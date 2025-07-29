import { useState } from 'react';
import { modifyDataWithNLP, applyModifications, ModificationResult } from '@/utils/nlpModify';

interface Props {
  clients: any[];
  workers: any[];
  tasks: any[];
  setClients: (data: any[]) => void;
  setWorkers: (data: any[]) => void;
  setTasks: (data: any[]) => void;
}

export default function DataModifier({ clients, workers, tasks, setClients, setWorkers, setTasks }: Props) {
  const [command, setCommand] = useState('');
  const [isModifying, setIsModifying] = useState(false);
  const [lastResult, setLastResult] = useState<ModificationResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleModify = async () => {
    if (!command.trim()) return;
    setIsModifying(true);
    
    try {
      const result = await modifyDataWithNLP(command, clients, workers, tasks);
      if (result) {
        setLastResult(result);
        setShowPreview(true);
      }
    } catch (error) {
      console.error('Modification failed:', error);
    } finally {
      setIsModifying(false);
    }
  };

  const applyChanges = () => {
    if (!lastResult) return;
    
    const newData = applyModifications(
      lastResult.entity === 'clients' ? clients :
      lastResult.entity === 'workers' ? workers : tasks,
      lastResult.modifications
    );
    
    if (lastResult.entity === 'clients') {
      setClients(newData);
    } else if (lastResult.entity === 'workers') {
      setWorkers(newData);
    } else {
      setTasks(newData);
    }
    
    setLastResult(null);
    setShowPreview(false);
    setCommand('');
  };

  const exampleCommands = [
    'Increase priority of all clients in group Alpha by 1',
    'Add frontend skill to all workers',
    'Set duration of all UI tasks to 2 phases',
    'Change all high priority clients to priority 5',
    'Add phase 3 to all workers available slots'
  ];

  return (
    <div style={{ borderRadius: '2rem', overflow: 'hidden', background: '#fff', boxShadow: '0 8px 32px 0 rgba(31,41,55,0.08)', border: '1px solid #e5e7eb', margin: '0 auto', maxWidth: 900 }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)', padding: '2rem 2.5rem', color: 'white', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '2.5rem', marginRight: '0.5rem' }}>🔧</span>
        <h2 style={{ fontWeight: 800, fontSize: '2rem', letterSpacing: '-0.02em', margin: 0 }}>AI Data Modifier</h2>
      </div>
      
      <div style={{ padding: '2.5rem', background: '#fff', borderBottomLeftRadius: '2rem', borderBottomRightRadius: '2rem' }}>
        {/* Command Input */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <span style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa', fontSize: '1.5rem' }}>🔧</span>
              <input
                type="text"
                value={command}
                onChange={e => setCommand(e.target.value)}
                placeholder="Describe what you want to change... (e.g., 'Increase priority of all clients in group Alpha by 1')"
                style={{
                  width: '100%',
                  padding: '1.25rem 1rem 1.25rem 3rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '1rem',
                  fontSize: '1.15rem',
                  fontWeight: 500,
                  outline: 'none',
                  background: '#f9fafb',
                  transition: 'border 0.2s, box-shadow 0.2s',
                  boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03)'
                }}
              />
            </div>
            <button
              onClick={handleModify}
              disabled={isModifying || !command.trim()}
              style={{
                padding: '1.25rem 2.5rem',
                background: isModifying || !command.trim() ? 'linear-gradient(90deg, #c4b5fd 0%, #a78bfa 100%)' : 'linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '1rem',
                fontWeight: 700,
                fontSize: '1.15rem',
                cursor: isModifying || !command.trim() ? 'not-allowed' : 'pointer',
                opacity: isModifying || !command.trim() ? 0.6 : 1,
                boxShadow: '0 2px 8px 0 rgba(139,92,246,0.10)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.2s'
              }}
            >
              {isModifying ? (
                <>
                  <span className="animate-spin" style={{ display: 'inline-block', width: 22, height: 22, border: '3px solid #fff', borderTop: '3px solid #a78bfa', borderRadius: '50%', marginRight: 8, animation: 'spin 1s linear infinite' }}></span>
                  <span>Modifying...</span>
                </>
              ) : (
                <>
                  <span style={{ fontSize: '1.25rem' }}>🔧</span>
                  <span>Modify</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Example Commands */}
        <div style={{ background: 'linear-gradient(90deg, #f3e8ff 0%, #e9d5ff 100%)', borderRadius: '1rem', padding: '1.25rem', marginBottom: '2rem' }}>
          <div style={{ fontWeight: 700, color: '#8b5cf6', marginBottom: '0.75rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>💡</span> Try these examples:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {exampleCommands.map((example, index) => (
              <button
                key={index}
                onClick={() => setCommand(example)}
                style={{
                  padding: '0.75rem 1.25rem',
                  background: '#fff',
                  border: '2px solid #8b5cf6',
                  borderRadius: '0.75rem',
                  color: '#8b5cf6',
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px 0 rgba(139,92,246,0.06)',
                  transition: 'all 0.2s',
                  marginBottom: '0.25rem'
                }}
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Preview Results */}
        {showPreview && lastResult && (
          <div style={{ background: '#fff', borderRadius: '1rem', border: '2px solid #e5e7eb', boxShadow: '0 4px 16px 0 rgba(31,41,55,0.06)', marginBottom: '2rem', overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)', padding: '1.25rem 2rem', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '2rem' }}>🔧</span>
                <div>
                  <span style={{ fontWeight: 700, fontSize: '1.15rem' }}>
                    {lastResult.entity.charAt(0).toUpperCase() + lastResult.entity.slice(1)} Modifications
                  </span>
                  <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem', margin: 0 }}>{lastResult.explanation}</p>
                </div>
              </div>
              <span style={{ background: 'rgba(255,255,255,0.18)', color: 'white', fontSize: '0.95rem', padding: '0.5rem 1rem', borderRadius: '9999px', fontWeight: 600 }}>AI Powered</span>
            </div>
            
            <div style={{ padding: '1.5rem 2rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontWeight: 700, color: '#374151', marginBottom: '0.5rem' }}>Changes to be applied:</h4>
                <div style={{ background: '#f9fafb', borderRadius: '0.5rem', padding: '1rem', fontSize: '0.95rem' }}>
                  {lastResult.modifications.map((mod, index) => (
                    <div key={index} style={{ marginBottom: '0.5rem', padding: '0.5rem', background: '#fff', borderRadius: '0.25rem', border: '1px solid #e5e7eb' }}>
                      <strong>Row {mod.index + 1}:</strong> {JSON.stringify(mod.changes)}
                    </div>
                  ))}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={applyChanges}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: 600,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px 0 rgba(16,185,129,0.1)'
                  }}
                >
                  ✅ Apply Changes
                </button>
                <button
                  onClick={() => { setShowPreview(false); setLastResult(null); }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    fontWeight: 600,
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}
                >
                  ❌ Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tips */}
        <div style={{ background: 'linear-gradient(90deg, #f0fdf4 0%, #bbf7d0 100%)', borderRadius: '1rem', padding: '1.25rem', marginTop: '2rem' }}>
          <div style={{ fontWeight: 700, color: '#059669', marginBottom: '0.75rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>💡</span> Modification Tips:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <ul style={{ color: '#059669', fontSize: '1rem', margin: 0, paddingLeft: '1.25rem', listStyle: 'disc' }}>
              <li>Be specific about which records to modify</li>
              <li>Use clear, natural language commands</li>
            </ul>
            <ul style={{ color: '#059669', fontSize: '1rem', margin: 0, paddingLeft: '1.25rem', listStyle: 'disc' }}>
              <li>Review changes before applying</li>
              <li>Use group names or conditions for bulk changes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 