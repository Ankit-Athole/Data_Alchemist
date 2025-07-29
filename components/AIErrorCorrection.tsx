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

  const handleAnalyze = async () => {
    if (errors.length === 0) return;
    setIsAnalyzing(true);
    try {
      const result = await getAIErrorCorrections(errors, clients, workers, tasks);
      if (result) {
        setCorrections(result.corrections || []);
        setSummary(result.summary || '');
      }
    } catch (error) {
      console.error('Error correction failed:', error);
      alert('AI error correction failed. Using fallback suggestions. You can still fix errors manually.');
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
      const changes = parseFixToChanges(correction.fix);
      if (changes) {
        onApplyFix(error.entity, error.row, changes);
      }
    }
  };

  const parseFixToChanges = (fix: string): any => {
    // Simple parsing - in a real implementation, this would be more sophisticated
    try {
      // Look for JSON-like structures in the fix
      const jsonMatch = fix.match(/\{.*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
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
                        onClick={() => {/* View error details */}}
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
    </div>
  );
} 