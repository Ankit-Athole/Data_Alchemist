import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { errors, clients, workers, tasks } = req.body;

  if (!errors || errors.length === 0) {
    return res.status(400).json({ error: 'Errors are required' });
  }

  try {
    const systemPrompt = `You are an AI error correction assistant. Given validation errors and the current data, suggest specific fixes for each error.

Available datasets:
- clients: ClientID, ClientName, PriorityLevel, RequestedTaskIDs, GroupTag, AttributesJSON
- workers: WorkerID, WorkerName, Skills, AvailableSlots, MaxLoadPerPhase, WorkerGroup, QualificationLevel  
- tasks: TaskID, TaskName, Category, Duration, RequiredSkills, PreferredPhases, MaxConcurrent

For each error, provide:
1. Specific fix suggestion
2. Reasoning for the fix
3. Confidence level (high/medium/low)
4. Alternative solutions if applicable

Common error types and fixes:
- Duplicate IDs: Suggest new unique IDs
- Range violations: Suggest valid values within range
- Reference errors: Suggest valid references or remove invalid ones
- Format errors: Suggest correct format
- Coverage gaps: Suggest missing skills or workers`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: `Errors: ${JSON.stringify(errors)}\n\nData:\nClients: ${JSON.stringify(clients)}\nWorkers: ${JSON.stringify(workers)}\nTasks: ${JSON.stringify(tasks)}`
        }
      ],
      temperature: 0.1
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      return res.status(500).json({ error: 'No response from AI' });
    }

    try {
      const result = JSON.parse(response);
      res.status(200).json(result);
    } catch (parseError) {
      console.error('Failed to parse AI response:', response);
      res.status(500).json({ error: 'Invalid response format' });
    }

  } catch (error: any) {
    console.error('[AI-ERROR-CORRECTION]', error.message);
    res.status(500).json({ error: 'Error correction failed' });
  }
} 