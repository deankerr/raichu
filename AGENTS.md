# Agents

- Do not try to run the dev server, it is already running.
- lint/format/typecheck: `bun check && bun check-types`
  - ALWAYS run from the PROJECT ROOT. You CANNOT partially check this project.
- Convex chat/agent backend @packages/backend/convex/agents.ts
- Main app @apps/web/src/app/demo1/page.tsx
- Contrary to the Convex Rules guidance, avoid return validators for now as they slow down iteration while providing little benefit.
- This app is in early development, there is no production version.
- React Compiler is enabled. `useMemo` and `useCallback` are not necessary. The compiler will do a better job at memoization automatically, keeping our code clean.

## raichu

- This is an experimental LLM chat app with a design inspired by Obsidian - but instead of notes, it's your conversations.
- In the future we may have another content too. Try to keep the outer structure distinct from chat specific functionality.
- The app is currently designed for a single user only.

- The backend utilises the Convex Agent component for standard chat management functionality. https://github.com/get-convex/agent
- jotai: https://github.com/pmndrs/jotai
- rooks: https://github.com/imbhargav5/rooks
- zod v4: https://github.com/colinhacks/zod
- ai-elements: AI Elements is a component library and custom registry built on top of shadcn/ui to help you build AI-native applications faster. https://github.com/vercel/ai-elements
  - streamdown: A drop-in replacement for react-markdown, designed for AI-powered streaming. https://github.com/vercel/streamdown
  - use-stick-to-bottom: A lightweight React Hook intended mainly for AI chat applications, for smoothly sticking to bottom of messages. https://github.com/stackblitz-labs/use-stick-to-bottom
