import { NextRequest } from 'next/server';
import { runPlannerAgent } from '@/services/planner-agent';
import { runWriterAgent } from '@/services/writer-agent';
import { runEditorAgent, parseEditorOutput } from '@/services/editor-agent';
import { webSearch } from '@/lib/search';
import { TaskInput, StreamEvent, SearchResult } from '@/types';

function encodeEvent(event: StreamEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as TaskInput;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: StreamEvent) => {
        controller.enqueue(new TextEncoder().encode(encodeEvent(event)));
      };

      try {
        // ── STEP 1: Planner Agent ──────────────────────────────────────────
        send({ type: 'planner:start' });

        const plannerOutput = await runPlannerAgent(body);

        send({ type: 'planner:thinking', payload: plannerOutput });

        // ── STEP 2: Optional Web Search ────────────────────────────────────
        let searchResults: SearchResult[] = [];
        if (body.enableSearch && plannerOutput.searchQueries?.length) {
          send({ type: 'planner:search', payload: plannerOutput.searchQueries });
          searchResults = await webSearch(plannerOutput.searchQueries);
        }

        send({ type: 'planner:complete', payload: { plannerOutput, searchResults } });

        // ── STEP 3: Writer Agent ───────────────────────────────────────────
        send({ type: 'writer:start' });

        let writerDraft = '';
        for await (const chunk of runWriterAgent(plannerOutput, searchResults)) {
          writerDraft += chunk;
          send({ type: 'writer:chunk', payload: chunk });
        }

        const wordCount = writerDraft.split(/\s+/).filter(Boolean).length;
        send({ type: 'writer:complete', payload: { content: writerDraft, wordCount } });

        // ── STEP 4: Editor Agent ───────────────────────────────────────────
        send({ type: 'editor:start' });

        let editorRaw = '';
        for await (const chunk of runEditorAgent(writerDraft, plannerOutput)) {
          editorRaw += chunk;
          send({ type: 'editor:chunk', payload: chunk });
        }

        const { revisedContent, improvements } = parseEditorOutput(editorRaw);
        const finalWordCount = revisedContent.split(/\s+/).filter(Boolean).length;

        send({
          type: 'editor:complete',
          payload: { revisedContent, improvements, finalWordCount },
        });

        // ── STEP 5: Crew Complete ──────────────────────────────────────────
        send({
          type: 'crew:complete',
          payload: {
            plannerOutput,
            searchResults,
            writerOutput: { content: writerDraft, wordCount },
            editorOutput: { revisedContent, improvements, finalWordCount },
          },
        });
      } catch (error) {
        send({
          type: 'crew:error',
          payload: error instanceof Error ? error.message : 'Unknown error occurred',
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
