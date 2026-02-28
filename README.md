# SEO Content Crew

A coordinated multi-agent AI system that plans, writes, and edits SEO-optimized content autonomously. Three specialized agents — Planner, Writer, and Editor — execute a structured pipeline with real-time streaming output.

**Live repo:** https://github.com/ameyajDS/seo-content-agent

---

## Getting Started

1. Clone the repo and install dependencies:

```bash
npm install
```

2. Add your API keys to `.env.local`:

```bash
GROQ_API_KEY=your_groq_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here   # optional — mock fallback used if absent
```

3. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the app.

---

## Architecture

```
User Task → Planner Agent → [Web Search] → Writer Agent → Editor Agent → Final Output
                                  ↑ optional
All stages stream over Server-Sent Events (SSE) to the UI in real time.
```

### Agent Pipeline

| Agent | Role | Temperature |
|---|---|---|
| Planner | Strategic architect — produces a typed JSON content plan | 0.4 |
| Writer | Content producer — expands the plan into a full markdown draft | 0.7 |
| Editor | Quality controller — refines, optimizes, and lists all improvements | 0.5 |

---

## Project Structure

```
src/
├── types/index.ts              — Shared TypeScript interfaces
├── lib/
│   ├── llm.ts                  — Groq LLM client (streaming + standard)
│   └── search.ts               — Tavily web search with mock fallback
├── services/
│   ├── planner-agent.ts        — Planner system prompt + JSON plan runner
│   ├── writer-agent.ts         — Writer system prompt + streaming draft
│   └── editor-agent.ts         — Editor system prompt + output parser
├── app/
│   ├── api/crew/route.ts       — Orchestrator: sequential SSE pipeline
│   └── page.tsx                — Main UI with live streaming state
└── components/
    ├── TaskForm.tsx             — Task input, tone, word count, search toggle
    ├── AgentStatusBadge.tsx     — Animated pipeline status display
    ├── PlannerCard.tsx          — Structured plan + search results display
    ├── ContentStreamPanel.tsx   — Live streaming text with cursor blink
    └── EditorResultCard.tsx     — Final output: Preview/Markdown tabs + copy
```

---

## System Prompt vs User Prompt

Every agent in this system uses two distinct prompt types passed to `groq.chat.completions.create`.

### System Prompt — "Who the model is"

Set once per agent. Defines the model's **identity, constraints, output format, and what it is forbidden to do**. Never changes between requests.

```ts
const PLANNER_SYSTEM_PROMPT = `You are the Planner Agent...
Your ONLY job is to produce a structured content plan.
You do NOT write articles. You do NOT edit prose.
You must respond ONLY with a valid JSON object.`;
```

The system prompt enforces **role separation** — the Writer cannot drift into planning because its system prompt explicitly forbids it.

### User Prompt — "What to do right now"

Changes per request. Contains the specific task, dynamic values, and context for this invocation.

```ts
const userMessage = `
Task: ${input.task}
Target Audience: ${input.targetAudience}
Word Count: ${input.wordCount} words
Tone: ${input.tone}
`;
```

### Key Difference

| | System Prompt | User Prompt |
|---|---|---|
| Purpose | Define identity and rules | Provide the task |
| Changes | Never (fixed per agent) | Every request |
| Controls | Behaviour, format, constraints | Input data and context |
| Analogy | Job description | Today's assignment |

---

## Temperature — Why Each Agent Uses a Different Value

Temperature controls how **random vs. deterministic** the model's output is. Range: `0.0` (fully deterministic) to `2.0` (highly random).

### Planner — `temperature: 0.4`

The Planner must return a valid, parseable JSON object every time. A low temperature ensures the output is structured and predictable. Higher values risk malformed JSON or hallucinated fields.

### Writer — `temperature: 0.7`

The Writer needs creative, natural-sounding prose with varied sentence structure. A mid-range temperature produces engaging content without being repetitive (too low) or incoherent (too high).

### Editor — `temperature: 0.5`

The Editor must conservatively refine existing content without rewriting it from scratch. A mid-low temperature keeps edits precise and faithful to the original draft.

```
Low temperature  →  0.0 ──── 0.4 ──── 0.7 ──── 1.2 ──── 2.0  →  High temperature
                   Rigid   Planner  Writer   Creative    Random
                            Editor(0.5)
```

---

## Custom Agents vs Pre-built ChatGPT / Claude

When you use ChatGPT or Claude directly, one model handles planning, writing, editing, and research simultaneously — splitting its focus across competing goals and producing average results at each.

This system takes the same underlying LLM and splits it into three **cognitively specialized agents**, each doing exactly one job with full focus.

### Why this produces better output

**Role separation** — Each agent's system prompt locks its identity. The Writer cannot override the Planner's structure. The Editor cannot rewrite from scratch. Role collapse — the most common failure mode in single-prompt pipelines — is structurally prevented.

**Typed handoffs** — The Planner returns strict JSON (`PlannerOutput`). The Writer receives the SEO keywords, content outline, and tone constraints as explicit fields — not buried in a paragraph it might ignore.

**Per-task temperature** — The Planner uses `0.4` for deterministic JSON, the Writer uses `0.7` for creative prose, the Editor uses `0.5` for conservative refinement. One-size-fits-all temperature is a quality ceiling.

**Intentional tool use** — The Planner decides whether search is needed and generates specific queries. Search is a deliberate strategic decision, not a random reflex.

**Full auditability** — Every stage is visible: the JSON plan, search results used, the raw draft with word count, and an enumerated list of every improvement the Editor made.

### When to use each

| Use case | Best fit |
|---|---|
| Quick Q&A or brainstorming | ChatGPT / Claude |
| One-off summarization | ChatGPT / Claude |
| Production content pipeline | Custom Crew |
| Consistent branded output at scale | Custom Crew |
| Auditable, repeatable results | Custom Crew |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| LLM | Groq API |
| Search | Tavily Web Search API |
| Transport | Server-Sent Events (SSE) |
| Styling | Tailwind CSS |
