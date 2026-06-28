import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useStore, updateElement } from "@/lib/builder/store";
import type { Element } from "@/lib/builder/types";
import { ElementRenderer } from "./ElementRenderer";

/* -------------------------------------------------------------------------- */
/*  Types & constants                                                          */
/* -------------------------------------------------------------------------- */

interface CanvasProps {
  projectId: string;
  slideId: string;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  /** Optional zoom (1 = 100%). Defaults to "fit width". */
  zoom?: number;
  /** Show pixel ruler / grid overlay. */
  showGrid?: boolean;
  /** Snap threshold in canvas-px. Set 0 to disable smart guides. */
  snapThreshold?: number;
  /** Called whenever an element is mutated (move / resize / text edit). */
  onChange?: (elementId: string) => void;
}

type DragKind = "move" | "resize";
type ResizeHandle = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

interface DragSession {
  id: string;
  kind: DragKind;
  handle?: ResizeHandle;
  pointerId: number;
  startX: number;
  startY: number;
  origX: number;
  origY: number;
  origWidth: number;
  origHeight: number;
  scale: number;
  moved: boolean;
  aspect: number;
}

interface Guide {
  orientation: "v" | "h";
  /** Position in canvas-px on that axis. */
  pos: number;
}

const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 540;
const MIN_SIZE = 16;
const TAP_THRESHOLD = 4;
const SNAP_THRESHOLD_DEFAULT = 6;
const NUDGE_PX = 1;
const NUDGE_PX_LARGE = 10;
const ARROW_KEYS = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]);

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function Canvas({
  projectId,
  slideId,
  selectedId,
  onSelect,
  zoom,
  showGrid = false,
  snapThreshold = SNAP_THRESHOLD_DEFAULT,
  onChange,
}: CanvasProps) {
  const slide = useStore((s) => {
    const project = s.projects.find((p) => p.id === projectId);
    return project?.slides.find((sl) => sl.id === slideId);
  });

  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<DragSession | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [autoScale, setAutoScale] = useState(1);

  /* ---------- Responsive auto-fit when no explicit zoom ------------------ */
  useLayoutEffect(() => {
    if (zoom !== undefined) return;
    const el = wrapperRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      setAutoScale(Math.max(0.1, Math.min(w / CANVAS_WIDTH, 4)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [zoom]);

  const scale = zoom ?? autoScale;

  /* ---------- Keyboard: nudge, delete-deselect, esc ---------------------- */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!selectedId || editingId) return;
      const target = e.target as HTMLElement | null;
      if (target && /^(input|textarea|select)$/i.test(target.tagName)) return;
      if (target?.isContentEditable) return;

      if (e.key === "Escape") {
        onSelect(null);
        return;
      }
      if (!ARROW_KEYS.has(e.key)) return;
      const el = slide?.elements.find((x) => x.id === selectedId);
      if (!el) return;
      e.preventDefault();
      const step = e.shiftKey ? NUDGE_PX_LARGE : NUDGE_PX;
      let { x, y } = el;
      if (e.key === "ArrowLeft") x -= step;
      if (e.key === "ArrowRight") x += step;
      if (e.key === "ArrowUp") y -= step;
      if (e.key === "ArrowDown") y += step;
      x = clamp(x, 0, CANVAS_WIDTH - el.width);
      y = clamp(y, 0, CANVAS_HEIGHT - el.height);
      updateElement(projectId, slideId, el.id, { x, y });
      onChange?.(el.id);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, editingId, slide, projectId, slideId, onSelect, onChange]);

  /* ---------- Snap targets (other elements + canvas edges/center) -------- */
  const snapTargets = useMemo(() => {
    const vs: number[] = [0, CANVAS_WIDTH / 2, CANVAS_WIDTH];
    const hs: number[] = [0, CANVAS_HEIGHT / 2, CANVAS_HEIGHT];
    if (!slide) return { vs, hs };
    for (const el of slide.elements) {
      if (el.id === selectedId) continue;
      vs.push(el.x, el.x + el.width / 2, el.x + el.width);
      hs.push(el.y, el.y + el.height / 2, el.y + el.height);
    }
    return { vs, hs };
  }, [slide, selectedId]);

  /* ---------- Drag lifecycle --------------------------------------------- */
  const startDrag = useCallback(
    (e: ReactPointerEvent, el: Element, kind: DragKind, handle?: ResizeHandle) => {
      if (dragState.current && dragState.current.pointerId === e.pointerId) return;
      e.stopPropagation();
      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch {
        /* noop — capture may fail on synthetic targets */
      }
      dragState.current = {
        id: el.id,
        kind,
        handle,
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        origX: el.x,
        origY: el.y,
        origWidth: el.width,
        origHeight: el.height,
        scale: scale || 1,
        moved: false,
        aspect: el.width / Math.max(1, el.height),
      };
    },
    [scale],
  );

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent) => {
      const drag = dragState.current;
      if (!drag || drag.pointerId !== e.pointerId) return;

      const rawDx = e.clientX - drag.startX;
      const rawDy = e.clientY - drag.startY;

      if (!drag.moved && Math.hypot(rawDx, rawDy) < TAP_THRESHOLD) return;
      drag.moved = true;

      const dx = rawDx / (drag.scale || 1);
      const dy = rawDy / (drag.scale || 1);

      const useSnap = snapThreshold > 0 && !e.altKey;
      const liveGuides: Guide[] = [];

      if (drag.kind === "move") {
        let nextX = drag.origX + dx;
        let nextY = drag.origY + dy;

        if (useSnap) {
          const w = drag.origWidth;
          const h = drag.origHeight;
          const xCandidates = [nextX, nextX + w / 2, nextX + w];
          const yCandidates = [nextY, nextY + h / 2, nextY + h];
          const sx = snap(xCandidates, snapTargets.vs, snapThreshold);
          const sy = snap(yCandidates, snapTargets.hs, snapThreshold);
          if (sx) {
            nextX += sx.delta;
            liveGuides.push({ orientation: "v", pos: sx.target });
          }
          if (sy) {
            nextY += sy.delta;
            liveGuides.push({ orientation: "h", pos: sy.target });
          }
        }

        nextX = clamp(nextX, 0, CANVAS_WIDTH - drag.origWidth);
        nextY = clamp(nextY, 0, CANVAS_HEIGHT - drag.origHeight);

        updateElement(projectId, slideId, drag.id, { x: nextX, y: nextY });
        setGuides(liveGuides);
        onChange?.(drag.id);
        return;
      }

      /* Resize */
      const h = drag.handle!;
      let x = drag.origX;
      let y = drag.origY;
      let width = drag.origWidth;
      let height = drag.origHeight;

      const wantsW = h.includes("w");
      const wantsE = h.includes("e");
      const wantsN = h.includes("n");
      const wantsS = h.includes("s");

      if (wantsE) width = Math.max(MIN_SIZE, drag.origWidth + dx);
      if (wantsS) height = Math.max(MIN_SIZE, drag.origHeight + dy);
      if (wantsW) {
        width = Math.max(MIN_SIZE, drag.origWidth - dx);
        x = drag.origX + (drag.origWidth - width);
      }
      if (wantsN) {
        height = Math.max(MIN_SIZE, drag.origHeight - dy);
        y = drag.origY + (drag.origHeight - height);
      }

      /* Hold Shift to preserve aspect ratio on corner handles. */
      const isCornerHandle = (wantsN || wantsS) && (wantsW || wantsE);
      if (e.shiftKey && isCornerHandle) {
        const ratio = drag.aspect;
        // Drive by the larger delta to keep motion natural
        if (Math.abs(width - drag.origWidth) > Math.abs(height - drag.origHeight)) {
          const newH = width / ratio;
          if (wantsN) y = drag.origY + (drag.origHeight - newH);
          height = newH;
        } else {
          const newW = height * ratio;
          if (wantsW) x = drag.origX + (drag.origWidth - newW);
          width = newW;
        }
      }

      /* Clamp to canvas */
      if (x < 0) {
        width += x;
        x = 0;
      }
      if (y < 0) {
        height += y;
        y = 0;
      }
      width = Math.max(MIN_SIZE, Math.min(width, CANVAS_WIDTH - x));
      height = Math.max(MIN_SIZE, Math.min(height, CANVAS_HEIGHT - y));

      updateElement(projectId, slideId, drag.id, { x, y, width, height });
      setGuides(liveGuides);
      onChange?.(drag.id);
    },
    [projectId, slideId, snapTargets, snapThreshold, onChange],
  );

  const handlePointerUp = useCallback(
    (e: ReactPointerEvent) => {
      const drag = dragState.current;
      if (!drag || drag.pointerId !== e.pointerId) return;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture?.(drag.pointerId);
      } catch {
        /* noop */
      }
      if (!drag.moved) onSelect(drag.id);
      dragState.current = null;
      setGuides([]);
    },
    [onSelect],
  );

  /* ---------- Text editing ----------------------------------------------- */
  const handleDoubleClick = useCallback((el: Element) => {
    if (el.type === "text") setEditingId(el.id);
  }, []);

  const commitText = useCallback(
    (el: Element, value: string) => {
      if (el.type === "text") {
        updateElement(projectId, slideId, el.id, { content: value });
        onChange?.(el.id);
      }
      setEditingId(null);
    },
    [projectId, slideId, onChange],
  );

  /* ---------- Render ------------------------------------------------------ */
  if (!slide) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-400">
        Slide not found
      </div>
    );
  }

  const canvasStyle: CSSProperties = {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    background: slide.background,
    transform: `scale(${scale})`,
    transformOrigin: "top left",
  };

  return (
    <div
      ref={wrapperRef}
      className="relative mx-auto w-full select-none"
      style={{
        height: CANVAS_HEIGHT * scale,
      }}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget || e.target === canvasRef.current) {
          onSelect(null);
          setEditingId(null);
        }
      }}
    >
      <div
        ref={canvasRef}
        role="application"
        aria-label="Slide canvas"
        className="relative overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
        style={canvasStyle}
      >
        {showGrid && <GridOverlay />}

        {slide.elements.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 text-center">
            <span className="text-[13px] font-medium text-slate-400">Empty slide</span>
            <span className="text-[12px] text-slate-300">
              Add an element from the toolbar to get started
            </span>
          </div>
        )}

        {slide.elements.map((el) => {
          const isSelected = selectedId === el.id;
          const isEditing = editingId === el.id;
          const isHovered = hoverId === el.id && !isSelected;

          return (
            <div
              key={el.id}
              data-element-id={el.id}
              onPointerDown={(e) => {
                if (isEditing) return;
                startDrag(e, el, "move");
              }}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onPointerEnter={() => setHoverId(el.id)}
              onPointerLeave={() => setHoverId((prev) => (prev === el.id ? null : prev))}
              onDoubleClick={(e) => {
                e.stopPropagation();
                handleDoubleClick(el);
              }}
              className={`absolute touch-none ${isEditing ? "cursor-text" : "cursor-move"}`}
              style={{
                left: el.x,
                top: el.y,
                width: el.width,
                height: el.height,
                outline: isSelected
                  ? "2px solid #6366f1"
                  : isHovered
                    ? "1px solid #a5b4fc"
                    : "none",
                outlineOffset: 1,
              }}
            >
              {isEditing && el.type === "text" ? (
                <div
                  contentEditable
                  suppressContentEditableWarning
                  autoFocus
                  className="h-full w-full overflow-hidden p-1 outline-none"
                  style={{ fontSize: el.fontSize, color: el.color }}
                  onPointerDown={(e) => e.stopPropagation()}
                  onBlur={(e) => commitText(el, e.currentTarget.textContent ?? "")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      (e.target as HTMLElement).blur();
                    }
                    if (e.key === "Escape") setEditingId(null);
                  }}
                >
                  {el.content}
                </div>
              ) : (
                <ElementRenderer element={el} />
              )}

              {isSelected && !isEditing && (
                <>
                  {(["nw", "n", "ne", "e", "se", "s", "sw", "w"] as ResizeHandle[]).map(
                    (pos) => (
                      <ResizeHandleDot
                        key={pos}
                        pos={pos}
                        onDown={(e) => startDrag(e, el, "resize", pos)}
                        onMove={handlePointerMove}
                        onUp={handlePointerUp}
                      />
                    ),
                  )}

                  {/* Size badge */}
                  <div
                    className="pointer-events-none absolute -bottom-6 left-0 rounded bg-indigo-500 px-1.5 py-0.5 text-[10px] font-medium text-white shadow"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {Math.round(el.width)} × {Math.round(el.height)}
                  </div>
                </>
              )}
            </div>
          );
        })}

        {/* Smart guides */}
        {guides.map((g, i) =>
          g.orientation === "v" ? (
            <div
              key={`v-${i}-${g.pos}`}
              className="pointer-events-none absolute top-0 bottom-0 w-px bg-pink-500"
              style={{ left: g.pos }}
            />
          ) : (
            <div
              key={`h-${i}-${g.pos}`}
              className="pointer-events-none absolute right-0 left-0 h-px bg-pink-500"
              style={{ top: g.pos }}
            />
          ),
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sub-components & helpers                                                   */
/* -------------------------------------------------------------------------- */

const HANDLE_POS: Record<ResizeHandle, CSSProperties> = {
  nw: { top: -5, left: -5, cursor: "nwse-resize" },
  ne: { top: -5, right: -5, cursor: "nesw-resize" },
  sw: { bottom: -5, left: -5, cursor: "nesw-resize" },
  se: { bottom: -5, right: -5, cursor: "nwse-resize" },
  n: { top: -5, left: "50%", marginLeft: -5, cursor: "ns-resize" },
  s: { bottom: -5, left: "50%", marginLeft: -5, cursor: "ns-resize" },
  e: { right: -5, top: "50%", marginTop: -5, cursor: "ew-resize" },
  w: { left: -5, top: "50%", marginTop: -5, cursor: "ew-resize" },
};

function ResizeHandleDot({
  pos,
  onDown,
  onMove,
  onUp,
}: {
  pos: ResizeHandle;
  onDown: (e: ReactPointerEvent) => void;
  onMove: (e: ReactPointerEvent) => void;
  onUp: (e: ReactPointerEvent) => void;
}) {
  return (
    <div
      role="slider"
      aria-label={`Resize ${pos}`}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      className="absolute z-10 h-2.5 w-2.5 touch-none rounded-[2px] border border-indigo-600 bg-white shadow-sm transition-transform hover:scale-125"
      style={HANDLE_POS[pos]}
    />
  );
}

function GridOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    />
  );
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

/**
 * For each candidate position, find the nearest snap target within threshold.
 * Returns the smallest delta to apply and the target line to draw (in canvas-px).
 */
function snap(
  candidates: number[],
  targets: number[],
  threshold: number,
): { delta: number; target: number } | null {
  let best: { delta: number; target: number } | null = null;
  for (const c of candidates) {
    for (const t of targets) {
      const d = t - c;
      if (Math.abs(d) <= threshold && (!best || Math.abs(d) < Math.abs(best.delta))) {
        best = { delta: d, target: t };
      }
    }
  }
  return best;
}
