import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { getAIProvider } from '@/utils/aiConfig';
import { generateSimpleRecommendations } from '@/utils/aiRecommendations';

// Only create OpenAI client if API key is available
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { clients, workers, tasks } = req.body;

  try {
    const provider = getAIProvider();
    let result = null;

    if (provider === 'openai' && openai) {
      const systemPrompt = `You are an AI business rule recommendation system. Analyze the provided data and suggest relevant business rules based on patterns you observe.

Available datasets:
- clients: ClientID, ClientName, PriorityLevel, RequestedTaskIDs, GroupTag, AttributesJSON
- workers: WorkerID, WorkerName, Skills, AvailableSlots, MaxLoadPerPhase, WorkerGroup, QualificationLevel  
- tasks: TaskID, TaskName, Category, Duration, RequiredSkills, PreferredPhases, MaxConcurrent

Analyze the data for patterns such as:
1. Tasks that frequently run together
2. Workers with similar skills or groups
3. Clients with similar priorities or groups
4. Resource allocation conflicts
5. Skill gaps or overloads
6. Phase scheduling patterns

Return a JSON object with:
- recommendations: array of rule suggestions
- reasoning: explanation of why each rule is recommended
- priority: "high", "medium", or "low" for each recommendation

Example recommendations:
- "Tasks T1 and T2 always have the same duration → Co-run rule"
- "Workers in group A are overloaded → Load limit rule"
- "High priority clients request similar tasks → Precedence rule"`;

             const completion = await openai.chat.completions.create({
         model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `Analyze this data and suggest business rules:\n\nClients: ${JSON.stringify(clients)}\nWorkers: ${JSON.stringify(workers)}\nTasks: ${JSON.stringify(tasks)}`
          }
        ],
        temperature: 0.3
      });

      const response = completion.choices[0].message.content;
      if (response) {
        result = JSON.parse(response);
      }
    } else {
      // Use fallback for non-OpenAI providers
      result = generateSimpleRecommendations(clients, workers, tasks);
    }

    if (result) {
      res.status(200).json(result);
    } else {
      throw new Error('No AI provider available');
    }

  } catch (error: any) {
    console.error('[AI-RECOMMENDATIONS]', error.message);
    
    // Handle specific OpenAI errors
    if (error.message.includes('429')) {
      return res.status(429).json({ 
        error: 'OpenAI API quota exceeded. Please check your billing or try again later.',
        details: 'You can still create rules manually based on your data patterns.'
      });
    }
    
    if (error.message.includes('401')) {
      return res.status(401).json({ 
        error: 'Invalid OpenAI API key. Please check your environment variables.',
        details: 'Make sure OPENAI_API_KEY is set correctly.'
      });
    }
    
    res.status(500).json({ 
      error: 'Recommendations failed', 
      details: error.message 
    });
  }
} 