import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { text } = req.body;
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Convert plain-English rule text into strict JSON.' },
        { role: 'user',   content: text }
      ]
    });
    const json = JSON.parse(completion.choices[0].message.content || '{}');
    res.status(200).json({ rule: json });
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
