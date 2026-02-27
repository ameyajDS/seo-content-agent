'use client';

import { useState, useRef } from 'react';
import TaskForm from '@/components/TaskForm';
import AgentStatusBadge from '@/components/AgentStatusBadge';
import PlannerCard from '@/components/PlannerCard';
import ContentStreamPanel from '@/components/ContentStreamPanel';
import EditorResultCard from '@/components/EditorResultCard';
import {
  TaskInput,
  AgentState,
  PlannerOutput,
  SearchResult,
  EditorOutput,
  StreamEvent,
} from '@/types';

const INITIAL_AGENT_STATE: AgentState = {
  planner: 'idle',
  writer: 'idle',
  editor: 'idle',
};

export default function HomePage() {
  const [agentState, setAgentState] = useState<AgentState>(INITIAL_AGENT_STATE);
  const [isRunning, setIsRunning] = useState(false);
  const [plannerOutput, setPlannerOutput] = useState<PlannerOutput | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [writerContent, setWriterContent] = useState('');
  const [writerWordCount, setWriterWordCount] = useState(0);
  const [editorRaw, setEditorRaw] = useState('');
  const [editorOutput, setEditorOutput] = useState<EditorOutput | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const writerRef = useRef('');
  const editorRef = useRef('');

  const resetState = () => {
    setAgentState(INITIAL_AGENT_STATE);
    setPlannerOutput(null);
    setSearchResults([]);
    setIsSearching(false);
    setWriterContent('');
    setWriterWordCount(0);
    setEditorRaw('');
    setEditorOutput(null);
    setErrorMessage('');
    writerRef.current = '';
    editorRef.current = '';
  };

  const handleSubmit = async (input: TaskInput) => {
    resetState();
    setIsRunning(true);

    try {
      const response = await fetch('/api/crew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6);
          try {
            const event = JSON.parse(jsonStr) as StreamEvent;
            handleStreamEvent(event);
          } catch {
            // ignore malformed lines
          }
        }
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setAgentState((prev) => ({ ...prev, planner: 'error' }));
    } finally {
      setIsRunning(false);
    }
  };

  const handleStreamEvent = (event: StreamEvent) => {
    switch (event.type) {
      case 'planner:start':
        setAgentState((prev) => ({ ...prev, planner: 'running' }));
        break;

      case 'planner:thinking':
        setPlannerOutput(event.payload as PlannerOutput);
        break;

      case 'planner:search':
        setIsSearching(true);
        break;

      case 'planner:complete': {
        const payload = event.payload as { plannerOutput: PlannerOutput; searchResults: SearchResult[] };
        setPlannerOutput(payload.plannerOutput);
        setSearchResults(payload.searchResults ?? []);
        setIsSearching(false);
        setAgentState((prev) => ({ ...prev, planner: 'completed' }));
        break;
      }

      case 'writer:start':
        setAgentState((prev) => ({ ...prev, writer: 'running' }));
        break;

      case 'writer:chunk': {
        const chunk = event.payload as string;
        writerRef.current += chunk;
        setWriterContent(writerRef.current);
        break;
      }

      case 'writer:complete': {
        const payload = event.payload as { wordCount: number };
        setWriterWordCount(payload.wordCount);
        setAgentState((prev) => ({ ...prev, writer: 'completed' }));
        break;
      }

      case 'editor:start':
        setAgentState((prev) => ({ ...prev, editor: 'running' }));
        break;

      case 'editor:chunk': {
        const chunk = event.payload as string;
        editorRef.current += chunk;
        setEditorRaw(editorRef.current);
        break;
      }

      case 'editor:complete': {
        const payload = event.payload as EditorOutput;
        setEditorOutput(payload);
        setAgentState((prev) => ({ ...prev, editor: 'completed' }));
        break;
      }

      case 'crew:error':
        setErrorMessage(event.payload as string);
        break;
    }
  };

  const hasResults = agentState.editor === 'completed' || agentState.writer !== 'idle';

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-indigo-950/60 border border-indigo-700/50 text-indigo-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-4 uppercase tracking-widest">
            Multi-Agent System
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">
            SEO Content System
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Three specialized AI agents working in sequence — Planner, Writer, Editor — to produce production-ready SEO content.
          </p>
        </div>

        {/* Architecture Diagram */}
        <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
          {[
            { label: 'User Task', icon: '📝', color: 'slate' },
            { label: 'Planner', icon: '🔷', color: 'indigo' },
            { label: 'Web Search', icon: '🔍', color: 'amber', optional: true },
            { label: 'Writer', icon: '✍️', color: 'violet' },
            { label: 'Editor', icon: '🔶', color: 'emerald' },
            { label: 'Final Output', icon: '✨', color: 'emerald' },
          ].map((step, i, arr) => (
            <div key={step.label} className="flex items-center gap-2">
              <div className={`text-center px-3 py-1.5 rounded-lg border text-xs font-medium ${
                step.optional
                  ? 'border-dashed border-amber-700/50 bg-amber-950/20 text-amber-400'
                  : 'border-slate-700 bg-slate-800/80 text-slate-300'
              }`}>
                <span className="mr-1">{step.icon}</span>{step.label}
                {step.optional && <span className="ml-1 opacity-60">(optional)</span>}
              </div>
              {i < arr.length - 1 && <span className="text-slate-600 text-lg">→</span>}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Task Form + Agent Status */}
          <div className="lg:col-span-1 space-y-5">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-5">Configure Task</h2>
              <TaskForm onSubmit={handleSubmit} isRunning={isRunning} />
            </div>

            {/* Agent Status Pipeline */}
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Agent Pipeline</h2>
              <AgentStatusBadge label="Planner Agent" status={agentState.planner} icon="🔷" stepNumber={1} />
              <div className="flex justify-center">
                <div className={`w-0.5 h-5 transition-colors duration-500 ${agentState.planner === 'completed' ? 'bg-indigo-500' : 'bg-slate-700'}`} />
              </div>
              <AgentStatusBadge label="Writer Agent" status={agentState.writer} icon="✍️" stepNumber={2} />
              <div className="flex justify-center">
                <div className={`w-0.5 h-5 transition-colors duration-500 ${agentState.writer === 'completed' ? 'bg-violet-500' : 'bg-slate-700'}`} />
              </div>
              <AgentStatusBadge label="Editor Agent" status={agentState.editor} icon="🔶" stepNumber={3} />
            </div>

            {/* Error */}
            {errorMessage && (
              <div className="bg-red-950/50 border border-red-700/50 rounded-xl p-4 text-sm text-red-300">
                <span className="font-bold">Error: </span>{errorMessage}
              </div>
            )}
          </div>

          {/* Right: Agent Outputs */}
          <div className="lg:col-span-2 space-y-5">
            {!hasResults && !isRunning && (
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-12 text-center">
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-xl font-bold text-slate-300 mb-2">Ready to Deploy</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto">
                  Configure your content task and launch the system. Three specialized agents will work together to produce SEO-optimized content.
                </p>
              </div>
            )}

            {plannerOutput && (
              <PlannerCard
                plannerOutput={plannerOutput}
                searchResults={searchResults}
                isSearching={isSearching}
              />
            )}

            {agentState.writer !== 'idle' && (
              <ContentStreamPanel
                title="Writer Agent Draft"
                icon="✍️"
                content={writerContent}
                status={agentState.writer}
                wordCount={writerWordCount}
              />
            )}

            {agentState.editor !== 'idle' && !editorOutput && (
              <ContentStreamPanel
                title="Editor Agent Processing"
                icon="🔶"
                content={editorRaw}
                status={agentState.editor}
              />
            )}

            {editorOutput && <EditorResultCard editorOutput={editorOutput} />}
          </div>
        </div>

        <footer className="text-center mt-16 text-slate-600 text-xs">
          Multi-Agent SEO Content System · Planner → Writer → Editor · Powered by Groq
        </footer>
      </div>
    </div>
  );
}
