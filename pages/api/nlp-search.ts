import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { query, clients, workers, tasks } = req.body;
  
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    const systemPrompt = `You are a data search assistant. Given a natural language query and three datasets (clients, workers, tasks), you need to:
1. Understand what the user is looking for
2. Determine which dataset to search in
3. Apply the appropriate filters
4. Return the filtered data

Available datasets:
- clients: ClientID, ClientName, PriorityLevel, RequestedTaskIDs, GroupTag, AttributesJSON
- workers: WorkerID, WorkerName, Skills, AvailableSlots, MaxLoadPerPhase, WorkerGroup, QualificationLevel  
- tasks: TaskID, TaskName, Category, Duration, RequiredSkills, PreferredPhases, MaxConcurrent

Return a JSON object with:
- entity: "clients", "workers", or "tasks"
- data: array of filtered objects
- explanation: brief explanation of what was found

Example queries:
- "Find all tasks with duration more than 1 phase" → filter tasks where Duration > 1
- "Show workers with frontend skills" → filter workers where Skills contains "frontend"
- "High priority clients" → filter clients where PriorityLevel >= 4`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: `Query: "${query}"\n\nData:\nClients: ${JSON.stringify(clients)}\nWorkers: ${JSON.stringify(workers)}\nTasks: ${JSON.stringify(tasks)}`
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
      // If AI response isn't valid JSON, try to extract useful information
      console.error('Failed to parse AI response:', response);
      res.status(500).json({ error: 'Invalid response format' });
    }

  } catch (error: any) {
    console.error('[NLP-SEARCH]', error.message);
    res.status(500).json({ error: 'Search failed' });
  }
} 