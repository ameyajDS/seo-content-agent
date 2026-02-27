export interface TaskInput {
  task: string;
  targetAudience: string;
  wordCount: number;
  tone: 'professional' | 'casual' | 'technical' | 'friendly';
  enableSearch: boolean;
}

export interface PlannerOutput {
  objective: string;
  targetAudience: string;
  primaryGoal: string;
  researchRequired: string[];
  contentStructure: string[];
  seoKeywords: {
    primary: string[];
    secondary: string[];
  };
  constraints: string[];
  handoffInstructions: string;
  searchQueries?: string[];
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface WriterOutput {
  content: string;
  wordCount: number;
}

export interface EditorOutput {
  revisedContent: string;
  improvements: string[];
  finalWordCount: number;
}

export type AgentStatus = 'idle' | 'running' | 'completed' | 'error';

export interface AgentState {
  planner: AgentStatus;
  writer: AgentStatus;
  editor: AgentStatus;
}

export type StreamEventType =
  | 'planner:start'
  | 'planner:thinking'
  | 'planner:search'
  | 'planner:complete'
  | 'writer:start'
  | 'writer:chunk'
  | 'writer:complete'
  | 'editor:start'
  | 'editor:chunk'
  | 'editor:complete'
  | 'crew:complete'
  | 'crew:error';

export interface StreamEvent {
  type: StreamEventType;
  payload?: unknown;
}

export interface CrewResult {
  plannerOutput: PlannerOutput;
  searchResults?: SearchResult[];
  writerOutput: WriterOutput;
  editorOutput: EditorOutput;
}
