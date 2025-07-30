import { useState } from 'react';
import { generateRuleFromText } from '@/utils/nlpToRule';

interface Props { 
  tasks: any[]; 
  clients: any[]; 
  workers: any[]; 
  rules?: any[];
  setRules?: (rules: any[]) => void;
}

interface Rule {
  id: string;
  type: string;
  name: string;
  description: string;
  config: any;
  priority: number;
}

export default function RuleEditor({ tasks, clients, workers, rules: externalRules, setRules: setExternalRules }: Props) {
  const [text, setText] = useState('');
  const [localRules, setLocalRules] = useState<Rule[]>([]);
  const [selectedRuleType, setSelectedRuleType] = useState('coRun');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiStatus, setAiStatus] = useState<'idle' | 'loading' | 'success' | 'failed' | 'fallback'>('idle');
  const [aiMessage, setAiMessage] = useState('');

  const ruleTypes = [
    { id: 'coRun', name: 'Co-run Rule', color: '#6366f1' },
    { id: 'slotRestriction', name: 'Slot Restriction', color: '#10b981' },
    { id: 'loadLimit', name: 'Load Limit', color: '#f59e42' },
    { id: 'phaseWindow', name: 'Phase Window', color: '#3b82f6' },
    { id: 'patternMatch', name: 'Pattern Match', color: '#fbbf24' },
    { id: 'precedence', name: 'Precedence', color: '#ef4444' }
  ];

  const addRule = async () => {
    if (!text.trim()) return;
    setIsGenerating(true);
    setAiStatus('loading');
    setAiMessage('Trying AI-powered rule generation...');
    
    try {
      const rule = await generateRuleFromText(text, tasks, clients, workers);
      if (rule) {
        setAiStatus('success');
        setAiMessage('AI rule generation successful!');
        const newRule: Rule = {
          id: Date.now().toString(),
          type: selectedRuleType,
          name: `Rule ${(externalRules?.length || 0) + (localRules.length) + 1}`,
          description: text,
          config: rule,
          priority: (externalRules?.length || 0) + (localRules.length) + 1
        };
        if (setExternalRules) {
          setExternalRules([...(externalRules || []), { rule: text, type: 'ai-generated', priority: 1 }]);
        } else {
          setLocalRules(r => [...r, newRule]);
        }
        setText('');
      } else {
        setAiStatus('fallback');
        setAiMessage('AI unavailable, using rule-based fallback...');
        // Create a simple fallback rule
        const fallbackRule: Rule = {
          id: Date.now().toString(),
          type: selectedRuleType,
          name: `Rule ${(externalRules?.length || 0) + (localRules.length) + 1}`,
          description: text,
          config: {
            type: 'custom',
            description: text,
            note: 'This rule was created using fallback. You may need to edit it manually.'
          },
          priority: (externalRules?.length || 0) + (localRules.length) + 1
        };
        if (setExternalRules) {
          setExternalRules([...(externalRules || []), { rule: text, type: 'fallback-generated', priority: 1 }]);
        } else {
          setLocalRules(r => [...r, fallbackRule]);
        }
        setText('');
        setAiMessage('Fallback rule created successfully!');
      }
    } catch (error) {
      console.error('Failed to generate rule:', error);
      setAiStatus('failed');
      setAiMessage('Rule generation failed. Using fallback rule creation. You can edit the rule manually.');
      // Create a simple fallback rule
      const fallbackRule: Rule = {
        id: Date.now().toString(),
        type: selectedRuleType,
        name: `Rule ${(externalRules?.length || 0) + (localRules.length) + 1}`,
        description: text,
        config: {
          type: 'custom',
          description: text,
          note: 'This rule was created using fallback. You may need to edit it manually.'
        },
        priority: (externalRules?.length || 0) + (localRules.length) + 1
      };
      if (setExternalRules) {
        setExternalRules([...(externalRules || []), { rule: text, type: 'fallback-generated', priority: 1 }]);
      } else {
        setLocalRules(r => [...r, fallbackRule]);
      }
      setText('');
    } finally {
      setIsGenerating(false);
    }
  };

  const removeRule = (id: string) => {
    if (setExternalRules && externalRules) {
      setExternalRules(externalRules.filter((rule: any) => rule.id !== id));
    } else {
      setLocalRules(r => r.filter(rule => rule.id !== id));
    }
  };

  const updateRulePriority = (id: string, newPriority: number) => {
    if (setExternalRules && externalRules) {
      setExternalRules(externalRules.map((rule: any) => 
        rule.id === id ? { ...rule, priority: newPriority } : rule
      ));
    } else {
      setLocalRules(r => r.map(rule => 
        rule.id === id ? { ...rule, priority: newPriority } : rule
      ));
    }
  };

  const exportRules = () => {
    const allRules = [...(externalRules || []), ...localRules];
    const rulesConfig = {
      rules: allRules.map((rule: any) => ({
        type: rule.type || 'custom',
        name: rule.name || rule.rule || 'Rule',
        description: rule.description || rule.rule || '',
        config: rule.config || { type: 'custom', description: rule.rule || '' },
        priority: rule.priority || 1
      })),
      metadata: {
        generatedAt: new Date().toISOString(),
        totalRules: allRules.length,
        ruleTypes: Array.from(new Set(allRules.map((r: any) => r.type || 'custom')))
      }
    };
    const blob = new Blob([JSON.stringify(rulesConfig, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rules-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem'}}>
        <h3 style={{fontWeight: 700, fontSize: '1.25rem'}}>🤖 AI Rule Builder</h3>
        <button onClick={exportRules} disabled={(externalRules?.length || 0) + localRules.length === 0} style={{
          background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          padding: '0.5rem 1.25rem',
          fontWeight: 600,
          fontSize: '1rem',
          cursor: (externalRules?.length || 0) + localRules.length === 0 ? 'not-allowed' : 'pointer',
          opacity: (externalRules?.length || 0) + localRules.length === 0 ? 0.5 : 1
        }}>📥 Export Rules</button>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
        <div style={{display: 'flex', gap: '1rem'}}>
          <select value={selectedRuleType} onChange={e => setSelectedRuleType(e.target.value)} style={{
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            padding: '0.5rem 1rem',
            fontWeight: 600,
            fontSize: '1rem',
            color: ruleTypes.find(t => t.id === selectedRuleType)?.color || '#6366f1',
            background: '#f3f4f6',
            outline: 'none',
            minWidth: '180px'
          }}>
            {ruleTypes.map(type => (
              <option key={type.id} value={type.id} style={{color: type.color}}>{type.name}</option>
            ))}
          </select>
          <input 
            style={{
              flex: 1,
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              padding: '0.5rem 1rem',
              fontSize: '1rem',
              outline: 'none',
              background: '#f9fafb',
              fontWeight: 500
            }}
            placeholder='Describe your rule in natural language...'
            value={text} 
            onChange={e => setText(e.target.value)} 
          />
          <button onClick={addRule} disabled={isGenerating || !text.trim()} style={{
            background: 'linear-gradient(90deg, #6366f1 0%, #3b82f6 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            padding: '0.5rem 1.25rem',
            fontWeight: 600,
            fontSize: '1rem',
            cursor: isGenerating || !text.trim() ? 'not-allowed' : 'pointer',
            opacity: isGenerating || !text.trim() ? 0.5 : 1
          }}>{isGenerating ? '🤖' : 'Add Rule'}</button>
        </div>
        <div style={{background: 'linear-gradient(90deg, #f3f4f6 0%, #e0e7ef 100%)', borderRadius: '0.75rem', padding: '1rem'}}>
          <div style={{fontWeight: 700, marginBottom: '0.5rem', color: '#6366f1'}}>💡 Example queries:</div>
          <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
            <span style={{background: '#f3f4f6', borderRadius: '0.5rem', padding: '0.5rem 1rem', color: '#6366f1', fontWeight: 600}}>Tasks T1 and T2 must co-run</span>
            <span style={{background: '#f3f4f6', borderRadius: '0.5rem', padding: '0.5rem 1rem', color: '#10b981', fontWeight: 600}}>Workers in group A max 2 slots per phase</span>
            <span style={{background: '#f3f4f6', borderRadius: '0.5rem', padding: '0.5rem 1rem', color: '#3b82f6', fontWeight: 600}}>Task T3 only in phases 1-3</span>
            <span style={{background: '#f3f4f6', borderRadius: '0.5rem', padding: '0.5rem 1rem', color: '#ef4444', fontWeight: 600}}>High priority clients get precedence</span>
          </div>
        </div>
        
        {/* AI Status */}
        {aiStatus !== 'idle' && (
          <div style={{ 
            padding: '1rem 1.5rem',
            borderRadius: '1rem',
            background: aiStatus === 'loading' ? 'linear-gradient(90deg, #fef3c7 0%, #fde68a 100%)' :
                       aiStatus === 'success' ? 'linear-gradient(90deg, #d1fae5 0%, #a7f3d0 100%)' :
                       aiStatus === 'fallback' ? 'linear-gradient(90deg, #dbeafe 0%, #bfdbfe 100%)' :
                       'linear-gradient(90deg, #fee2e2 0%, #fecaca 100%)',
            border: aiStatus === 'loading' ? '2px solid #f59e0b' :
                   aiStatus === 'success' ? '2px solid #10b981' :
                   aiStatus === 'fallback' ? '2px solid #3b82f6' :
                   '2px solid #ef4444',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <span style={{ 
              fontSize: '1.5rem',
              opacity: aiStatus === 'loading' ? 0.8 : 1
            }}>
              {aiStatus === 'loading' ? '⏳' :
               aiStatus === 'success' ? '✅' :
               aiStatus === 'fallback' ? '🔄' :
               '❌'}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ 
                fontWeight: 700, 
                fontSize: '1.1rem',
                color: aiStatus === 'loading' ? '#92400e' :
                       aiStatus === 'success' ? '#065f46' :
                       aiStatus === 'fallback' ? '#1e40af' :
                       '#991b1b',
                marginBottom: '0.25rem'
              }}>
                {aiStatus === 'loading' ? 'AI Processing...' :
                 aiStatus === 'success' ? 'AI Rule Generation Successful' :
                 aiStatus === 'fallback' ? 'Using Fallback Rule Creation' :
                 'Rule Generation Failed'}
              </div>
              <div style={{ 
                fontSize: '0.95rem',
                color: aiStatus === 'loading' ? '#a16207' :
                       aiStatus === 'success' ? '#047857' :
                       aiStatus === 'fallback' ? '#1d4ed8' :
                       '#dc2626'
              }}>
                {aiMessage}
              </div>
            </div>
            {aiStatus === 'fallback' && (
              <div style={{
                background: 'rgba(59, 130, 246, 0.1)',
                color: '#1e40af',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                fontSize: '0.85rem',
                fontWeight: 600
              }}>
                Rule-Based
              </div>
            )}
          </div>
        )}
        
        {(externalRules?.length || 0) + localRules.length > 0 && (
          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            <h4 style={{fontWeight: 700, color: '#6366f1'}}>Active Rules ({(externalRules?.length || 0) + localRules.length}):</h4>
            {[...(externalRules || []), ...localRules].sort((a: any, b: any) => (a.priority || 1) - (b.priority || 1)).map((rule: any, index: number) => (
              <div key={rule.id} style={{
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '0.75rem',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03)'
              }}>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                    <span style={{background: ruleTypes.find(t => t.id === rule.type)?.color || '#6366f1', color: 'white', borderRadius: '9999px', padding: '0.25rem 0.75rem', fontWeight: 700, fontSize: '0.875rem'}}>{ruleTypes.find(t => t.id === rule.type)?.name || rule.type}</span>
                    <span style={{background: '#e0e7ef', color: '#6366f1', borderRadius: '0.5rem', padding: '0.25rem 0.75rem', fontWeight: 600, fontSize: '0.875rem'}}>Priority: {rule.priority}</span>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <select value={rule.priority || 1} onChange={e => updateRulePriority(rule.id || index.toString(), parseInt(e.target.value))} style={{fontSize: '0.875rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '0.25rem 0.5rem'}}>
                      {Array.from({ length: (externalRules?.length || 0) + localRules.length }, (_, i: number) => (
                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>
                    <button onClick={() => removeRule(rule.id)} style={{color: '#ef4444', background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer'}}>✕</button>
                  </div>
                </div>
                <div style={{color: '#64748b', fontWeight: 500, marginBottom: '0.5rem'}}>
                  {rule.description || rule.rule}
                  {rule.type === 'ai-recommended' && (
                    <span style={{background: '#10b981', color: 'white', borderRadius: '0.25rem', padding: '0.125rem 0.5rem', fontSize: '0.75rem', marginLeft: '0.5rem'}}>AI</span>
                  )}
                  {rule.type === 'ai-generated' && (
                    <span style={{background: '#3b82f6', color: 'white', borderRadius: '0.25rem', padding: '0.125rem 0.5rem', fontSize: '0.75rem', marginLeft: '0.5rem'}}>AI-Generated</span>
                  )}
                  {rule.type === 'fallback-generated' && (
                    <span style={{background: '#f59e0b', color: 'white', borderRadius: '0.25rem', padding: '0.125rem 0.5rem', fontSize: '0.75rem', marginLeft: '0.5rem'}}>Fallback</span>
                  )}
                </div>
                <details style={{fontSize: '0.85rem'}}>
                  <summary style={{cursor: 'pointer', color: '#3b82f6', fontWeight: 600}}>View JSON Config</summary>
                  <pre style={{marginTop: '0.5rem', background: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '0.75rem', fontSize: '0.85rem', overflow: 'auto'}}>
                    {JSON.stringify(rule.config || {
                      type: rule.type || 'custom',
                      description: rule.rule || rule.description || 'No description available',
                      priority: rule.priority || 1,
                      id: rule.id || 'unknown',
                      category: rule.type === 'ai-recommended' ? 'ai-generated' : 'manual',
                      timestamp: new Date().toISOString()
                    }, null, 2)}
                  </pre>
                </details>
              </div>
            ))}
          </div>
        )}
        {(externalRules?.length || 0) + localRules.length === 0 && (
          <div style={{textAlign: 'center', color: '#64748b', padding: '2rem 0'}}>
            <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>🤖</div>
            <div>No rules created yet. Start by describing a rule above!</div>
          </div>
        )}
      </div>
    </div>
  );
}
