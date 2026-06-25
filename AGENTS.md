# ViBaoBuilder - No-Code Web Builder 🇻🇳

## Core Concept
No-code drag-drop web builder. Users create REAL websites, not slides.
"Slide" in legacy code = Web Page. "Element" = Web Component/Block.

## Tech Stack
- Vite + React + TypeScript
- shadcn/ui components (src/components/ui/)
- Custom store: useSyncExternalStore (src/lib/builder/store.ts)
- Routing: TanStack Router (file-based, src/routes/)
- Deploy: Cloudflare Pages + KV (ephemeral preview 24h, real deploy optional)
- Package manager: Bun

## Architecture Rules
- Core logic: src/lib/builder/ (types.ts, store.ts, render.tsx) → KHÔNG SỬA trừ khi thêm feature
- Routes: src/routes/ (TanStack Router file-based routing)
  - index.tsx = Dashboard
  - editor.$projectId.tsx = Editor page
  - export.$projectId.tsx = Export/preview page
  - __root.tsx = Root layout
- Builder UI: src/components/builder/ (Canvas, Toolbar, PropertyEditor, PageList)
- Shared UI: src/components/ui/ (shadcn, không sửa trực tiếp)
- State: Custom useStore hook, NOT Zustand/Redux

## Key Constraints
- Export = real multi-page website, NOT single HTML slide
- Responsive viewport preview (mobile/tablet/desktop toggle)
- AI code gen uses template filling, not free-form generation (save tokens)
- Labels & UX in Vietnamese
- Elements use absolute positioning (x, y, width, height)
- Drag-drop via @dnd-kit/core + @dnd-kit/sortable
- No backend server, only CF Workers Functions for KV API
- All projects stored in CF KV with 24h TTL auto-delete

## File Structure Reference
- types.ts: Element discriminated union (text|image|button|section), Slide (=Page), Project
- store.ts: CRUD operations, localStorage fallback, useSyncExternalStore pattern
- render.tsx: Pure ElementView + SlideView (=PageView) components, absolute positioning
- router.tsx + routeTree.gen.ts: TanStack Router config (auto-generated)
- routes/index.tsx: Dashboard – list/create/delete projects
- routes/editor.$projectId.tsx: Editor – Canvas + Toolbar + PropertyEditor
- routes/export.$projectId.tsx: Export – preview + download/deploy
