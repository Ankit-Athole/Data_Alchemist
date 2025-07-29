import { useState } from 'react';
import { generateRuleFromText } from '@/utils/nlpToRule';

interface Props { 
  tasks: any[]; 
  clients: any[]; 
  workers: any[]; 
}

interface Rule {
  id: string;
  type: string;
  name: string;
  description: string;
  config: any;
  priority: number;
}

export default function RuleEditor({ tasks, clients, workers }: Props) {
  const [text, setText] = useState('');
  const [rules, setRules] = useState<Rule[]>([]);
  const [selectedRuleType, setSelectedRuleType] = useState('coRun');
  const [isGenerating, setIsGenerating] = useState(false);

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
    try {
      const rule = await generateRuleFromText(text, tasks, clients, workers);
      if (rule) {
        const newRule: Rule = {
          id: Date.now().toString(),
          type: selectedRuleType,
          name: `Rule ${rules.length + 1}`,
          description: text,
          config: rule,
          priority: rules.length + 1
        };
        setRules(r => [...r, newRule]);
    setText('');
      }
    } catch (error) {
      console.error('Failed to generate rule:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const removeRule = (id: string) => {
    setRules(r => r.filter(rule => rule.id !== id));
  };

  const updateRulePriority = (id: string, newPriority: number) => {
    setRules(r => r.map(rule => 
      rule.id === id ? { ...rule, priority: newPriority } : rule
    ));
  };

  const exportRules = () => {
    const rulesConfig = {
      rules: rules.map(rule => ({
        type: rule.type,
        name: rule.name,
        description: rule.description,
        config: rule.config,
        priority: rule.priority
      })),
      metadata: {
        generatedAt: new Date().toISOString(),
        totalRules: rules.length,
        ruleTypes: Array.from(new Set(rules.map(r => r.type)))
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
        <button onClick={exportRules} disabled={rules.length === 0} style={{
          background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          padding: '0.5rem 1.25rem',
          fontWeight: 600,
          fontSize: '1rem',
          cursor: rules.length === 0 ? 'not-allowed' : 'pointer',
          opacity: rules.length === 0 ? 0.5 : 1
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
        {rules.length > 0 && (
          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            <h4 style={{fontWeight: 700, color: '#6366f1'}}>Active Rules ({rules.length}):</h4>
            {rules.sort((a, b) => a.priority - b.priority).map((rule, index) => (
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
                    <select value={rule.priority} onChange={e => updateRulePriority(rule.id, parseInt(e.target.value))} style={{fontSize: '0.875rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '0.25rem 0.5rem'}}>
                      {rules.map((_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>
                    <button onClick={() => removeRule(rule.id)} style={{color: '#ef4444', background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer'}}>✕</button>
                  </div>
                </div>
                <div style={{color: '#64748b', fontWeight: 500, marginBottom: '0.5rem'}}>{rule.description}</div>
                <details style={{fontSize: '0.85rem'}}>
                  <summary style={{cursor: 'pointer', color: '#3b82f6', fontWeight: 600}}>View JSON Config</summary>
                  <pre style={{marginTop: '0.5rem', background: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '0.75rem', fontSize: '0.85rem', overflow: 'auto'}}>{JSON.stringify(rule.config, null, 2)}</pre>
                </details>
              </div>
            ))}
          </div>
        )}
        {rules.length === 0 && (
          <div style={{textAlign: 'center', color: '#64748b', padding: '2rem 0'}}>
            <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>🤖</div>
            <div>No rules created yet. Start by describing a rule above!</div>
          </div>
        )}
      </div>
    </div>
  );
}
