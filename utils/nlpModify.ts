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
    
    if (!response.ok) {
      console.log('AI modification failed, using fallback');
      return generateSimpleModification(command, clients, workers, tasks);
    }
    
    return await response.json();
  } catch (error) {
    console.log('Modification error, using fallback:', error);
    return generateSimpleModification(command, clients, workers, tasks);
  }
}

// Fallback modification for common patterns
export function generateSimpleModification(
  command: string,
  clients: any[],
  workers: any[],
  tasks: any[]
): ModificationResult | null {
  const lowerCommand = command.toLowerCase();
  
  // Priority modifications
  if (lowerCommand.includes('priority') && lowerCommand.includes('increase')) {
    const groupMatch = command.match(/group (\w+)/i);
    const amountMatch = command.match(/(\d+)/);
    const amount = amountMatch ? parseInt(amountMatch[1]) : 1;
    
    if (groupMatch) {
      const modifications = clients
        .map((client, index) => {
          if (client.GroupTag === groupMatch[1]) {
            return {
              index,
              changes: { PriorityLevel: Math.min(5, client.PriorityLevel + amount) }
            };
          }
          return null;
        })
        .filter(Boolean);
      
      return {
        entity: 'clients',
        modifications,
        explanation: `Increased priority by ${amount} for clients in group ${groupMatch[1]}`
      };
    }
  }
  
  // Skill modifications
  if (lowerCommand.includes('skill') && lowerCommand.includes('add')) {
    const skillMatch = command.match(/add (\w+) skill/i);
    if (skillMatch) {
      const skill = skillMatch[1];
      const modifications = workers
        .map((worker, index) => {
          const currentSkills = worker.Skills || '';
          const newSkills = currentSkills ? `${currentSkills}, ${skill}` : skill;
          return {
            index,
            changes: { Skills: newSkills }
          };
        });
      
      return {
        entity: 'workers',
        modifications,
        explanation: `Added ${skill} skill to all workers`
      };
    }
  }
  
  // Duration modifications
  if (lowerCommand.includes('duration') && lowerCommand.includes('set')) {
    const durationMatch = command.match(/(\d+)/);
    const categoryMatch = command.match(/UI|frontend|backend/i);
    
    if (durationMatch) {
      const duration = parseInt(durationMatch[1]);
      const modifications = tasks
        .map((task, index) => {
          if (!categoryMatch || task.Category.toLowerCase().includes(categoryMatch[0].toLowerCase())) {
            return {
              index,
              changes: { Duration: duration }
            };
          }
          return null;
        })
        .filter(Boolean);
      
      return {
        entity: 'tasks',
        modifications,
        explanation: `Set duration to ${duration} for ${categoryMatch ? categoryMatch[0] : 'all'} tasks`
      };
    }
  }
  
  return null;
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