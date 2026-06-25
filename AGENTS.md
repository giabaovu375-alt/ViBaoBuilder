# Slide Builder VN - Project Context

## Tech Stack
- Vite + React + TypeScript
- shadcn/ui components (src/components/ui/)
- Custom store: useSyncExternalStore (src/lib/builder/store.ts)
- Routing: react-router-dom (SPA)
- Deploy: Cloudflare Pages + KV (ephemeral 24h TTL)
- Package manager: Bun

## Architecture Rules
- Core logic: src/lib/builder/ (types.ts, store.ts, render.tsx) → KHÔNG SỬA trừ khi thêm feature
- Pages: src/pages/ (Dashboard, Editor, Export)
- Builder UI: src/components/builder/ (Canvas, Toolbar, PropertyEditor, SlideNavigator)
- Shared UI: src/components/ui/ (shadcn, không sửa trực tiếp)
- State: Custom useStore hook, NOT Zustand/Redux

## Key Constraints
- No backend server, only CF Workers Functions for KV API
- All projects stored in CF KV with 24h TTL auto-delete
- Elements use absolute positioning (x, y, width, height)
- Drag-drop via @dnd-kit/core + @dnd-kit/sortable
- AI code gen uses template filling, not free-form generation (save tokens)

## File Structure Reference
- types.ts: Element discriminated union (text|image|button|section), Slide, Project
- store.ts: CRUD operations, localStorage fallback, useSyncExternalStore pattern
- render.tsx: Pure ElementView + SlideView components, absolute positioning
