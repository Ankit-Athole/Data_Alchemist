export interface ErrorCorrection {
  errorIndex: number;
  fix: string;
  reasoning: string;
  confidence: 'high' | 'medium' | 'low';
  alternatives?: string[];
}

export interface CorrectionResult {
  corrections: ErrorCorrection[];
  summary: string;
}

export async function getAIErrorCorrections(
  errors: any[],
  clients: any[],
  workers: any[],
  tasks: any[]
): Promise<CorrectionResult | null> {
  try {
    const response = await fetch('/api/ai-error-correction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ errors, clients, workers, tasks })
    });
    
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
} 