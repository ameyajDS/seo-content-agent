'use client';

import { useState } from 'react';
import { TaskInput } from '@/types';

interface Props {
  onSubmit: (input: TaskInput) => void;
  isRunning: boolean;
}

const EXAMPLE_TASKS = [
  'Write an article about AI agent architecture and how multi-agent systems work',
  'Create a guide on building scalable microservices with Kubernetes',
  'Write about the future of quantum computing and its business applications',
];

export default function TaskForm({ onSubmit, isRunning }: Props) {
  const [task, setTask] = useState('');
  const [targetAudience, setTargetAudience] = useState('Technical professionals and developers');
  const [wordCount, setWordCount] = useState(1500);
  const [tone, setTone] = useState<TaskInput['tone']>('professional');
  const [enableSearch, setEnableSearch] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim()) return;
    onSubmit({ task: task.trim(), targetAudience, wordCount, tone, enableSearch });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-2">
          Content Task
          <span className="text-red-400 ml-1">*</span>
        </label>
        <textarea
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Describe what you want the system to write..."
          rows={3}
          required
          disabled={isRunning}
          className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none disabled:opacity-50 transition-all text-sm"
        />
        <div className="flex gap-2 mt-2 flex-wrap">
          {EXAMPLE_TASKS.map((t, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setTask(t)}
              disabled={isRunning}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 px-2.5 py-1 rounded-lg transition-all disabled:opacity-40"
            >
              Example {i + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Target Audience</label>
          <input
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder="e.g. Technical professionals"
            disabled={isRunning}
            className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 transition-all text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            Word Count: <span className="text-indigo-400">{wordCount.toLocaleString()}</span>
          </label>
          <input
            type="range"
            min={500}
            max={3000}
            step={100}
            value={wordCount}
            onChange={(e) => setWordCount(Number(e.target.value))}
            disabled={isRunning}
            className="w-full accent-indigo-500 disabled:opacity-50"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>500</span><span>1500</span><span>3000</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Tone</label>
          <div className="grid grid-cols-2 gap-2">
            {(['professional', 'technical', 'casual', 'friendly'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTone(t)}
                disabled={isRunning}
                className={`text-sm py-2 rounded-xl border transition-all capitalize disabled:opacity-40 ${
                  tone === t
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-slate-800 border-slate-600 text-slate-400 hover:text-white hover:border-slate-500'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Tools</label>
          <button
            type="button"
            onClick={() => setEnableSearch(!enableSearch)}
            disabled={isRunning}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all disabled:opacity-40 ${
              enableSearch
                ? 'bg-amber-950/50 border-amber-700 text-amber-300'
                : 'bg-slate-800 border-slate-600 text-slate-400'
            }`}
          >
            <span className="flex items-center gap-2 text-sm">
              <span>🔍</span> Web Search
            </span>
            <span className={`text-xs font-bold ${enableSearch ? 'text-amber-400' : 'text-slate-500'}`}>
              {enableSearch ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isRunning || !task.trim()}
        className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-200 disabled:cursor-not-allowed text-sm shadow-lg shadow-indigo-900/30"
      >
        {isRunning ? (
          <>
            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            System is Working...
          </>
        ) : (
          <>
            <span>🚀</span>
            Launch SEO Content System
          </>
        )}
      </button>
    </form>
  );
}
