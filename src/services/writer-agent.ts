import { streamChatCompletion } from '@/lib/llm';
import { PlannerOutput, SearchResult } from '@/types';

const WRITER_SYSTEM_PROMPT = `You are the Writer Agent — a focused content producer in a multi-agent SEO content system.

Your ONLY job is to write the full article draft based strictly on the Planner's blueprint.

Your responsibilities:
- Follow the provided content structure EXACTLY — do not change it
- Expand each outline section into well-written paragraphs
- Integrate all SEO keywords naturally — never force them
- Maintain the specified tone and length throughout
- Use research data provided to add depth and credibility
- Write with clarity, flow, and logical progression
- Add a compelling introduction and conclusion

You must NOT:
- Change the content structure or objective
- Make SEO strategy decisions
- Add sections not in the outline
- Write meta descriptions or SEO tags

Output: Write the complete article in clean markdown. Start directly with the title (H1), then sections (H2/H3). No preamble.`;

export async function* runWriterAgent(
  plannerOutput: PlannerOutput,
  searchResults: SearchResult[]
): AsyncGenerator<string> {
  const researchContext =
    searchResults.length > 0
      ? `\n\nResearch Data:\n${searchResults.map((r, i) => `[${i + 1}] ${r.title}\n${r.snippet}`).join('\n\n')}`
      : '';

  const userMessage = `
## Planner Blueprint

Objective: ${plannerOutput.objective}
Target Audience: ${plannerOutput.targetAudience}
Primary Goal: ${plannerOutput.primaryGoal}

Content Structure:
${plannerOutput.contentStructure.map((s, i) => `${i + 1}. ${s}`).join('\n')}

SEO Keywords to integrate naturally:
Primary: ${plannerOutput.seoKeywords.primary.join(', ')}
Secondary: ${plannerOutput.seoKeywords.secondary.join(', ')}

Constraints:
${plannerOutput.constraints.join('\n')}

Writer Instructions:
${plannerOutput.handoffInstructions}
${researchContext}

Write the complete article now.
`.trim();

  yield* streamChatCompletion(WRITER_SYSTEM_PROMPT, userMessage, 0.7);
}
