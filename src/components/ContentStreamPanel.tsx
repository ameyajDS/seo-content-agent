'use client';

import { useEffect, useRef } from 'react';
import { AgentStatus } from '@/types';

interface Props {
  title: string;
  icon: string;
  content: string;
  status: AgentStatus;
  wordCount?: number;
}

export default function ContentStreamPanel({ title, icon, content, status, wordCount }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && status === 'running') {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [content, status]);

  if (status === 'idle') return null;

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-700 bg-slate-800/50">
        <span className="text-xl">{icon}</span>
        <h3 className="font-bold text-white text-lg">{title}</h3>
        {wordCount !== undefined && wordCount > 0 && (
          <span className="ml-auto text-xs text-slate-400">{wordCount.toLocaleString()} words</span>
        )}
        {status === 'running' && (
          <span className="ml-auto flex items-center gap-1.5 text-xs text-indigo-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Streaming...
          </span>
        )}
        {status === 'completed' && (
          <span className="ml-auto text-xs bg-emerald-900 text-emerald-400 border border-emerald-700 px-2 py-1 rounded-full">Completed</span>
        )}
      </div>

      <div
        ref={containerRef}
        className="p-6 max-h-[500px] overflow-y-auto font-mono text-sm text-slate-300 leading-relaxed whitespace-pre-wrap scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
      >
        {content}
        {status === 'running' && (
          <span className="inline-block w-0.5 h-4 bg-indigo-400 ml-0.5 animate-pulse align-middle" />
        )}
      </div>
    </div>
  );
}
