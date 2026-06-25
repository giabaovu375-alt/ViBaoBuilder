import { useRef } from "react";
import { updateElement } from "@/lib/builder/store";
import { ElementView } from "@/lib/builder/render";
import type { Element } from "@/lib/builder/types";

interface Props {
  projectId: string;
  slideId: string;
  elements: Element[];
  background: string;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export function Canvas({ projectId, slideId, elements, background, selectedId, onSelect }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null);

  function onMouseDown(e: React.MouseEvent, el: Element) {
    e.stopPropagation();
    onSelect(el.id);
    const rect = ref.current!.getBoundingClientRect();
    drag.current = {
      id: el.id,
      dx: e.clientX - rect.left - el.x,
      dy: e.clientY - rect.top - el.y,
    };
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!drag.current || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = Math.max(0, e.clientX - rect.left - drag.current.dx);
    const y = Math.max(0, e.clientY - rect.top - drag.current.dy);
    updateElement(projectId, slideId, drag.current.id, { x, y });
  }

  function endDrag() { drag.current = null; }

  return (
    <main
      className="flex flex-1 items-center justify-center overflow-auto bg-muted/40 p-6"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onSelect(null); }}
    >
      <div
        ref={ref}
        className="relative shadow-lg"
        style={{ width: 960, height: 540, background, flexShrink: 0 }}
        onMouseMove={onMouseMove}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        onMouseDown={(e) => { if (e.target === e.currentTarget) onSelect(null); }}
      >
        {elements.map((el) => (
          <div
            key={el.id}
            onMouseDown={(e) => onMouseDown(e, el)}
            style={{
              position: "absolute",
              left: el.x,
              top: el.y,
              width: el.width,
              height: el.height,
              outline: selectedId === el.id ? "2px solid #3b82f6" : "1px dashed transparent",
              cursor: "move",
            }}
            className="hover:outline-blue-300"
          >
            <div className="pointer-events-none absolute inset-0">
              <ElementView element={{ ...el, x: 0, y: 0 } as Element} />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
