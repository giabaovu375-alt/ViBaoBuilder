import { Toolbar } from "../components/Toolbar";
import { PageList } from "../components/PageList";
import { PropertyEditor } from "../components/PropertyEditor";
import { Canvas } from "../components/Canvas";
import { CanvasViewport } from "./CanvasViewport";
import { ZoomBar } from "./ZoomBar";
import { Resizer } from "./Resizer";
import { PanelSection } from "./PanelSection";
import { T, clamp } from "./tokens";
import type { PaneProps, Layout } from "./types";

export function DesktopLayout({
  layout,
  setLayout,
  zoom,
  setZoom,
  ...p
}: PaneProps & {
  layout: Layout;
  setLayout: (l: Layout) => void;
  zoom: number | "fit";
  setZoom: React.Dispatch<React.SetStateAction<number | "fit">>;
}) {
  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>
      {/* LEFT */}
      <aside
        aria-label="Công cụ và danh sách trang"
        style={{
          width: layout.left,
          background: T.surface,
          borderRight: `1px solid ${T.border}`,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <PanelSection title="Thành phần">
          <Toolbar
            projectId={p.project.id}
            slideId={p.slide.id}
            onElementAdded={(id) => p.setSelectedId(id)}
          />
        </PanelSection>
        <PanelSection title="Trang" grow>
          <PageList
            projectId={p.project.id}
            slides={p.project.slides}
            slideIdx={p.slideIdx}
            onSelect={p.onSelectSlide}
          />
        </PanelSection>
      </aside>

      <Resizer
        onDrag={(dx) => setLayout({ ...layout, left: clamp(layout.left + dx, 180, 360) })}
      />

      {/* CENTER */}
      <main
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          background: T.canvasBg,
          overflow: "hidden",
        }}
      >
        <CanvasViewport zoom={zoom}>
          <Canvas
            projectId={p.project.id}
            slideId={p.slide.id}
            elements={p.slide.elements}
            background={p.slide.background}
            selectedId={p.selectedId}
            onSelect={p.setSelectedId}
          />
        </CanvasViewport>
        <ZoomBar zoom={zoom} setZoom={setZoom} />
      </main>

      <Resizer
        onDrag={(dx) => setLayout({ ...layout, right: clamp(layout.right - dx, 220, 420) })}
      />

      {/* RIGHT */}
      <aside
        aria-label="Thuộc tính"
        style={{
          width: layout.right,
          background: T.surface,
          borderLeft: `1px solid ${T.border}`,
          overflowY: "auto",
          flexShrink: 0,
        }}
      >
        <PanelSection title={p.selected ? "Sửa thành phần" : "Cài đặt trang"}>
          <PropertyEditor
            projectId={p.project.id}
            slideId={p.slide.id}
            slideBackground={p.slide.background}
            slideName={p.slide.name}
            element={p.selected}
            onDelete={p.onDelete}
          />
        </PanelSection>
      </aside>
    </div>
  );
}
