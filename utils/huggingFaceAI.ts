import { HfInference } from '@huggingface/inference';

// Hugging Face API - conditional on API key
const hf = process.env.HUGGINGFACE_API_KEY ? new HfInference(process.env.HUGGINGFACE_API_KEY) : new HfInference();

export interface AIResponse {
  text: string;
  confidence?: number;
}

export async function generateRuleWithHF(prompt: string): Promise<AIResponse | null> {
  try {
    const response = await hf.textGeneration({
      model: 'microsoft/DialoGPT-medium', // Free model
      inputs: `Convert this to a business rule: ${prompt}`,
      parameters: {
        max_new_tokens: 100,
        temperature: 0.7,
      }
    });
    
    return {
      text: response.generated_text || 'Rule generation failed',
      confidence: 0.8
    };
  } catch (error) {
    console.error('Hugging Face error:', error);
    return null;
  }
}

export async function searchWithHF(query: string, data: any): Promise<AIResponse | null> {
  try {
    const response = await hf.textGeneration({
      model: 'microsoft/DialoGPT-medium',
      inputs: `Search query: ${query}. Data: ${JSON.stringify(data)}`,
      parameters: {
        max_new_tokens: 150,
        temperature: 0.5,
      }
    });
    
    return {
      text: response.generated_text || 'Search failed',
      confidence: 0.7
    };
  } catch (error) {
    console.error('Hugging Face search error:', error);
    return null;
  }
}

export async function modifyDataWithHF(command: string, data: any): Promise<AIResponse | null> {
  try {
    console.log('Trying Hugging Face modification');
    const response = await hf.textGeneration({
      model: 'microsoft/DialoGPT-medium',
      inputs: `Data modification command: ${command}. Current data: ${JSON.stringify(data)}`,
      parameters: {
        max_new_tokens: 200,
        temperature: 0.6,
      }
    });
    
    console.log('Hugging Face modification succeeded');
    return {
      text: response.generated_text || 'Modification failed',
      confidence: 0.6
    };
  } catch (error: any) {
    console.error('Hugging Face modification error:', error.message);
    
    // Handle specific Hugging Face errors
    if (error.message?.includes('429') || error.message?.includes('rate limit')) {
      console.log('Hugging Face rate limit exceeded');
    } else if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
      console.log('Hugging Face authentication failed');
    } else if (error.message?.includes('503') || error.message?.includes('service unavailable')) {
      console.log('Hugging Face service unavailable');
    }
    
    return null;
  }
} 