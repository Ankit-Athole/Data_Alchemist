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
    res.status(500).json({ error: 'Failed to generate rule' });
  }
}
