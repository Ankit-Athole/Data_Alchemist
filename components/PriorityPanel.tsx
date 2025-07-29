import { useState } from 'react';

interface PriorityWeights {
  PriorityLevel: number;
  RequestedTasks: number;
  Fairness: number;
  Cost: number;
  Efficiency: number;
  SkillMatch: number;
}

interface Props {
  onWeightsChange?: (weights: PriorityWeights) => void;
}

export default function PriorityPanel({ onWeightsChange }: Props) {
  const [weights, setWeights] = useState<PriorityWeights>({
    PriorityLevel: 5,
    RequestedTasks: 5,
    Fairness: 5,
    Cost: 5,
    Efficiency: 5,
    SkillMatch: 5
  });

  const [activeMethod, setActiveMethod] = useState<'sliders' | 'ranking' | 'matrix'>('sliders');
  const [rankedCriteria, setRankedCriteria] = useState<string[]>([
    'PriorityLevel', 'RequestedTasks', 'Fairness', 'Cost', 'Efficiency', 'SkillMatch'
  ]);

  const presetProfiles = [
    { name: 'Maximize Fulfillment', color: '#3b82f6', weights: { PriorityLevel: 8, RequestedTasks: 9, Fairness: 4, Cost: 3, Efficiency: 6, SkillMatch: 7 } },
    { name: 'Fair Distribution', color: '#10b981', weights: { PriorityLevel: 6, RequestedTasks: 5, Fairness: 9, Cost: 5, Efficiency: 4, SkillMatch: 6 } },
    { name: 'Minimize Workload', color: '#f59e42', weights: { PriorityLevel: 4, RequestedTasks: 3, Fairness: 7, Cost: 8, Efficiency: 9, SkillMatch: 5 } },
    { name: 'Cost Optimized', color: '#6366f1', weights: { PriorityLevel: 5, RequestedTasks: 4, Fairness: 3, Cost: 9, Efficiency: 8, SkillMatch: 4 } },
    { name: 'Balanced', color: '#64748b', weights: { PriorityLevel: 5, RequestedTasks: 5, Fairness: 5, Cost: 5, Efficiency: 5, SkillMatch: 5 } }
  ];

  const updateWeight = (key: keyof PriorityWeights, value: number) => {
    const newWeights = { ...weights, [key]: value };
    setWeights(newWeights);
    onWeightsChange?.(newWeights);
  };

  const applyPreset = (preset: PriorityWeights) => {
    setWeights(preset);
    onWeightsChange?.(preset);
  };

  const moveRankedItem = (fromIndex: number, toIndex: number) => {
    const newRanked = [...rankedCriteria];
    const [movedItem] = newRanked.splice(fromIndex, 1);
    newRanked.splice(toIndex, 0, movedItem);
    setRankedCriteria(newRanked);
    // Update weights based on ranking (higher rank = higher weight)
    const newWeights = { ...weights };
    newRanked.forEach((criterion, index) => {
      newWeights[criterion as keyof PriorityWeights] = 10 - index;
    });
    setWeights(newWeights);
    onWeightsChange?.(newWeights);
  };

  const exportPriorities = () => {
    const config = {
      weights,
      method: activeMethod,
      rankedCriteria,
      metadata: {
        generatedAt: new Date().toISOString(),
        totalCriteria: Object.keys(weights).length
      }
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'priority-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem'}}>
        <h3 style={{fontWeight: 700, fontSize: '1.25rem'}}>⚖️ Prioritization Weights</h3>
        <button onClick={exportPriorities} style={{
          background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          padding: '0.5rem 1.25rem',
          fontWeight: 600,
          fontSize: '1rem',
          cursor: 'pointer'
        }}>📥 Export</button>
      </div>
      <div style={{display: 'flex', gap: '1rem', marginBottom: '1rem'}}>
        {[
          { id: 'sliders', name: 'Sliders', color: '#3b82f6' },
          { id: 'ranking', name: 'Drag & Drop', color: '#10b981' },
          { id: 'matrix', name: 'Matrix', color: '#f59e42' }
        ].map(method => (
          <button
            key={method.id}
            onClick={() => setActiveMethod(method.id as any)}
            style={{
              background: activeMethod === method.id ? method.color : '#f3f4f6',
              color: activeMethod === method.id ? 'white' : '#374151',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.5rem 1.25rem',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: activeMethod === method.id ? '0 2px 8px 0 rgba(59,130,246,0.15)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            {method.name}
          </button>
        ))}
      </div>
      <div style={{marginBottom: '1rem'}}>
        <div style={{fontWeight: 700, color: '#3b82f6', marginBottom: '0.5rem'}}>🎯 Preset Profiles:</div>
        <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
          {presetProfiles.map((preset, index) => (
            <button
              key={index}
              onClick={() => applyPreset(preset.weights)}
              style={{
                background: preset.color,
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.5rem 1.25rem',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 1px 3px 0 rgba(0,0,0,0.08)',
                transition: 'all 0.2s'
              }}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>
      {activeMethod === 'sliders' && (
        <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
          {Object.entries(weights).map(([key, value]) => (
            <div key={key} style={{background: '#f9fafb', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #e5e7eb'}}>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                <label style={{fontWeight: 600, color: '#374151'}}>{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                <span style={{fontWeight: 600, color: '#64748b'}}>{value}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={value}
                onChange={e => updateWeight(key as keyof PriorityWeights, parseInt(e.target.value))}
                style={{width: '100%', accentColor: '#3b82f6', height: '6px'}}
              />
              <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#9ca3af', marginTop: '0.25rem'}}>
                <span>Low</span>
                <span>High</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {activeMethod === 'ranking' && (
        <div style={{background: '#f9fafb', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #e5e7eb'}}>
          <div style={{fontWeight: 600, color: '#374151', marginBottom: '0.5rem'}}>Drag to reorder criteria by importance:</div>
          <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
            {rankedCriteria.map((criterion, index) => (
              <div
                key={criterion}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  background: '#f3f4f6', borderRadius: '0.5rem', padding: '0.75rem 1rem', cursor: 'move',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03)'
                }}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('text/plain', index.toString())}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                  moveRankedItem(fromIndex, index);
                }}
              >
                <span style={{color: '#9ca3af', fontWeight: 700, fontSize: '1.25rem'}}>⋮⋮</span>
                <span style={{flex: 1, fontWeight: 600, color: '#374151'}}>{criterion.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span style={{background: '#e0e7ef', color: '#6366f1', borderRadius: '0.5rem', padding: '0.25rem 0.75rem', fontWeight: 600, fontSize: '0.875rem'}}>Weight: {10 - index}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {activeMethod === 'matrix' && (
        <div style={{background: '#f9fafb', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #e5e7eb'}}>
          <div style={{fontWeight: 600, color: '#374151', marginBottom: '0.5rem'}}>Compare criteria pairwise:</div>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
            {Object.keys(weights).map((criterion1, i) => 
              Object.keys(weights).slice(i + 1).map((criterion2, j) => (
                <div key={`${criterion1}-${criterion2}`} style={{background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                  <div style={{fontSize: '0.95rem', color: '#64748b', marginBottom: '0.5rem'}}>
                    {criterion1.replace(/([A-Z])/g, ' $1').trim()} vs {criterion2.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div style={{display: 'flex', gap: '0.5rem'}}>
                    <button
                      onClick={() => {
                        updateWeight(criterion1 as keyof PriorityWeights, weights[criterion1 as keyof PriorityWeights] + 1);
                        updateWeight(criterion2 as keyof PriorityWeights, Math.max(1, weights[criterion2 as keyof PriorityWeights] - 1));
                      }}
                      style={{flex: 1, background: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.5rem', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer'}}
                    >
                      {criterion1.replace(/([A-Z])/g, ' $1').trim()}
                    </button>
                    <button
                      onClick={() => {
                        updateWeight(criterion2 as keyof PriorityWeights, weights[criterion2 as keyof PriorityWeights] + 1);
                        updateWeight(criterion1 as keyof PriorityWeights, Math.max(1, weights[criterion1 as keyof PriorityWeights] - 1));
                      }}
                      style={{flex: 1, background: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.5rem', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer'}}
                    >
                      {criterion2.replace(/([A-Z])/g, ' $1').trim()}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      <div style={{background: 'linear-gradient(90deg, #f0fdf4 0%, #bbf7d0 100%)', borderRadius: '0.75rem', padding: '1rem', color: '#166534', fontWeight: 500, marginTop: '2rem'}}>
        <div style={{fontWeight: 700, marginBottom: '0.5rem'}}>📊 Current Weights Summary:</div>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', fontSize: '0.95rem'}}>
          {Object.entries(weights).map(([key, value]) => (
            <div key={key} style={{display: 'flex', justifyContent: 'space-between'}}>
              <span style={{color: '#64748b'}}>{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
              <span style={{fontWeight: 600}}>{value}</span>
        </div>
      ))}
        </div>
      </div>
    </div>
  );
}
