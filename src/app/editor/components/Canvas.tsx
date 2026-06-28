import { useRef, useState } from "react";
import { useStore, updateElement } from "@/lib/builder/store";
import type { Element } from "@/lib/builder/types";
import { ElementRenderer } from "./ElementRenderer";

interface Props {
  projectId: string;
  slideId: string;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 540;
const MIN_SIZE = 24;
const TAP_THRESHOLD = 4; // px di chuyển tối đa để vẫn coi là "tap" (không phải kéo)

type DragKind = "move" | "resize";
type ResizeHandle = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

export function Canvas({ projectId, slideId, selectedId, onSelect }: Props) {
  const slide = useStore((s) => {
    const project = s.projects.find((p) => p.id === projectId);
    return project?.slides.find((sl) => sl.id === slideId);
  });

  const canvasRef = useRef<HTMLDivElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("(chưa có gì)");

  const dragState = useRef<{
    id: string;
    kind: DragKind;
    handle?: ResizeHandle;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    origWidth: number;
    origHeight: number;
    scale: number;
    moved: boolean; // đã di chuyển đủ xa để tính là "kéo" chưa, hay vẫn chỉ là "tap"
  } | null>(null);

  if (!slide) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-400">
        Không tìm thấy trang
      </div>
    );
  }

  function getCanvasScale() {
    if (!canvasRef.current) return 1;
    return canvasRef.current.getBoundingClientRect().width / CANVAS_WIDTH;
  }

  function startDrag(e: React.PointerEvent, el: Element, kind: DragKind, handle?: ResizeHandle) {
    e.stopPropagation();
    console.log("[DEBUG] startDrag", { kind, handle, elId: el.id });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragState.current = {
      id: el.id,
      kind,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      origX: el.x,
      origY: el.y,
      origWidth: el.width,
      origHeight: el.height,
      scale: getCanvasScale(),
      moved: false,
    };
  }

  function handlePointerMove(e: React.PointerEvent) {
    const drag = dragState.current;
    if (!drag) {
      console.log("[DEBUG] pointerMove nhưng dragState rỗng");
      return;
    }

    const rawDx = e.clientX - drag.startX;
    const rawDy = e.clientY - drag.startY;
    console.log("[DEBUG] pointerMove", { kind: drag.kind, handle: drag.handle, rawDx, rawDy, moved: drag.moved });

    // Chưa di chuyển đủ xa thì coi như chưa kéo — tránh tap nhẹ bị tính thành
    // 1 lần update vị trí (đây là nguồn gây cảm giác "giật" khi chỉ tap chọn).
    if (!drag.moved && Math.hypot(rawDx, rawDy) < TAP_THRESHOLD) {
      return;
    }
    drag.moved = true;

    const dx = rawDx / (drag.scale || 1);
    const dy = rawDy / (drag.scale || 1);

    if (drag.kind === "move") {
      let nextX = drag.origX + dx;
      let nextY = drag.origY + dy;
      nextX = Math.max(0, Math.min(nextX, CANVAS_WIDTH - drag.origWidth));
      nextY = Math.max(0, Math.min(nextY, CANVAS_HEIGHT - drag.origHeight));
      updateElement(projectId, slideId, drag.id, { x: nextX, y: nextY });
      return;
    }

    // Resize theo từng handle — góc đổi cả 2 chiều, cạnh giữa chỉ đổi 1 chiều.
    const h = drag.handle!;
    let { origX: x, origY: y, origWidth: width, origHeight: height } = drag;

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

    // Giới hạn trong biên canvas
    x = Math.max(0, x);
    y = Math.max(0, y);
    width = Math.min(width, CANVAS_WIDTH - x);
    height = Math.min(height, CANVAS_HEIGHT - y);

    updateElement(projectId, slideId, drag.id, { x, y, width, height });
  }

  function handlePointerUp() {
    const drag = dragState.current;
    if (drag && !drag.moved) {
      onSelect(drag.id);
      setDebugInfo(`tap chọn: ${drag.id} (kind=${drag.kind})`);
    } else if (drag) {
      setDebugInfo(`kéo xong: ${drag.id} (kind=${drag.kind}, moved=${drag.moved})`);
    }
    dragState.current = null;
  }

  function handleDoubleClick(el: Element) {
    if (el.type === "text") {
      setEditingId(el.id);
    }
  }

  function commitText(el: Element, value: string) {
    if (el.type === "text") {
      updateElement(projectId, slideId, el.id, { content: value });
    }
    setEditingId(null);
  }

  return (
    <div
      className="relative mx-auto w-full"
      style={{ maxWidth: CANVAS_WIDTH }}
      onClick={() => {
        onSelect(null);
        setEditingId(null);
      }}
    >
      <div className="mb-2 rounded bg-black/80 p-2 text-[10px] text-lime-300">
        selectedId: {selectedId ?? "null"} | {debugInfo}
      </div>
      <div
        ref={canvasRef}
        className="relative w-full overflow-hidden rounded-lg border border-slate-200 shadow-sm"
        style={{
          aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}`,
          background: slide.background,
        }}
      >
        {slide.elements.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-center">
            <span className="text-[13px] font-medium text-slate-400">Trang trống</span>
            <span className="text-[12px] text-slate-300">
              Bấm "Thêm" để tạo phần tử đầu tiên
            </span>
          </div>
        )}

        {slide.elements.map((el) => {
          const isSelected = selectedId === el.id;
          const isEditing = editingId === el.id;

          return (
            <div
              key={el.id}
              onPointerDown={(e) => {
                if (isEditing) return;
                startDrag(e, el, "move");
              }}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onDoubleClick={(e) => {
                e.stopPropagation();
                handleDoubleClick(el);
              }}
              className={`absolute select-none ${isEditing ? "cursor-text" : "cursor-move"} touch-none`}
              style={{
                left: `${(el.x / CANVAS_WIDTH) * 100}%`,
                top: `${(el.y / CANVAS_HEIGHT) * 100}%`,
                width: `${(el.width / CANVAS_WIDTH) * 100}%`,
                height: `${(el.height / CANVAS_HEIGHT) * 100}%`,
                outline: isSelected ? "2px solid #6366f1" : "none",
                outlineOffset: 2,
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
                    if (e.key === "Escape") {
                      setEditingId(null);
                    }
                  }}
                >
                  {el.content}
                </div>
              ) : (
                <ElementRenderer element={el} />
              )}

              {/* 4 handle resize ở 4 góc — chỉ hiện khi đang chọn */}
              {isSelected && !isEditing && (
                <>
                  <ResizeHandleDot pos="nw" onDown={(e) => startDrag(e, el, "resize", "nw")} onMove={handlePointerMove} onUp={handlePointerUp} />
                  <ResizeHandleDot pos="ne" onDown={(e) => startDrag(e, el, "resize", "ne")} onMove={handlePointerMove} onUp={handlePointerUp} />
                  <ResizeHandleDot pos="sw" onDown={(e) => startDrag(e, el, "resize", "sw")} onMove={handlePointerMove} onUp={handlePointerUp} />
                  <ResizeHandleDot pos="se" onDown={(e) => startDrag(e, el, "resize", "se")} onMove={handlePointerMove} onUp={handlePointerUp} />
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const HANDLE_POS: Record<ResizeHandle, React.CSSProperties> = {
  nw: { top: -6, left: -6, cursor: "nwse-resize" },
  ne: { top: -6, right: -6, cursor: "nesw-resize" },
  sw: { bottom: -6, left: -6, cursor: "nesw-resize" },
  se: { bottom: -6, right: -6, cursor: "nwse-resize" },
  n: { top: -6, left: "50%", marginLeft: -6, cursor: "ns-resize" },
  s: { bottom: -6, left: "50%", marginLeft: -6, cursor: "ns-resize" },
  e: { right: -6, top: "50%", marginTop: -6, cursor: "ew-resize" },
  w: { left: -6, top: "50%", marginTop: -6, cursor: "ew-resize" },
};

function ResizeHandleDot({
  pos,
  onDown,
  onMove,
  onUp,
}: {
  pos: ResizeHandle;
  onDown: (e: React.PointerEvent) => void;
  onMove: (e: React.PointerEvent) => void;
  onUp: () => void;
}) {
  return (
    <div
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      className="absolute z-10 h-3 w-3 touch-none rounded-full border-2 border-white bg-indigo-500 shadow"
      style={HANDLE_POS[pos]}
    />
  );
}
