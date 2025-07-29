export interface SearchResult {
  entity: 'clients' | 'workers' | 'tasks';
  data: any[];
  query: string;
  explanation: string;
}

export async function searchDataWithNLP(
  query: string, 
  clients: any[], 
  workers: any[], 
  tasks: any[]
): Promise<SearchResult | null> {
  try {
    const response = await fetch('/api/nlp-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, clients, workers, tasks })
    });
    
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export function parsePhaseList(str: string): number[] {
  if (!str) return [];
  try {
    if (str.includes('-')) {
      const [start, end] = str.split('-').map(Number);
      return Array.from({length: end - start + 1}, (_, i) => start + i);
    }
    if (str.startsWith('[') && str.endsWith(']')) {
      return JSON.parse(str);
    }
    return str.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
  } catch {
    return [];
  }
}

// Simple rule-based search as fallback
export function simpleSearch(
  query: string, 
  clients: any[], 
  workers: any[], 
  tasks: any[]
): SearchResult | null {
  const lowerQuery = query.toLowerCase();
  
  // Task searches
  if (lowerQuery.includes('task') || lowerQuery.includes('duration') || lowerQuery.includes('skill')) {
    let filteredTasks = [...tasks];
    
    if (lowerQuery.includes('duration') && lowerQuery.includes('more than')) {
      const match = query.match(/more than (\d+)/);
      if (match) {
        const minDuration = parseInt(match[1]);
        filteredTasks = filteredTasks.filter(task => task.Duration > minDuration);
      }
    }
    
    if (lowerQuery.includes('phase') && lowerQuery.includes('preferred')) {
      const match = query.match(/phase (\d+)/);
      if (match) {
        const phase = parseInt(match[1]);
        filteredTasks = filteredTasks.filter(task => {
          const phases = parsePhaseList(task.PreferredPhases);
          return phases.includes(phase);
        });
      }
    }
    
    if (filteredTasks.length > 0) {
      return {
        entity: 'tasks',
        data: filteredTasks,
        query,
        explanation: `Found ${filteredTasks.length} tasks matching your criteria`
      };
    }
  }
  
  // Worker searches
  if (lowerQuery.includes('worker') || lowerQuery.includes('skill')) {
    let filteredWorkers = [...workers];
    
    if (lowerQuery.includes('skill')) {
      const skills = ['frontend', 'backend', 'design', 'react', 'node'];
      const foundSkill = skills.find(skill => lowerQuery.includes(skill));
      if (foundSkill) {
        filteredWorkers = filteredWorkers.filter(worker => 
          worker.Skills && worker.Skills.toLowerCase().includes(foundSkill)
        );
      }
    }
    
    if (filteredWorkers.length > 0) {
      return {
        entity: 'workers',
        data: filteredWorkers,
        query,
        explanation: `Found ${filteredWorkers.length} workers matching your criteria`
      };
    }
  }
  
  // Client searches
  if (lowerQuery.includes('client') || lowerQuery.includes('priority')) {
    let filteredClients = [...clients];
    
    if (lowerQuery.includes('high priority') || lowerQuery.includes('priority 5')) {
      filteredClients = filteredClients.filter(client => client.PriorityLevel >= 4);
    }
    
    if (filteredClients.length > 0) {
      return {
        entity: 'clients',
        data: filteredClients,
        query,
        explanation: `Found ${filteredClients.length} clients matching your criteria`
      };
    }
  }
  
  return null;
} 