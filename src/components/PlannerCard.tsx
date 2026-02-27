'use client';

import { PlannerOutput, SearchResult } from '@/types';

interface Props {
  plannerOutput: PlannerOutput | null;
  searchResults: SearchResult[];
  isSearching: boolean;
}

export default function PlannerCard({ plannerOutput, searchResults, isSearching }: Props) {
  if (!plannerOutput) return null;

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-700 bg-slate-800/50">
        <span className="text-xl">🔷</span>
        <h3 className="font-bold text-white text-lg">Planner Agent Output</h3>
        <span className="ml-auto text-xs bg-emerald-900 text-emerald-400 border border-emerald-700 px-2 py-1 rounded-full">Completed</span>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        <InfoBlock label="Objective" value={plannerOutput.objective} />
        <InfoBlock label="Target Audience" value={plannerOutput.targetAudience} />
        <InfoBlock label="Primary Goal" value={plannerOutput.primaryGoal} />

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Content Structure</h4>
          <ol className="space-y-1">
            {plannerOutput.contentStructure.map((section, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-300">
                <span className="text-slate-600 font-mono min-w-[1.5rem]">{i + 1}.</span>
                <span>{section}</span>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">SEO Keywords</h4>
          <div className="space-y-2">
            <div>
              <span className="text-xs text-indigo-400 font-medium">Primary</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {plannerOutput.seoKeywords.primary.map((kw) => (
                  <span key={kw} className="text-xs bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 px-2 py-0.5 rounded-full">{kw}</span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium">Secondary</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {plannerOutput.seoKeywords.secondary.map((kw) => (
                  <span key={kw} className="text-xs bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full">{kw}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Handoff to Writer</h4>
          <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">{plannerOutput.handoffInstructions}</p>
        </div>

        {isSearching && (
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 text-sm text-amber-400">
              <span className="animate-spin">⚙️</span> Running web search...
            </div>
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Search Results Used</h4>
            <div className="space-y-2">
              {searchResults.map((r, i) => (
                <div key={i} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                  <a href={r.url} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-400 hover:underline">{r.title}</a>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{r.snippet}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{label}</h4>
      <p className="text-sm text-slate-300">{value}</p>
    </div>
  );
}
