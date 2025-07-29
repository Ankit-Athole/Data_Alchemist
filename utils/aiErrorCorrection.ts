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
    
    if (!response.ok) {
      console.log('AI error correction failed, using fallback');
      return generateSimpleErrorCorrections(errors, clients, workers, tasks);
    }
    
    return await response.json();
  } catch (error) {
    console.log('Error correction error, using fallback:', error);
    return generateSimpleErrorCorrections(errors, clients, workers, tasks);
  }
}

// Fallback error correction for common patterns
export function generateSimpleErrorCorrections(
  errors: any[],
  clients: any[],
  workers: any[],
  tasks: any[]
): CorrectionResult {
  const corrections: ErrorCorrection[] = [];
  
  errors.forEach((error, index) => {
    let fix = '';
    let reasoning = '';
    let confidence: 'high' | 'medium' | 'low' = 'medium';
    
    // Handle common error types
    if (error.type === 'duplicate-id') {
      fix = `Change ${error.field} to a unique value`;
      reasoning = 'Duplicate IDs are not allowed. Choose a unique identifier.';
      confidence = 'high';
    } else if (error.type === 'range-violation') {
      fix = `Set ${error.field} to a value between ${error.min} and ${error.max}`;
      reasoning = `Value must be within the specified range.`;
      confidence = 'high';
    } else if (error.type === 'reference-error') {
      fix = `Update ${error.field} to reference an existing ${error.referenceType}`;
      reasoning = `Referenced item does not exist. Choose from available options.`;
      confidence = 'medium';
    } else if (error.type === 'format-error') {
      fix = `Fix the format of ${error.field}`;
      reasoning = `Data format is incorrect. Check the expected format.`;
      confidence = 'medium';
    } else {
      fix = `Review and correct the ${error.field} field`;
      reasoning = 'This field needs attention. Check the data and make necessary corrections.';
      confidence = 'low';
    }
    
    corrections.push({
      errorIndex: index,
      fix,
      reasoning,
      confidence,
      alternatives: [`Manually edit the ${error.field} field`]
    });
  });
  
  return {
    corrections,
    summary: `Found ${corrections.length} errors that need attention. Review each suggestion and apply fixes as needed.`
  };
} 