'use client';

import { useState } from 'react';
import { EditorOutput } from '@/types';

interface Props {
  editorOutput: EditorOutput;
}

export default function EditorResultCard({ editorOutput }: Props) {
  const [activeTab, setActiveTab] = useState<'preview' | 'markdown'>('preview');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(editorOutput.revisedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-emerald-700/50 rounded-2xl overflow-hidden shadow-lg shadow-emerald-900/20">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-700 bg-emerald-950/30">
        <span className="text-xl">✨</span>
        <h3 className="font-bold text-white text-lg">Final Edited Content</h3>
        <span className="text-xs text-slate-400 ml-1">{editorOutput.finalWordCount.toLocaleString()} words</span>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => setActiveTab('preview')}
              className={`text-xs px-3 py-1.5 rounded-md transition-all ${activeTab === 'preview' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Preview
            </button>
            <button
              onClick={() => setActiveTab('markdown')}
              className={`text-xs px-3 py-1.5 rounded-md transition-all ${activeTab === 'markdown' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Markdown
            </button>
          </div>
          <button
            onClick={handleCopy}
            className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-600 transition-all flex items-center gap-1.5"
          >
            {copied ? '✓ Copied!' : '📋 Copy'}
          </button>
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'preview' ? (
          <div className="prose prose-invert prose-slate max-w-none prose-headings:text-white prose-h1:text-2xl prose-h2:text-xl prose-h2:mt-6 prose-p:text-slate-300 prose-strong:text-white prose-li:text-slate-300">
            <MarkdownPreview content={editorOutput.revisedContent} />
          </div>
        ) : (
          <pre className="font-mono text-sm text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[600px] overflow-y-auto">
            {editorOutput.revisedContent}
          </pre>
        )}
      </div>

      {editorOutput.improvements.length > 0 && (
        <div className="px-6 pb-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <span>🔧</span> Editor Improvements Made
            </h4>
            <ul className="space-y-1.5">
              {editorOutput.improvements.map((item, i) => (
                <li key={i} className="flex gap-2 text-xs text-slate-400">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function MarkdownPreview({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-bold text-white mt-0 mb-4">{line.slice(2)}</h1>;
        if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold text-white mt-6 mb-3">{line.slice(3)}</h2>;
        if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-semibold text-slate-200 mt-4 mb-2">{line.slice(4)}</h3>;
        if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-bold text-white">{line.slice(2, -2)}</p>;
        if (line.startsWith('- ')) return <li key={i} className="text-slate-300 ml-4">{line.slice(2)}</li>;
        if (line.match(/^\d+\. /)) return <li key={i} className="text-slate-300 ml-4">{line.replace(/^\d+\. /, '')}</li>;
        if (line.trim() === '') return <div key={i} className="h-2" />;
        return <p key={i} className="text-slate-300 leading-relaxed">{line}</p>;
      })}
    </div>
  );
}
