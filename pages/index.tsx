import { useState } from 'react';
import Head from 'next/head';
import Upload from '@/components/Upload';
import DataGrid from '@/components/DataGrid';
import ValidatorPanel from '@/components/ValidatorPanel';
import RuleEditor from '@/components/RuleEditor';
import PriorityPanel from '@/components/PriorityPanel';
import SearchPanel from '@/components/SearchPanel';
import ExportPanel from '@/components/ExportPanel';
import DataModifier from '@/components/DataModifier';
import AIRecommendations from '@/components/AIRecommendations';
import AIErrorCorrection from '@/components/AIErrorCorrection';

export default function Home() {
  const [clients, setClients] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [tasks,   setTasks]   = useState<any[]>([]);
  const [errors,  setErrors]  = useState<string[]>([]);
  const [highlightedRow, setHighlightedRow] = useState<{ entity: string; row: number } | null>(null);
  const [rules, setRules] = useState<any[]>([]);
  const [priorities, setPriorities] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'data' | 'milestone3'>('data');

  return (
    <>
      <Head>
        <title>Data Alchemist - AI-Powered Resource Allocation</title>
        <meta name="description" content="Transform messy spreadsheets into clean, validated, and AI-enhanced data configurations" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      {/* Hero Section */}
      <div className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-title">🚀 Data Alchemist</div>
            <p className="hero-subtitle">
              Transform messy spreadsheets into clean, validated, and AI-enhanced data configurations for resource allocation systems
            </p>
            
            {/* Feature Pills */}
            <div className="feature-pills">
              <span className="feature-pill">
                <span className="dot" style={{backgroundColor: '#10b981'}}></span>
                AI-Powered Validation
              </span>
              <span className="feature-pill">
                <span className="dot" style={{backgroundColor: '#f59e0b'}}></span>
                Natural Language Rules
              </span>
              <span className="feature-pill">
                <span className="dot" style={{backgroundColor: '#ec4899'}}></span>
                Smart Prioritization
              </span>
              <span className="feature-pill">
                <span className="dot" style={{backgroundColor: '#8b5cf6'}}></span>
                AI Data Modification
              </span>
              <span className="feature-pill">
                <span className="dot" style={{backgroundColor: '#ef4444'}}></span>
                AI Error Correction
              </span>
            </div>

            {/* Stats */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{clients.length + workers.length + tasks.length}</div>
                <div className="stat-label">Total Records</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{rules.length}</div>
                <div className="stat-label">Active Rules</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{errors.length}</div>
                <div className="stat-label">Validation Issues</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="main">
        <div className="container">
          {/* Tab Navigation */}
          <div className="section animate-fade-in">
            <div className="card">
              <div className="card-body" style={{ padding: '1rem 2rem' }}>
                <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid #e5e7eb' }}>
                  <button
                    onClick={() => setActiveTab('data')}
                    style={{
                      padding: '1rem 2rem',
                      background: activeTab === 'data' ? 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)' : '#f3f4f6',
                      color: activeTab === 'data' ? 'white' : '#374151',
                      border: 'none',
                      borderRadius: '0.75rem 0.75rem 0 0',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    📊 Data Management
                  </button>
                                      <button
                      onClick={() => setActiveTab('milestone3')}
                      style={{
                        padding: '1rem 2rem',
                        background: activeTab === 'milestone3' ? 'linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)' : '#f3f4f6',
                        color: activeTab === 'milestone3' ? 'white' : '#374151',
                        border: 'none',
                        borderRadius: '0.75rem 0.75rem 0 0',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      🤖 AI Features
                    </button>
                </div>
              </div>
            </div>
          </div>

          {activeTab === 'data' && (
            <>
              {/* Upload Section */}
              <div className="section animate-fade-in">
            <div className="card">
              <div className="card-header" data-section="upload">
                <h2>
                  <span className="icon">📁</span>
                  Upload Your Data
                </h2>
              </div>
              <div className="card-body">
        <Upload
          setClients={setClients}
          setWorkers={setWorkers}
          setTasks={setTasks}
          setErrors={setErrors}
        />
              </div>
            </div>
          </div>

          {/* Search Section */}
          <div className="section animate-fade-in">
            <div className="card">
              <div className="card-header" data-section="search">
                <h2>
                  <span className="icon">🔍</span>
                  AI-Powered Search
                </h2>
              </div>
              <div className="card-body">
                <SearchPanel 
                  clients={clients} 
                  workers={workers} 
                  tasks={tasks}
                />
              </div>
            </div>
          </div>

          {/* Data Grids Section */}
          <div className="section animate-fade-in">
            <div className="card">
              <div className="card-header" data-section="data">
                <h2>
                  <span className="icon">📊</span>
                  Data Management
                </h2>
              </div>
              <div className="card-body">
                <div className="data-grids">
                  <DataGrid 
                    title="Clients" 
                    data={clients} 
                    setData={setClients}
                    highlightedRow={highlightedRow}
                    entityType="clients"
                  />
                  <DataGrid 
                    title="Workers" 
                    data={workers} 
                    setData={setWorkers}
                    highlightedRow={highlightedRow}
                    entityType="workers"
                  />
                  <DataGrid 
                    title="Tasks"   
                    data={tasks}   
                    setData={setTasks}
                    highlightedRow={highlightedRow}
                    entityType="tasks"
                  />
                </div>
              </div>
            </div>
        </div>

          {/* Validation Section */}
          <div className="section animate-fade-in">
            <div className="card">
              <div className="card-header" data-section="validation">
                <h2>
                  <span className="icon">✅</span>
                  Data Validation
                </h2>
              </div>
              <div className="card-body">
        <ValidatorPanel
          clients={clients}
          workers={workers}
          tasks={tasks}
          errors={errors}
          setErrors={setErrors}
                  highlightedRow={highlightedRow}
                  setHighlightedRow={setHighlightedRow}
                />
              </div>
            </div>
          </div>

          {/* Rules & Prioritization Section */}
          <div className="section animate-fade-in">
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem'}}>
              {/* Rule Builder */}
              <div className="card">
                <div className="card-header" data-section="rules">
                  <h2>
                    <span className="icon">🤖</span>
                    AI Rule Builder
                  </h2>
                </div>
                <div className="card-body">
        <RuleEditor tasks={tasks} clients={clients} workers={workers}/>
                </div>
              </div>

              {/* Prioritization */}
              <div className="card">
                <div className="card-header" data-section="prioritization">
                  <h2>
                    <span className="icon">⚖️</span>
                    Prioritization Weights
                  </h2>
                </div>
                <div className="card-body">
                  <PriorityPanel onWeightsChange={setPriorities}/>
                </div>
              </div>
            </div>
          </div>

          {/* Export Section */}
          <div className="section animate-fade-in">
            <div className="card">
              <div className="card-header" data-section="export">
                <h2>
                  <span className="icon">📤</span>
                  Export Configuration
                </h2>
              </div>
              <div className="card-body">
                <ExportPanel 
                  clients={clients} 
                  workers={workers} 
                  tasks={tasks} 
                  rules={rules} 
                  priorities={priorities}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="section" style={{textAlign: 'center', padding: '3rem 0'}}>
            <div className="card" style={{background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'}}>
              <div className="card-body">
                <div style={{fontSize: '2rem', marginBottom: '1rem'}}>🎉</div>
                <h3 style={{fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem'}}>
                  Ready to Transform Your Data?
                </h3>
                <p style={{color: '#64748b', maxWidth: '32rem', margin: '0 auto 1.5rem'}}>
                  Your Data Alchemist is ready to turn chaos into order. Upload your files, 
                  let AI validate and enhance your data, and export clean configurations for your resource allocation system.
                </p>
                <div style={{fontSize: '0.875rem', color: '#64748b'}}>
                  Built with ❤️ for transforming data chaos into structured configurations
                </div>
              </div>
            </div>
          </div>
            </>
          )}

          {activeTab === 'milestone3' && (
            <>
              {/* AI Data Modifier */}
              <div className="section animate-fade-in">
                <DataModifier
                  clients={clients}
                  workers={workers}
                  tasks={tasks}
                  setClients={setClients}
                  setWorkers={setWorkers}
                  setTasks={setTasks}
                />
              </div>

              {/* AI Rule Recommendations */}
              <div className="section animate-fade-in">
                <AIRecommendations
                  clients={clients}
                  workers={workers}
                  tasks={tasks}
                  onAddRule={(rule) => {
                    // Add rule to the rules array
                    setRules(prev => [...prev, { rule, type: 'ai-recommended', priority: 1 }]);
                  }}
                />
              </div>

              {/* AI Error Correction */}
              <div className="section animate-fade-in">
                <AIErrorCorrection
                  errors={errors}
                  clients={clients}
                  workers={workers}
                  tasks={tasks}
                  onApplyFix={(entity, rowIndex, changes) => {
                    // Apply the fix to the appropriate data
                    if (entity === 'clients') {
                      setClients(prev => prev.map((client, i) => 
                        i === rowIndex ? { ...client, ...changes } : client
                      ));
                    } else if (entity === 'workers') {
                      setWorkers(prev => prev.map((worker, i) => 
                        i === rowIndex ? { ...worker, ...changes } : worker
                      ));
                    } else if (entity === 'tasks') {
                      setTasks(prev => prev.map((task, i) => 
                        i === rowIndex ? { ...task, ...changes } : task
                      ));
                    }
                  }}
                />
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
