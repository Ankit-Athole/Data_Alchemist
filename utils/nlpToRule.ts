export async function generateRuleFromText(text:string,tasks:any[],clients:any[],workers:any[]){
  try{
    const r=await fetch('/api/nlp-rule',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({text,tasks,clients,workers})});
    
    if (!r.ok) {
      console.log('AI rule generation failed, using fallback');
      return generateSimpleRule(text, tasks, clients, workers);
    }
    
    const j=await r.json(); 
    return j.rule;
  }catch(error){
    console.log('Rule generation error, using fallback:', error);
    return generateSimpleRule(text, tasks, clients, workers);
  }
}

// Fallback rule generation for common patterns
export function generateSimpleRule(text: string, tasks: any[], clients: any[], workers: any[]) {
  const lowerText = text.toLowerCase();
  
  // Co-run rules
  if (lowerText.includes('co-run') || lowerText.includes('must run together')) {
    const taskMatch = text.match(/T\d+/g);
    if (taskMatch && taskMatch.length >= 2) {
      return {
        type: 'co-run',
        tasks: taskMatch,
        description: `Tasks ${taskMatch.join(', ')} must run together`
      };
    }
  }
  
  // Load limit rules
  if (lowerText.includes('max') && lowerText.includes('per phase')) {
    const workerMatch = text.match(/group [A-Z]/i);
    const loadMatch = text.match(/(\d+)/);
    if (workerMatch && loadMatch) {
      return {
        type: 'load-limit',
        workerGroup: workerMatch[0].split(' ')[1],
        maxLoad: parseInt(loadMatch[1]),
        description: `Workers in ${workerMatch[0]} max ${loadMatch[1]} slots per phase`
      };
    }
  }
  
  // Phase restriction rules
  if (lowerText.includes('phase') && (lowerText.includes('only') || lowerText.includes('restrict'))) {
    const taskMatch = text.match(/T\d+/);
    const phaseMatch = text.match(/(\d+)-(\d+)/);
    if (taskMatch && phaseMatch) {
      return {
        type: 'phase-restriction',
        task: taskMatch[0],
        phases: [parseInt(phaseMatch[1]), parseInt(phaseMatch[2])],
        description: `Task ${taskMatch[0]} only in phases ${phaseMatch[1]}-${phaseMatch[2]}`
      };
    }
  }
  
  // Default fallback
  return {
    type: 'custom',
    description: text,
    note: 'This rule was created manually. You may need to edit it.'
  };
}
