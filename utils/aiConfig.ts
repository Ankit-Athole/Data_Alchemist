// AI Provider Configuration
export type AIProvider = 'openai' | 'gemini' | 'huggingface' | 'fallback';

// Get the preferred AI provider from environment or default to fallback
export function getAIProvider(): AIProvider {
  if (process.env.OPENAI_API_KEY) return 'openai';
  if (process.env.GEMINI_API_KEY) return 'gemini';
  if (process.env.HUGGINGFACE_API_KEY) return 'huggingface';
  return 'fallback';
}

// Check if any AI provider is available
export function hasAIAvailable(): boolean {
  return getAIProvider() !== 'fallback';
}

// Get provider name for display
export function getProviderName(): string {
  switch (getAIProvider()) {
    case 'openai': return 'OpenAI GPT-4';
    case 'gemini': return 'Google Gemini';
    case 'huggingface': return 'Hugging Face';
    case 'fallback': return 'Rule-based Fallback';
    default: return 'Unknown';
  }
} 