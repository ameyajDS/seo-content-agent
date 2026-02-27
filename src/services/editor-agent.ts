import { streamChatCompletion } from '@/lib/llm';
import { PlannerOutput } from '@/types';

const EDITOR_SYSTEM_PROMPT = `You are the Editor Agent — the quality controller in a multi-agent SEO content system.

Your ONLY job is to refine and optimize the Writer's draft. You do NOT rewrite from scratch. You do NOT change strategic direction.

Your responsibilities:
- Improve sentence clarity and remove redundancy
- Enhance SEO keyword density naturally (never stuff keywords)
- Improve headings to be more engaging and keyword-rich
- Fix logical flow and paragraph transitions
- Ensure formatting consistency (proper H1/H2/H3 hierarchy)
- Check for missing sections from the outline
- Tighten the introduction and strengthen the conclusion
- Add a TL;DR summary section at the end if not present

You must NOT:
- Rewrite the entire content from scratch
- Change the strategic direction or objective
- Add major new topics not in the original plan

Output format (use EXACTLY these delimiters):
---REVISED_CONTENT_START---
[The complete revised article in clean markdown]
---REVISED_CONTENT_END---

---IMPROVEMENTS_START---
- Improvement 1
- Improvement 2
- Improvement 3
[List every improvement made, be specific]
---IMPROVEMENTS_END---`;

export async function* runEditorAgent(
  draftContent: string,
  plannerOutput: PlannerOutput
): AsyncGenerator<string> {
  const userMessage = `
## Editor Brief

Original Objective: ${plannerOutput.objective}
Target Audience: ${plannerOutput.targetAudience}
Primary SEO Keywords: ${plannerOutput.seoKeywords.primary.join(', ')}
Secondary SEO Keywords: ${plannerOutput.seoKeywords.secondary.join(', ')}
Constraints: ${plannerOutput.constraints.join('; ')}

## Writer Draft to Edit:

${draftContent}

Edit and optimize this draft now. Follow the output format exactly.
`.trim();

  yield* streamChatCompletion(EDITOR_SYSTEM_PROMPT, userMessage, 0.5);
}

export function parseEditorOutput(raw: string): { revisedContent: string; improvements: string[] } {
  const contentMatch = raw.match(/---REVISED_CONTENT_START---([\s\S]*?)---REVISED_CONTENT_END---/);
  const improvementsMatch = raw.match(/---IMPROVEMENTS_START---([\s\S]*?)---IMPROVEMENTS_END---/);

  const revisedContent = contentMatch?.[1]?.trim() ?? raw;
  const improvementsRaw = improvementsMatch?.[1]?.trim() ?? '';

  const improvements = improvementsRaw
    .split('\n')
    .map((line) => line.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean);

  return { revisedContent, improvements };
}
