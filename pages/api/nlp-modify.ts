import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { command, clients, workers, tasks } = req.body;
  
  if (!command) {
    return res.status(400).json({ error: 'Command is required' });
  }

  try {
    const systemPrompt = `You are a data modification assistant. Given a natural language command and three datasets (clients, workers, tasks), you need to:
1. Understand what modification the user wants to make
2. Determine which dataset and records to modify
3. Apply the changes safely
4. Return the modified data

Available datasets:
- clients: ClientID, ClientName, PriorityLevel, RequestedTaskIDs, GroupTag, AttributesJSON
- workers: WorkerID, WorkerName, Skills, AvailableSlots, MaxLoadPerPhase, WorkerGroup, QualificationLevel  
- tasks: TaskID, TaskName, Category, Duration, RequiredSkills, PreferredPhases, MaxConcurrent

Return a JSON object with:
- entity: "clients", "workers", or "tasks"
- modifications: array of changes to apply
- explanation: brief explanation of what was changed

Example commands:
- "Increase priority of all clients in group Alpha by 1" → modify clients where GroupTag = "Alpha"
- "Add frontend skill to all workers" → modify workers to include "frontend" in Skills
- "Set duration of all UI tasks to 2 phases" → modify tasks where Category contains "UI"`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: `Command: "${command}"\n\nData:\nClients: ${JSON.stringify(clients)}\nWorkers: ${JSON.stringify(workers)}\nTasks: ${JSON.stringify(tasks)}`
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
    console.error('[NLP-MODIFY]', error.message);
    
    // Handle specific OpenAI errors
    if (error.message.includes('429')) {
      return res.status(429).json({ 
        error: 'OpenAI API quota exceeded. Please check your billing or try again later.',
        details: 'You can still modify data manually in the data grids.'
      });
    }
    
    if (error.message.includes('401')) {
      return res.status(401).json({ 
        error: 'Invalid OpenAI API key. Please check your environment variables.',
        details: 'Make sure OPENAI_API_KEY is set correctly.'
      });
    }
    
    res.status(500).json({ 
      error: 'Modification failed', 
      details: error.message 
    });
  }
} 