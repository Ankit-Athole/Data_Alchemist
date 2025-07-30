import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { getAIProvider } from '@/utils/aiConfig';
import { generateRuleWithGemini } from '@/utils/geminiAI';
import { generateRuleWithHF } from '@/utils/huggingFaceAI';
import { generateSimpleRule } from '@/utils/nlpToRule';

// Only create OpenAI client if API key is available
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { text } = req.body;
  try {
    const provider = getAIProvider();
    let result = null;

    if (provider === 'openai' && openai) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'Convert plain-English rule text into strict JSON.' },
          { role: 'user',   content: text }
        ]
      });
      result = JSON.parse(completion.choices[0].message.content || '{}');
    } else if (provider === 'gemini') {
      const geminiResult = await generateRuleWithGemini(text);
      if (geminiResult) {
        result = JSON.parse(geminiResult.text);
      }
    } else if (provider === 'huggingface') {
      const hfResult = await generateRuleWithHF(text);
      if (hfResult) {
        result = JSON.parse(hfResult.text);
      }
    }

    // If no AI provider worked, use fallback
    if (!result) {
      console.log('All AI providers failed, using fallback rule generation');
      const fallbackResult = generateSimpleRule(text, [], [], []);
      if (fallbackResult) {
        res.status(200).json({ rule: fallbackResult });
        return;
      }
    }

    if (result) {
      res.status(200).json({ rule: result });
    } else {
      // If even fallback failed, return a helpful error
      res.status(500).json({ 
        error: 'All AI providers and fallback failed', 
        details: 'Please try again later or create rules manually.',
        fallback: true
      });
    }
  } catch (err: any) {
    console.error('[NLP-RULE]', err.message);
    
    // Handle specific OpenAI errors
    if (err.message.includes('429')) {
      return res.status(429).json({ 
        error: 'OpenAI API quota exceeded. Please check your billing or try again later.',
        details: 'You can still create rules manually using the rule editor.'
      });
    }
    
    if (err.message.includes('401')) {
      return res.status(401).json({ 
        error: 'Invalid OpenAI API key. Please check your environment variables.',
        details: 'Make sure OPENAI_API_KEY is set correctly.'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to generate rule', 
      details: err.message 
    });
  }
}
