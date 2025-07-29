import { useState } from 'react';
import { getAIRecommendations, RuleRecommendation } from '@/utils/aiRecommendations';

interface Props {
  clients: any[];
  workers: any[];
  tasks: any[];
  onAddRule: (rule: string) => void;
}

export default function AIRecommendations({ clients, workers, tasks, onAddRule }: Props) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<RuleRecommendation[]>([]);
  const [lastAnalysis, setLastAnalysis] = useState<string>('');

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const result = await getAIRecommendations(clients, workers, tasks);
      if (result) {
        setRecommendations(result.recommendations || []);
        setLastAnalysis(result.reasoning || '');
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('AI recommendations failed. Using fallback analysis. You can still create rules manually.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#dc2626';
      case 'medium': return '#ea580c';
      case 'low': return '#059669';
      default: return '#64748b';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟠';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  return (
    <div style={{ borderRadius: '2rem', overflow: 'hidden', background: '#fff', boxShadow: '0 8px 32px 0 rgba(31,41,55,0.08)', border: '1px solid #e5e7eb', margin: '0 auto', maxWidth: 900 }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)', padding: '2rem 2.5rem', color: 'white', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '2.5rem', marginRight: '0.5rem' }}>🤖</span>
        <h2 style={{ fontWeight: 800, fontSize: '2rem', letterSpacing: '-0.02em', margin: 0 }}>AI Rule Recommendations</h2>
      </div>
      
      <div style={{ padding: '2.5rem', background: '#fff', borderBottomLeftRadius: '2rem', borderBottomRightRadius: '2rem' }}>
        {/* Analyze Button */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            style={{
              padding: '1.25rem 3rem',
              background: isAnalyzing ? 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)' : 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '1rem',
              fontWeight: 700,
              fontSize: '1.25rem',
              cursor: isAnalyzing ? 'not-allowed' : 'pointer',
              opacity: isAnalyzing ? 0.6 : 1,
              boxShadow: '0 4px 12px 0 rgba(245,158,11,0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              margin: '0 auto',
              transition: 'all 0.2s'
            }}
          >
            {isAnalyzing ? (
              <>
                <span className="animate-spin" style={{ display: 'inline-block', width: 24, height: 24, border: '3px solid #fff', borderTop: '3px solid #fbbf24', borderRadius: '50%', marginRight: 8, animation: 'spin 1s linear infinite' }}></span>
                <span>Analyzing Data...</span>
              </>
            ) : (
              <>
                <span style={{ fontSize: '1.5rem' }}>🤖</span>
                <span>Analyze & Recommend Rules</span>
              </>
            )}
          </button>
        </div>

        {/* Analysis Results */}
        {recommendations.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ background: 'linear-gradient(90deg, #fef3c7 0%, #fde68a 100%)', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ fontWeight: 700, color: '#92400e', marginBottom: '0.75rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🧠</span> AI Analysis Summary:
              </div>
              <p style={{ color: '#92400e', fontSize: '1rem', margin: 0, lineHeight: 1.5 }}>{lastAnalysis}</p>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
              {recommendations.map((rec, index) => (
                <div key={index} style={{ 
                  background: '#fff', 
                  borderRadius: '1rem', 
                  border: '2px solid #e5e7eb', 
                  boxShadow: '0 2px 8px 0 rgba(31,41,55,0.04)',
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    background: `linear-gradient(90deg, ${getPriorityColor(rec.priority)} 0%, ${getPriorityColor(rec.priority)}dd 100%)`, 
                    padding: '1rem 1.5rem', 
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>{getPriorityIcon(rec.priority)}</span>
                      <span style={{ fontWeight: 700, fontSize: '1.1rem', textTransform: 'capitalize' }}>
                        {rec.priority} Priority
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
                      {rec.type}
                    </span>
                  </div>
                  
                  <div style={{ padding: '1.5rem' }}>
                    <div style={{ marginBottom: '1rem' }}>
                      <h4 style={{ fontWeight: 700, color: '#374151', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
                        Recommended Rule:
                      </h4>
                      <div style={{ 
                        background: '#f9fafb', 
                        borderRadius: '0.5rem', 
                        padding: '1rem', 
                        fontSize: '1rem',
                        fontFamily: 'monospace',
                        color: '#1f2937',
                        border: '1px solid #e5e7eb'
                      }}>
                        {rec.rule}
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h5 style={{ fontWeight: 600, color: '#6b7280', marginBottom: '0.5rem', fontSize: '1rem' }}>
                        Reasoning:
                      </h5>
                      <p style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>
                        {rec.reasoning}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => onAddRule(rec.rule)}
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
                      <span style={{ fontSize: '1.25rem' }}>➕</span>
                      Add to Rules
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div style={{ background: 'linear-gradient(90deg, #f0fdf4 0%, #bbf7d0 100%)', borderRadius: '1rem', padding: '1.25rem' }}>
          <div style={{ fontWeight: 700, color: '#059669', marginBottom: '0.75rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>💡</span> How it works:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <ul style={{ color: '#059669', fontSize: '1rem', margin: 0, paddingLeft: '1.25rem', listStyle: 'disc' }}>
              <li>Analyzes data patterns and relationships</li>
              <li>Identifies potential conflicts and gaps</li>
            </ul>
            <ul style={{ color: '#059669', fontSize: '1rem', margin: 0, paddingLeft: '1.25rem', listStyle: 'disc' }}>
              <li>Suggests rules based on best practices</li>
              <li>Prioritizes recommendations by impact</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 