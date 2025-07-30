import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { getAIProvider } from '@/utils/aiConfig';
import { searchWithGemini } from '@/utils/geminiAI';
import { searchWithHF } from '@/utils/huggingFaceAI';
import { simpleSearch } from '@/utils/nlpSearch';

// Only create OpenAI client if API key is available
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { query, clients, workers, tasks } = req.body;
  
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    const provider = getAIProvider();
    let result = null;

    if (provider === 'openai' && openai) {
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
         model: 'gpt-4o',
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
      if (response) {
        result = JSON.parse(response);
      }
    } else if (provider === 'gemini') {
      const geminiResult = await searchWithGemini(query, { clients, workers, tasks });
      if (geminiResult) {
        result = JSON.parse(geminiResult.text);
      }
    } else if (provider === 'huggingface') {
      const hfResult = await searchWithHF(query, { clients, workers, tasks });
      if (hfResult) {
        result = JSON.parse(hfResult.text);
      }
    }

    // If no AI provider worked, use fallback
    if (!result) {
      console.log('All AI providers failed, using fallback search');
      const fallbackResult = simpleSearch(query, clients, workers, tasks);
      if (fallbackResult) {
        res.status(200).json(fallbackResult);
        return;
      }
    }

    if (result) {
      res.status(200).json(result);
    } else {
      // If even fallback failed, return a helpful error
      res.status(500).json({ 
        error: 'All AI providers and fallback failed', 
        details: 'Please try again later or use manual search.',
        fallback: true
      });
    }

  } catch (error: any) {
    console.error('[NLP-SEARCH]', error.message);
    
    // Handle specific OpenAI errors
    if (error.message.includes('429')) {
      return res.status(429).json({ 
        error: 'OpenAI API quota exceeded. Please check your billing or try again later.',
        details: 'You can still use the basic search features without AI.'
      });
    }
    
    if (error.message.includes('401')) {
      return res.status(401).json({ 
        error: 'Invalid OpenAI API key. Please check your environment variables.',
        details: 'Make sure OPENAI_API_KEY is set correctly.'
      });
    }
    
    res.status(500).json({ 
      error: 'Search failed', 
      details: error.message 
    });
  }
} 