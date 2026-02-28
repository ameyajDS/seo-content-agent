import { chatCompletion } from '@/lib/llm';
import { TaskInput, PlannerOutput } from '@/types';

const PLANNER_SYSTEM_PROMPT = `You are the Planner Agent — the strategic architect of a multi-agent SEO content system.

Your ONLY job is to produce a structured content plan. You do NOT write articles. You do NOT edit prose.

Your responsibilities:
- Understand the user objective deeply
- Identify the target audience and primary goal
- Define a detailed content structure (outline)
- Identify high-value SEO keywords (primary and secondary)
- Determine what research is needed
- Define constraints (tone, word count, format)
- Generate 2-3 specific search queries if up-to-date information is needed
- Provide clear, actionable handoff instructions to the Writer Agent

IMPORTANT: Pay special attention to the specified TONE and ensure it is clearly reflected in your constraints and handoff instructions. The tone should significantly influence the writing style and approach.

You must respond ONLY with a valid JSON object matching this exact structure:
{
  "objective": "string",
  "targetAudience": "string",
  "primaryGoal": "string",
  "researchRequired": ["string"],
  "contentStructure": ["string - numbered section title with brief description"],
  "seoKeywords": {
    "primary": ["string"],
    "secondary": ["string"]
  },
  "constraints": ["string"],
  "handoffInstructions": "string",
  "searchQueries": ["string"]
}

Ensure all fields are populated. The constraints MUST explicitly mention the tone requirements. Return ONLY the JSON, no markdown, no explanation.`;

export async function runPlannerAgent(input: TaskInput): Promise<PlannerOutput> {
  const userMessage = `
Task: ${input.task}
Target Audience: ${input.targetAudience}
Word Count: ${input.wordCount} words
Tone: ${input.tone}
Search Enabled: ${input.enableSearch}

Produce a complete content plan for this task.
`.trim();

  const raw = await chatCompletion(PLANNER_SYSTEM_PROMPT, userMessage, 0.4);

  const jsonStart = raw.indexOf('{');
  const jsonEnd = raw.lastIndexOf('}');
  const jsonStr = raw.slice(jsonStart, jsonEnd + 1);

  return JSON.parse(jsonStr) as PlannerOutput;
}
