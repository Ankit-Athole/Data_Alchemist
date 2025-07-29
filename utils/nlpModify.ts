export interface ModificationResult {
  entity: 'clients' | 'workers' | 'tasks';
  modifications: any[];
  explanation: string;
}

export async function modifyDataWithNLP(
  command: string,
  clients: any[],
  workers: any[],
  tasks: any[]
): Promise<ModificationResult | null> {
  try {
    const response = await fetch('/api/nlp-modify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command, clients, workers, tasks })
    });
    
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export function applyModifications(
  data: any[],
  modifications: any[]
): any[] {
  const newData = [...data];
  
  modifications.forEach(mod => {
    if (mod.index !== undefined && mod.changes) {
      newData[mod.index] = { ...newData[mod.index], ...mod.changes };
    }
  });
  
  return newData;
} 