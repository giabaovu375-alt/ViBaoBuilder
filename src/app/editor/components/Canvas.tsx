import { useRef, useState } from "react";
import { useStore, updateElement, getProject } from "@/lib/builder/store";
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

export function Canvas({ projectId, slideId, selectedId, onSelect }: Props) {
  const slide = useStore((s) => {
    const project = s.projects.find((p) => p.id === projectId);
    return project?.slides.find((sl) => sl.id === slideId);
  });

  const canvasRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{
    id: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);
  const [scale, setScale] = useState(1);

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

  function handlePointerDown(e: React.PointerEvent, el: Element) {
    e.stopPropagation();
    onSelect(el.id);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragState.current = {
      id: el.id,
      startX: e.clientX,
      startY: e.clientY,
      origX: el.x,
      origY: el.y,
    };
    setScale(getCanvasScale());
  }

  function handlePointerMove(e: React.PointerEvent) {
    const drag = dragState.current;
    if (!drag) return;

    const dx = (e.clientX - drag.startX) / (scale || 1);
    const dy = (e.clientY - drag.startY) / (scale || 1);

    let nextX = drag.origX + dx;
    let nextY = drag.origY + dy;

    // Giới hạn trong canvas
    nextX = Math.max(0, Math.min(nextX, CANVAS_WIDTH));
    nextY = Math.max(0, Math.min(nextY, CANVAS_HEIGHT));

    updateElement(projectId, slideId, drag.id, { x: nextX, y: nextY });
  }

  function handlePointerUp() {
    dragState.current = null;
  }

  return (
    <div
      className="relative mx-auto w-full"
      style={{ maxWidth: CANVAS_WIDTH }}
      onClick={() => onSelect(null)}
    >
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

        {slide.elements.map((el) => (
          <div
            key={el.id}
            onPointerDown={(e) => handlePointerDown(e, el)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="absolute cursor-move touch-none select-none"
            style={{
              left: `${(el.x / CANVAS_WIDTH) * 100}%`,
              top: `${(el.y / CANVAS_HEIGHT) * 100}%`,
              width: `${(el.width / CANVAS_WIDTH) * 100}%`,
              height: `${(el.height / CANVAS_HEIGHT) * 100}%`,
              outline: selectedId === el.id ? "2px solid #6366f1" : "none",
              outlineOffset: 2,
            }}
          >
            <ElementRenderer element={el} />
          </div>
        ))}
      </div>
    </div>
  );
}
