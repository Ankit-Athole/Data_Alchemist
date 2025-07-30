import { GoogleGenerativeAI } from '@google/generative-ai';

// Google Gemini - free tier available
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

export interface AIResponse {
  text: string;
  confidence?: number;
}

// Clean and parse JSON from AI responses
function cleanAndParseJSON(text: string): string {
  try {
    // Remove markdown code blocks
    let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
    
    // Remove any leading/trailing whitespace
    cleaned = cleaned.trim();
    
    // Try to parse as JSON to validate
    JSON.parse(cleaned);
    
    return cleaned;
  } catch (error) {
    console.log('Failed to parse JSON, returning original text:', error);
    return text;
  }
}

// Try multiple Gemini models in order of preference
async function tryGeminiModels(prompt: string): Promise<AIResponse | null> {
  if (!genAI) {
    console.log('Gemini not available, using fallback');
    return null;
  }

  const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
  
  for (const modelName of models) {
    try {
      console.log(`Trying Gemini model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log(`Gemini model ${modelName} succeeded`);
      
      // Clean and validate JSON response
      const cleanedText = cleanAndParseJSON(text);
      
      return {
        text: cleanedText || 'AI generation failed',
        confidence: 0.9
      };
    } catch (error: any) {
      console.log(`Gemini model ${modelName} failed:`, error.message);
      
      // Handle specific Gemini errors
      if (error.message?.includes('503') || error.message?.includes('overloaded')) {
        console.log(`Gemini model ${modelName} overloaded, trying next model`);
      } else if (error.message?.includes('404') || error.message?.includes('not found')) {
        console.log(`Gemini model ${modelName} not available, trying next model`);
      }
      
      // Continue to next model
      continue;
    }
  }
  
  // If all models failed
  console.log('All Gemini models failed, using fallback');
  return null;
}

export async function generateRuleWithGemini(prompt: string): Promise<AIResponse | null> {
  const fullPrompt = `
    Convert this natural language to a business rule JSON:
    "${prompt}"
    
    Return ONLY valid JSON without any markdown formatting, code blocks, or additional text.
    The response should be pure JSON that can be parsed directly.
  `;
  
  return await tryGeminiModels(fullPrompt);
}

export async function searchWithGemini(query: string, data: any): Promise<AIResponse | null> {
  const fullPrompt = `
    Search query: "${query}"
    Data: ${JSON.stringify(data)}
    
    Return ONLY valid JSON with entity, data, and explanation.
    Do not include any markdown formatting, code blocks, or additional text.
    The response should be pure JSON that can be parsed directly.
  `;
  
  return await tryGeminiModels(fullPrompt);
}

export async function modifyDataWithGemini(command: string, data: any): Promise<AIResponse | null> {
  const fullPrompt = `
    Data modification command: "${command}"
    Current data: ${JSON.stringify(data)}
    
    Return ONLY valid JSON with entity, modifications, and explanation.
    Do not include any markdown formatting, code blocks, or additional text.
    The response should be pure JSON that can be parsed directly.
  `;
  
  return await tryGeminiModels(fullPrompt);
} 