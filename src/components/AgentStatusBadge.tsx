'use client';

import { AgentStatus } from '@/types';

interface Props {
  label: string;
  status: AgentStatus;
  icon: string;
  stepNumber: number;
}

const statusStyles: Record<AgentStatus, string> = {
  idle: 'bg-slate-800 border-slate-700 text-slate-400',
  running: 'bg-indigo-950 border-indigo-500 text-indigo-300 animate-pulse',
  completed: 'bg-emerald-950 border-emerald-500 text-emerald-300',
  error: 'bg-red-950 border-red-500 text-red-300',
};

const statusDot: Record<AgentStatus, string> = {
  idle: 'bg-slate-600',
  running: 'bg-indigo-400 animate-ping',
  completed: 'bg-emerald-400',
  error: 'bg-red-400',
};

const statusLabel: Record<AgentStatus, string> = {
  idle: 'Waiting',
  running: 'Running',
  completed: 'Done',
  error: 'Error',
};

export default function AgentStatusBadge({ label, status, icon, stepNumber }: Props) {
  return (
    <div className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-500 ${statusStyles[status]}`}>
      <div className="relative flex h-2 w-2">
        <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${statusDot[status]}`} />
        <span className={`relative inline-flex rounded-full h-2 w-2 ${statusDot[status].replace('animate-ping', '')}`} />
      </div>
      <span className="text-lg">{icon}</span>
      <div className="flex flex-col">
        <span className="text-xs font-semibold uppercase tracking-widest opacity-60">Step {stepNumber}</span>
        <span className="text-sm font-bold">{label}</span>
      </div>
      <span className="ml-auto text-xs font-medium opacity-75">{statusLabel[status]}</span>
    </div>
  );
}
