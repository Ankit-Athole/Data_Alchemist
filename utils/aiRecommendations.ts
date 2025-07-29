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
    
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
} 