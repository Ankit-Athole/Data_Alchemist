import { useState } from 'react';
import { searchDataWithNLP, simpleSearch, SearchResult } from '@/utils/nlpSearch';

interface Props {
  clients: any[];
  workers: any[];
  tasks: any[];
  onSearchResult?: (result: SearchResult) => void;
}

export default function SearchPanel({ clients, workers, tasks, onSearchResult }: Props) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [lastResult, setLastResult] = useState<SearchResult | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    setSearchHistory(prev => [query, ...prev.slice(0, 4)]); // Keep last 5 searches
    try {
      let result = await searchDataWithNLP(query, clients, workers, tasks);
      if (!result) {
        result = simpleSearch(query, clients, workers, tasks);
      }
      if (result) {
        setLastResult(result);
        onSearchResult?.(result);
      } else {
        setLastResult({
          entity: 'tasks',
          data: [],
          query,
          explanation: 'No results found for your query'
        });
      }
    } catch (error) {
      setLastResult({
        entity: 'tasks',
        data: [],
        query,
        explanation: 'Search failed. Please try a different query.'
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const exampleQueries = [
    'Find all tasks with duration more than 1 phase',
    'Show workers with frontend skills',
    'High priority clients',
    'Tasks that prefer phase 2',
    'Workers in group A'
  ];

  const getEntityIcon = (entity: string) => {
    switch (entity) {
      case 'clients': return '📊';
      case 'workers': return '👥';
      case 'tasks': return '📋';
      default: return '📄';
    }
  };

  const getEntityColor = (entity: string) => {
    switch (entity) {
      case 'clients': return '#3b82f6';
      case 'workers': return '#10b981';
      case 'tasks': return '#8b5cf6';
      default: return '#64748b';
    }
  };

  return (
    <div style={{ borderRadius: '2rem', overflow: 'hidden', background: '#fff', boxShadow: '0 8px 32px 0 rgba(31,41,55,0.08)', border: '1px solid #e5e7eb', margin: '0 auto', maxWidth: 900 }}>
      {/* Gradient Header */}
      <div style={{ background: 'linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%)', padding: '2rem 2.5rem', color: 'white', borderTopLeftRadius: '2rem', borderTopRightRadius: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '2.5rem', marginRight: '0.5rem' }}>🔎</span>
        <h2 style={{ fontWeight: 800, fontSize: '2rem', letterSpacing: '-0.02em', margin: 0 }}>AI-Powered Search</h2>
      </div>
      <div style={{ padding: '2.5rem', background: '#fff', borderBottomLeftRadius: '2rem', borderBottomRightRadius: '2rem' }}>
        {/* Search Input */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <span style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: '#a1a1aa', fontSize: '1.5rem' }}>🔍</span>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search in natural language... (e.g., 'Find tasks with duration > 1')"
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
              onClick={handleSearch}
              disabled={isSearching || !query.trim()}
              style={{
                padding: '1.25rem 2.5rem',
                background: isSearching || !query.trim() ? 'linear-gradient(90deg, #a5b4fc 0%, #818cf8 100%)' : 'linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '1rem',
                fontWeight: 700,
                fontSize: '1.15rem',
                cursor: isSearching || !query.trim() ? 'not-allowed' : 'pointer',
                opacity: isSearching || !query.trim() ? 0.6 : 1,
                boxShadow: '0 2px 8px 0 rgba(59,130,246,0.10)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.2s'
              }}
            >
              {isSearching ? (
                <>
                  <span className="animate-spin" style={{ display: 'inline-block', width: 22, height: 22, border: '3px solid #fff', borderTop: '3px solid #818cf8', borderRadius: '50%', marginRight: 8, animation: 'spin 1s linear infinite' }}></span>
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <span style={{ fontSize: '1.25rem' }}>🔍</span>
                  <span>Search</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Example Queries */}
        <div style={{ background: 'linear-gradient(90deg, #e0e7ef 0%, #f3f4f6 100%)', borderRadius: '1rem', padding: '1.25rem', marginBottom: '2rem' }}>
          <div style={{ fontWeight: 700, color: '#2563eb', marginBottom: '0.75rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>💡</span> Try these examples:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {exampleQueries.map((example, index) => (
              <button
                key={index}
                onClick={() => setQuery(example)}
                style={{
                  padding: '0.75rem 1.25rem',
                  background: '#fff',
                  border: '2px solid #2563eb',
                  borderRadius: '0.75rem',
                  color: '#2563eb',
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px 0 rgba(59,130,246,0.06)',
                  transition: 'all 0.2s',
                  marginBottom: '0.25rem'
                }}
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Search History */}
        {searchHistory.length > 0 && (
          <div style={{ background: 'linear-gradient(90deg, #f3f4f6 0%, #e0e7ef 100%)', borderRadius: '1rem', padding: '1.25rem', marginBottom: '2rem' }}>
            <div style={{ fontWeight: 700, color: '#64748b', marginBottom: '0.75rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>📚</span> Recent searches:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {searchHistory.map((search, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(search)}
                  style={{
                    padding: '0.75rem 1.25rem',
                    background: '#fff',
                    border: '2px solid #64748b',
                    borderRadius: '0.75rem',
                    color: '#64748b',
                    fontWeight: 600,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px 0 rgba(100,116,139,0.06)',
                    transition: 'all 0.2s',
                    marginBottom: '0.25rem'
                  }}
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {lastResult && (
          <div style={{ background: '#fff', borderRadius: '1rem', border: '2px solid #e5e7eb', boxShadow: '0 4px 16px 0 rgba(31,41,55,0.06)', marginBottom: '2rem', overflow: 'hidden' }}>
            <div style={{ background: `linear-gradient(90deg, ${getEntityColor(lastResult.entity)} 0%, #6366f1 100%)`, padding: '1.25rem 2rem', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '2rem' }}>{getEntityIcon(lastResult.entity)}</span>
                <div>
                  <span style={{ fontWeight: 700, fontSize: '1.15rem' }}>
                    {lastResult.entity.charAt(0).toUpperCase() + lastResult.entity.slice(1)}
                    ({lastResult.data.length} results)
                  </span>
                  <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem', margin: 0 }}>{lastResult.explanation}</p>
                </div>
              </div>
              <span style={{ background: 'rgba(255,255,255,0.18)', color: 'white', fontSize: '0.95rem', padding: '0.5rem 1rem', borderRadius: '9999px', fontWeight: 600 }}>AI Powered</span>
            </div>
            {lastResult.data.length > 0 ? (
              <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                <table style={{ width: '100%', fontSize: '0.98rem', borderCollapse: 'collapse' }}>
                  <thead style={{ background: '#f3f4f6', position: 'sticky', top: 0, zIndex: 1 }}>
                    <tr>
                      {Object.keys(lastResult.data[0] || {}).map(key => (
                        <th key={key} style={{ padding: '1rem', textAlign: 'left', fontWeight: 700, color: '#374151', borderBottom: '1px solid #e5e7eb', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.03em' }}>
                          <span>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody style={{ background: '#fff' }}>
                    {lastResult.data.slice(0, 10).map((item, index) => (
                      <tr key={index} style={{ transition: 'background 0.2s', cursor: 'pointer' }}>
                        {Object.values(item).map((value, i) => (
                          <td key={i} style={{ padding: '1rem', color: '#374151', fontWeight: 500, borderBottom: '1px solid #f3f4f6' }}>
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {lastResult.data.length > 10 && (
                  <div style={{ padding: '1rem 2rem', background: '#f3f4f6', color: '#64748b', fontSize: '0.98rem', borderTop: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Showing first 10 of {lastResult.data.length} results</span>
                    <span style={{ background: '#e5e7eb', color: '#374151', borderRadius: '0.5rem', padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}>Limited Preview</span>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: '3rem 0', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>🔍</div>
                <h4 style={{ fontWeight: 700, fontSize: '1.25rem', color: '#374151', marginBottom: '0.5rem' }}>No results found</h4>
                <p style={{ color: '#64748b', marginBottom: '1rem' }}>Try a different search query</p>
                <span style={{ display: 'inline-flex', alignItems: 'center', background: '#f3f4f6', color: '#64748b', borderRadius: '9999px', padding: '0.5rem 1.25rem', fontSize: '0.98rem', fontWeight: 500 }}>
                  <span style={{ width: 8, height: 8, background: '#a1a1aa', borderRadius: '50%', display: 'inline-block', marginRight: 8 }}></span>
                  No matching data
                </span>
              </div>
            )}
          </div>
        )}

        {/* Search Tips */}
        <div style={{ background: 'linear-gradient(90deg, #f0fdf4 0%, #bbf7d0 100%)', borderRadius: '1rem', padding: '1.25rem', marginTop: '2rem' }}>
          <div style={{ fontWeight: 700, color: '#059669', marginBottom: '0.75rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>💡</span> Search Tips:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <ul style={{ color: '#059669', fontSize: '1rem', margin: 0, paddingLeft: '1.25rem', listStyle: 'disc' }}>
              <li>Use natural language like "Find all tasks with duration more than 1"</li>
              <li>Search for specific skills: "workers with frontend skills"</li>
            </ul>
            <ul style={{ color: '#059669', fontSize: '1rem', margin: 0, paddingLeft: '1.25rem', listStyle: 'disc' }}>
              <li>Filter by priority: "high priority clients"</li>
              <li>Search by phases: "tasks that prefer phase 2"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 