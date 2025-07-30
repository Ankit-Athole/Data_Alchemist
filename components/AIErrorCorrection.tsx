import { useState } from 'react';
import { getAIErrorCorrections, ErrorCorrection } from '@/utils/aiErrorCorrection';

interface Props {
  errors: any[];
  clients: any[];
  workers: any[];
  tasks: any[];
  onApplyFix: (entity: string, rowIndex: number, changes: any) => void;
}

export default function AIErrorCorrection({ errors, clients, workers, tasks, onApplyFix }: Props) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [corrections, setCorrections] = useState<ErrorCorrection[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [aiStatus, setAiStatus] = useState<'idle' | 'loading' | 'success' | 'failed' | 'fallback'>('idle');
  const [aiMessage, setAiMessage] = useState('');
  const [selectedError, setSelectedError] = useState<any>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [appliedFixes, setAppliedFixes] = useState<Set<number>>(new Set());

  const handleAnalyze = async () => {
    if (errors.length === 0) return;
    setIsAnalyzing(true);
    setAiStatus('loading');
    setAiMessage('Trying AI-powered error correction...');
    
    try {
      const result = await getAIErrorCorrections(errors, clients, workers, tasks);
      if (result) {
        setAiStatus('success');
        setAiMessage('AI error correction successful!');
        setCorrections(result.corrections || []);
        setSummary(result.summary || '');
      } else {
        setAiStatus('fallback');
        setAiMessage('AI unavailable, using rule-based fallback...');
        // Fallback is handled in the utility function
      }
    } catch (error) {
      console.error('Error correction failed:', error);
      setAiStatus('failed');
      setAiMessage('AI error correction failed. Using fallback suggestions. You can still fix errors manually.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'low': return '#ef4444';
      default: return '#64748b';
    }
  };

  const getConfidenceIcon = (confidence: string) => {
    switch (confidence) {
      case 'high': return '🟢';
      case 'medium': return '🟡';
      case 'low': return '🔴';
      default: return '⚪';
    }
  };

  const applyCorrection = (correction: ErrorCorrection) => {
    // Parse the error to determine entity and row
    const error = errors[correction.errorIndex];
    if (error && error.entity && error.row !== undefined) {
      // Extract the suggested changes from the fix
      const changes = parseFixToChanges(correction.fix, error);
      if (changes) {
        onApplyFix(error.entity, error.row, changes);
        // Mark this fix as applied
        setAppliedFixes(prev => new Set(Array.from(prev).concat([correction.errorIndex])));
        // Show success feedback
        alert(`✅ Fix applied successfully!\n\nChanged: ${Object.keys(changes).join(', ')}\nRow: ${error.row + 1} in ${error.entity}`);
      } else {
        alert('⚠️ Could not parse the fix automatically. Please apply the fix manually.');
      }
    }
  };

  const parseFixToChanges = (fix: string, error: any): any => {
    // Enhanced parsing for common fix patterns
    try {
      // Look for JSON-like structures in the fix first
      const jsonMatch = fix.match(/\{.*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Handle specific error types with smart parsing
      if (error.type === 'range' && error.field) {
        // Handle range violations (e.g., "PriorityLevel must be 1-5")
        if (error.field === 'PriorityLevel') {
          return { [error.field]: 3 }; // Default to middle value
        }
        if (error.field === 'QualificationLevel') {
          return { [error.field]: 3 }; // Default to middle value
        }
        if (error.field === 'Duration') {
          return { [error.field]: 2 }; // Default duration
        }
        if (error.field === 'MaxLoadPerPhase') {
          return { [error.field]: 2 }; // Default load
        }
        if (error.field === 'MaxConcurrent') {
          return { [error.field]: 2 }; // Default concurrent
        }
      }

      // Handle malformed JSON fields
      if (error.type === 'malformed' && error.field) {
        if (error.field === 'AttributesJSON') {
          return { [error.field]: '{}' }; // Default empty JSON
        }
        if (error.field === 'AvailableSlots') {
          return { [error.field]: '[1,2,3]' }; // Default slots
        }
        if (error.field === 'PreferredPhases') {
          return { [error.field]: '[1,2]' }; // Default phases
        }
        if (error.field === 'RequestedTaskIDs') {
          return { [error.field]: '' }; // Clear invalid references
        }
        if (error.field === 'RequiredSkills') {
          return { [error.field]: '' }; // Clear invalid skills
        }
      }

      // Handle duplicate IDs
      if (error.type === 'duplicate' && error.field) {
        const baseId = error.value || 'ID';
        const timestamp = Date.now().toString().slice(-4);
        return { [error.field]: `${baseId}_${timestamp}` };
      }

      // Handle reference errors (invalid task/worker references)
      if (error.type === 'reference' && error.field) {
        if (error.field === 'RequestedTaskIDs') {
          return { [error.field]: '' }; // Clear invalid task references
        }
      }

      // Handle coverage errors (missing skills)
      if (error.type === 'coverage' && error.field) {
        if (error.field === 'RequiredSkills') {
          return { [error.field]: 'general' }; // Default skill
        }
      }

      // Handle overload errors
      if (error.type === 'overload' && error.field) {
        if (error.field === 'AvailableSlots') {
          return { [error.field]: '[1,2,3,4,5]' }; // More slots
        }
        if (error.field === 'MaxLoadPerPhase') {
          return { [error.field]: 1 }; // Reduce load
        }
      }

      // Generic fallback for field-specific fixes
      if (error.field) {
        // Try to extract a value from the fix text
        const valueMatch = fix.match(/to\s+([^,\s]+)/);
        if (valueMatch) {
          return { [error.field]: valueMatch[1] };
        }
      }

      return null;
    } catch {
      return null;
    }
  };

  return (
    <div style={{ borderRadius: '2rem', overflow: 'hidden', background: '#fff', boxShadow: '0 8px 32px 0 rgba(31,41,55,0.08)', border: '1px solid #e5e7eb', margin: '0 auto', maxWidth: 900 }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)', padding: '2rem 2.5rem', color: 'white', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '2.5rem', marginRight: '0.5rem' }}>🔧</span>
        <h2 style={{ fontWeight: 800, fontSize: '2rem', letterSpacing: '-0.02em', margin: 0 }}>AI Error Correction</h2>
      </div>
      
      <div style={{ padding: '2.5rem', background: '#fff', borderBottomLeftRadius: '2rem', borderBottomRightRadius: '2rem' }}>
        {/* AI Status Dashboard */}
        {aiStatus !== 'idle' && (
          <div style={{ 
            marginBottom: '2rem',
            padding: '1rem 1.5rem',
            borderRadius: '1rem',
            background: 
              aiStatus === 'loading' ? 'linear-gradient(90deg, #dbeafe 0%, #bfdbfe 100%)' :
              aiStatus === 'success' ? 'linear-gradient(90deg, #dcfce7 0%, #bbf7d0 100%)' :
              aiStatus === 'fallback' ? 'linear-gradient(90deg, #fef3c7 0%, #fde68a 100%)' :
              'linear-gradient(90deg, #fee2e2 0%, #fecaca 100%)',
            border: `2px solid ${
              aiStatus === 'loading' ? '#3b82f6' :
              aiStatus === 'success' ? '#10b981' :
              aiStatus === 'fallback' ? '#f59e0b' :
              '#ef4444'
            }`,
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <span style={{ 
              fontSize: '1.5rem',
              color: 
                aiStatus === 'loading' ? '#3b82f6' :
                aiStatus === 'success' ? '#10b981' :
                aiStatus === 'fallback' ? '#f59e0b' :
                '#ef4444'
            }}>
              {aiStatus === 'loading' ? '⏳' : aiStatus === 'success' ? '✅' : aiStatus === 'fallback' ? '🔄' : '❌'}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ 
                fontWeight: 700, 
                fontSize: '1rem',
                color: 
                  aiStatus === 'loading' ? '#1e40af' :
                  aiStatus === 'success' ? '#059669' :
                  aiStatus === 'fallback' ? '#92400e' :
                  '#991b1b'
              }}>
                {aiStatus === 'loading' ? 'AI Processing...' : 
                 aiStatus === 'success' ? 'AI Correction Complete' : 
                 aiStatus === 'fallback' ? 'Using Rule-Based Fallback' : 
                 'AI Correction Failed'}
              </div>
              <div style={{ 
                fontSize: '0.9rem',
                color: 
                  aiStatus === 'loading' ? '#1e40af' :
                  aiStatus === 'success' ? '#059669' :
                  aiStatus === 'fallback' ? '#92400e' :
                  '#991b1b'
              }}>
                {aiMessage}
              </div>
            </div>
            <span style={{ 
              background: 
                aiStatus === 'loading' ? '#3b82f6' :
                aiStatus === 'success' ? '#10b981' :
                aiStatus === 'fallback' ? '#f59e0b' :
                '#ef4444',
              color: 'white',
              fontSize: '0.8rem',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontWeight: 600
            }}>
              {aiStatus === 'loading' ? 'LOADING' : 
               aiStatus === 'success' ? 'AI POWERED' : 
               aiStatus === 'fallback' ? 'RULE-BASED' : 
               'FAILED'}
            </span>
          </div>
        )}

        {/* Analyze Button */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || errors.length === 0}
            style={{
              padding: '1.25rem 3rem',
              background: isAnalyzing || errors.length === 0 ? 'linear-gradient(90deg, #fca5a5 0%, #f87171 100%)' : 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '1rem',
              fontWeight: 700,
              fontSize: '1.25rem',
              cursor: isAnalyzing || errors.length === 0 ? 'not-allowed' : 'pointer',
              opacity: isAnalyzing || errors.length === 0 ? 0.6 : 1,
              boxShadow: '0 4px 12px 0 rgba(239,68,68,0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              margin: '0 auto',
              transition: 'all 0.2s'
            }}
          >
            {isAnalyzing ? (
              <>
                <span className="animate-spin" style={{ display: 'inline-block', width: 24, height: 24, border: '3px solid #fff', borderTop: '3px solid #fca5a5', borderRadius: '50%', marginRight: 8, animation: 'spin 1s linear infinite' }}></span>
                <span>Analyzing Errors...</span>
              </>
            ) : (
              <>
                <span style={{ fontSize: '1.5rem' }}>🔧</span>
                <span>Get AI Fix Suggestions</span>
              </>
            )}
          </button>
          {errors.length === 0 && (
            <p style={{ color: '#6b7280', fontSize: '1rem', marginTop: '1rem' }}>
              No errors to fix. Upload data and run validation first.
            </p>
          )}
        </div>

        {/* Correction Results */}
        {corrections.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ background: 'linear-gradient(90deg, #fef2f2 0%, #fee2e2 100%)', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ fontWeight: 700, color: '#991b1b', marginBottom: '0.75rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🧠</span> AI Correction Summary:
              </div>
              <p style={{ color: '#991b1b', fontSize: '1rem', margin: 0, lineHeight: 1.5 }}>{summary}</p>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
              {corrections.map((correction, index) => (
                <div key={index} style={{ 
                  background: '#fff', 
                  borderRadius: '1rem', 
                  border: '2px solid #e5e7eb', 
                  boxShadow: '0 2px 8px 0 rgba(31,41,55,0.04)',
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    background: `linear-gradient(90deg, ${getConfidenceColor(correction.confidence)} 0%, ${getConfidenceColor(correction.confidence)}dd 100%)`, 
                    padding: '1rem 1.5rem', 
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>{getConfidenceIcon(correction.confidence)}</span>
                      <span style={{ fontWeight: 700, fontSize: '1.1rem', textTransform: 'capitalize' }}>
                        {correction.confidence} Confidence
                      </span>
                    </div>
                    <span style={{ 
                      background: 'rgba(255,255,255,0.18)', 
                      color: 'white', 
                      fontSize: '0.9rem', 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '9999px', 
                      fontWeight: 600 
                    }}>
                      Error #{correction.errorIndex + 1}
                    </span>
                  </div>
                  
                  <div style={{ padding: '1.5rem' }}>
                    <div style={{ marginBottom: '1rem' }}>
                      <h4 style={{ fontWeight: 700, color: '#374151', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
                        Suggested Fix:
                      </h4>
                      <div style={{ 
                        background: '#f9fafb', 
                        borderRadius: '0.5rem', 
                        padding: '1rem', 
                        fontSize: '1rem',
                        color: '#1f2937',
                        border: '1px solid #e5e7eb'
                      }}>
                        {correction.fix}
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: '1rem' }}>
                      <h5 style={{ fontWeight: 600, color: '#6b7280', marginBottom: '0.5rem', fontSize: '1rem' }}>
                        Reasoning:
                      </h5>
                      <p style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>
                        {correction.reasoning}
                      </p>
                    </div>
                    
                    {correction.alternatives && correction.alternatives.length > 0 && (
                      <div style={{ marginBottom: '1.5rem' }}>
                        <h5 style={{ fontWeight: 600, color: '#6b7280', marginBottom: '0.5rem', fontSize: '1rem' }}>
                          Alternative Solutions:
                        </h5>
                        <ul style={{ color: '#6b7280', fontSize: '0.95rem', margin: 0, paddingLeft: '1.25rem' }}>
                          {correction.alternatives.map((alt, altIndex) => (
                            <li key={altIndex} style={{ marginBottom: '0.25rem' }}>{alt}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button
                        onClick={() => applyCorrection(correction)}
                        style={{
                          padding: '0.75rem 1.5rem',
                          background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.5rem',
                          fontWeight: 600,
                          fontSize: '1rem',
                          cursor: 'pointer',
                          boxShadow: '0 2px 4px 0 rgba(16,185,129,0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <span style={{ fontSize: '1.25rem' }}>✅</span>
                        Apply Fix
                      </button>
                      <button
                        onClick={() => {
                          const error = errors[correction.errorIndex];
                          if (error) {
                            setSelectedError(error);
                            setShowErrorModal(true);
                          }
                        }}
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
                        <span style={{ fontSize: '1.25rem' }}>👁️</span>
                        View Error
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div style={{ background: 'linear-gradient(90deg, #f0fdf4 0%, #bbf7d0 100%)', borderRadius: '1rem', padding: '1.25rem' }}>
          <div style={{ fontWeight: 700, color: '#059669', marginBottom: '0.75rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>💡</span> AI Correction Tips:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <ul style={{ color: '#059669', fontSize: '1rem', margin: 0, paddingLeft: '1.25rem', listStyle: 'disc' }}>
              <li>Review suggestions before applying</li>
              <li>High confidence fixes are more reliable</li>
            </ul>
            <ul style={{ color: '#059669', fontSize: '1rem', margin: 0, paddingLeft: '1.25rem', listStyle: 'disc' }}>
              <li>Check alternative solutions</li>
              <li>Manual verification is recommended</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Error Details Modal */}
      {showErrorModal && selectedError && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              paddingBottom: '1rem',
              borderBottom: '2px solid #e5e7eb'
            }}>
              <h3 style={{
                fontWeight: 700,
                fontSize: '1.5rem',
                color: '#374151',
                margin: 0
              }}>
                Error Details
              </h3>
              <button
                onClick={() => setShowErrorModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: '0.5rem'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{
                fontWeight: 600,
                color: '#374151',
                marginBottom: '0.5rem',
                fontSize: '1.1rem'
              }}>
                Error Information:
              </h4>
              <div style={{
                background: '#f9fafb',
                borderRadius: '0.5rem',
                padding: '1rem',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{ marginBottom: '0.75rem' }}>
                  <strong>Type:</strong> {selectedError.type || 'Unknown'}
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <strong>Entity:</strong> {selectedError.entity || 'Unknown'}
                </div>
                {selectedError.row !== undefined && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <strong>Row:</strong> {selectedError.row + 1}
                  </div>
                )}
                <div style={{ marginBottom: '0.75rem' }}>
                  <strong>Message:</strong> {selectedError.message || 'No message'}
                </div>
                {selectedError.field && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <strong>Field:</strong> {selectedError.field}
                  </div>
                )}
                {selectedError.value && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <strong>Value:</strong> {String(selectedError.value)}
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{
                fontWeight: 600,
                color: '#374151',
                marginBottom: '0.5rem',
                fontSize: '1.1rem'
              }}>
                Data Context:
              </h4>
              <div style={{
                background: '#f9fafb',
                borderRadius: '0.5rem',
                padding: '1rem',
                border: '1px solid #e5e7eb',
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {selectedError.entity && selectedError.row !== undefined && (
                  <div>
                    <strong>Row Data:</strong>
                    <pre style={{
                      background: '#fff',
                      padding: '0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.9rem',
                      marginTop: '0.5rem',
                      overflowX: 'auto',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {JSON.stringify(
                        selectedError.entity === 'clients' ? clients[selectedError.row] :
                        selectedError.entity === 'workers' ? workers[selectedError.row] :
                        selectedError.entity === 'tasks' ? tasks[selectedError.row] :
                        null, 
                        null, 
                        2
                      )}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowErrorModal(false)}
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
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 