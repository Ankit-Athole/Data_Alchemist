export interface RuleRecommendation {
  rule: string;
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
  type: string;
}

export interface RecommendationResult {
  recommendations: RuleRecommendation[];
  reasoning: string;
}

export async function getAIRecommendations(
  clients: any[],
  workers: any[],
  tasks: any[]
): Promise<RecommendationResult | null> {
  try {
    const response = await fetch('/api/ai-recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clients, workers, tasks })
    });
    
    if (!response.ok) {
      console.log('AI recommendations failed, using fallback');
      return generateSimpleRecommendations(clients, workers, tasks);
    }
    
    return await response.json();
  } catch (error) {
    console.log('Recommendations error, using fallback:', error);
    return generateSimpleRecommendations(clients, workers, tasks);
  }
}

// Fallback recommendations based on data patterns
export function generateSimpleRecommendations(
  clients: any[],
  workers: any[],
  tasks: any[]
): RecommendationResult {
  const recommendations: RuleRecommendation[] = [];
  
  // Analyze tasks for co-run patterns
  const taskDurations = tasks.map(t => t.Duration);
  const uniqueDurations = Array.from(new Set(taskDurations));
  if (uniqueDurations.length < tasks.length) {
    recommendations.push({
      rule: 'Tasks with same duration should co-run',
      reasoning: 'Multiple tasks have the same duration, suggesting they could run together.',
      priority: 'medium',
      type: 'co-run'
    });
  }
  
  // Analyze workers for load patterns
  const workerGroups = workers.map(w => w.WorkerGroup);
  const groupCounts: Record<string, number> = {};
  workerGroups.forEach(group => {
    groupCounts[group] = (groupCounts[group] || 0) + 1;
  });
  
  Object.entries(groupCounts).forEach(([group, count]) => {
    if (count > 2) {
      recommendations.push({
        rule: `Workers in group ${group} need load limits`,
        reasoning: `${count} workers in group ${group} may cause resource conflicts.`,
        priority: 'high',
        type: 'load-limit'
      });
    }
  });
  
  // Analyze clients for priority patterns
  const highPriorityClients = clients.filter(c => c.PriorityLevel >= 4);
  if (highPriorityClients.length > 0) {
    recommendations.push({
      rule: 'High priority clients need precedence rules',
      reasoning: `${highPriorityClients.length} high priority clients detected.`,
      priority: 'high',
      type: 'precedence'
    });
  }
  
  // Analyze skills for coverage
  const allSkills = workers.flatMap(w => w.Skills?.split(',') || []);
  const uniqueSkills = Array.from(new Set(allSkills));
  const requiredSkills = tasks.flatMap(t => t.RequiredSkills?.split(',') || []);
  const missingSkills = requiredSkills.filter(skill => !uniqueSkills.includes(skill));
  
  if (missingSkills.length > 0) {
    recommendations.push({
      rule: 'Add missing skills to workers',
      reasoning: `Skills needed: ${missingSkills.join(', ')}`,
      priority: 'high',
      type: 'skill-coverage'
    });
  }
  
  return {
    recommendations,
    reasoning: `Analyzed ${clients.length} clients, ${workers.length} workers, and ${tasks.length} tasks. Found ${recommendations.length} potential rule improvements.`
  };
} 