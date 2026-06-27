import { useEffect, useRef, useState } from "react";
import { CANVAS_H, CANVAS_W, T, clamp } from "./tokens";

export function CanvasViewport({
  children,
  zoom,
  mobile,
}: {
  children: React.ReactNode;
  zoom: number | "fit";
  mobile?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [fitScale, setFitScale] = useState(1);

  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0].contentRect;
      const pad = mobile ? 16 : 48;
      const sx = (cr.width - pad) / CANVAS_W;
      const sy = (cr.height - pad) / CANVAS_H;
      setFitScale(clamp(Math.min(sx, sy), 0.1, 2));
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [mobile]);

  const scale = zoom === "fit" ? fitScale : zoom;

  return (
    <div
      ref={wrapRef}
      style={{
        flex: 1,
        minHeight: 0,
        overflow: "auto",
        background: T.canvasBg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: mobile ? 8 : 24,
      }}
    >
      <div
        style={{
          width: CANVAS_W * scale,
          height: CANVAS_H * scale,
          flexShrink: 0,
          boxShadow: T.shadow,
          background: "#fff",
          borderRadius: 4,
        }}
      >
        <div
          style={{
            width: CANVAS_W,
            height: CANVAS_H,
            transformOrigin: "top left",
            transform: `scale(${scale})`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
