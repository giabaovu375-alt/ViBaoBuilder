import { useState, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { useStore, deleteElement } from "@/lib/builder/store";
import { Canvas } from "./components/Canvas";
import { Toolbar } from "./components/Toolbar";
import { PageList } from "./components/PageList";
import { PropertyEditor } from "./components/PropertyEditor";

interface Props { projectId: string }
type MobileTab = "add" | "pages" | "props";

export function EditorPage({ projectId }: Props) {
  const project = useStore((s) => s.projects.find((p) => p.id === projectId));
  const [slideIdx, setSlideIdx] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>("add");
  const canvasWrapRef = useRef<HTMLDivElement>(null);

  if (!project) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100dvh" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "#7a90b0" }}>Không tìm thấy dự án.</p>
        <Link to="/" style={{ color: "#0A2463", textDecoration: "underline" }}>← Về trang chủ</Link>
      </div>
    </div>
  );

  const slide = project.slides[Math.min(slideIdx, project.slides.length - 1)];
  const selected = slide.elements.find((e) => e.id === selectedId) ?? null;

  const TABS: { key: MobileTab; label: string }[] = [
    { key: "add", label: "➕ Thêm" },
    { key: "pages", label: "📄 Trang" },
    { key: "props", label: selected ? "✏️ Sửa" : "⚙️ Cài đặt" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", fontFamily: "'Inter', system-ui, sans-serif", overflow: "hidden" }}>

      {/* HEADER */}
      <header style={{ background: "#0A2463", borderBottom: "2px solid #F5C518", height: 50, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <Link to="/" style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, textDecoration: "none", whiteSpace: "nowrap" }}>← Trang chủ</Link>
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>·</span>
          <span style={{ color: "#fff", fontWeight: 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 120 }}>{project.name}</span>
        </div>
        <Link to="/export/$projectId" params={{ projectId: project.id }}
          style={{ background: "#F5C518", color: "#0A2463", fontWeight: 700, fontSize: 12, padding: "6px 12px", borderRadius: 7, textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}>
          Xuất file
        </Link>
      </header>

      {/* ===== DESKTOP ===== */}
      <div style={{ display: "none", flex: 1, overflow: "hidden" }} className="md-layout">
        <style>{`@media(min-width:768px){.md-layout{display:flex!important}.mobile-layout{display:none!important}}`}</style>

        <aside style={{ width: 170, background: "#fff", borderRight: "1px solid #e0e8f4", display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0 }}>
          <Toolbar projectId={project.id} slideId={slide.id} onElementAdded={(id) => setSelectedId(id)} />
          <div style={{ borderTop: "1px solid #e0e8f4", flex: 1, overflowY: "auto" }}>
            <PageList projectId={project.id} slides={project.slides} slideIdx={slideIdx}
              onSelect={(i) => { setSlideIdx(i); setSelectedId(null); }} />
          </div>
        </aside>

        <Canvas projectId={project.id} slideId={slide.id} elements={slide.elements}
          background={slide.background} selectedId={selectedId} onSelect={setSelectedId} />

        <aside style={{ width: 230, background: "#fff", borderLeft: "1px solid #e0e8f4", overflowY: "auto", padding: 12, flexShrink: 0 }}>
          <PropertyEditor projectId={project.id} slideId={slide.id}
            slideBackground={slide.background} slideName={slide.name} element={selected}
            onDelete={() => { if (selected) { deleteElement(project.id, slide.id, selected.id); setSelectedId(null); } }} />
        </aside>
      </div>

      {/* ===== MOBILE ===== */}
      <div className="mobile-layout" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Tab bar */}
        <div style={{ display: "flex", background: "#fff", borderBottom: "1px solid #e0e8f4", flexShrink: 0 }}>
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setMobileTab(t.key)} style={{
              flex: 1, padding: "9px 4px", fontSize: 11, fontWeight: 600, border: "none", cursor: "pointer",
              background: mobileTab === t.key ? "#f0f4fa" : "#fff",
              color: mobileTab === t.key ? "#0A2463" : "#7a90b0",
              borderBottom: mobileTab === t.key ? "2px solid #0A2463" : "2px solid transparent",
            }}>{t.label}</button>
          ))}
        </div>

        {/* Panel */}
        <div style={{ background: "#fff", borderBottom: "1px solid #e0e8f4", flexShrink: 0, maxHeight: 200, overflowY: "auto", padding: "10px 12px" }}>
          {mobileTab === "add" && (
            <Toolbar projectId={project.id} slideId={slide.id}
              onElementAdded={(id) => { setSelectedId(id); setMobileTab("props"); }} />
          )}
          {mobileTab === "pages" && (
            <PageList projectId={project.id} slides={project.slides} slideIdx={slideIdx}
              onSelect={(i) => { setSlideIdx(i); setSelectedId(null); setMobileTab("add"); }} />
          )}
          {mobileTab === "props" && (
            <PropertyEditor projectId={project.id} slideId={slide.id}
              slideBackground={slide.background} slideName={slide.name} element={selected}
              onDelete={() => { if (selected) { deleteElement(project.id, slide.id, selected.id); setSelectedId(null); } }} />
          )}
        </div>

        {/* Canvas — scaled to fit mobile width */}
        <div ref={canvasWrapRef} style={{ flex: 1, overflow: "auto", background: "#e8eef8", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 12 }}>
          <ScaledCanvas>
            <Canvas projectId={project.id} slideId={slide.id} elements={slide.elements}
              background={slide.background} selectedId={selectedId}
              onSelect={(id) => { setSelectedId(id); if (id) setMobileTab("props"); }} />
          </ScaledCanvas>
        </div>
      </div>
    </div>
  );
}

// Scale canvas 960px xuống fit màn hình mobile
function ScaledCanvas({ children }: { children: React.ReactNode }) {
  const CANVAS_W = 960;
  const viewW = typeof window !== "undefined" ? Math.min(window.innerWidth - 24, CANVAS_W) : CANVAS_W;
  const scale = viewW / CANVAS_W;
  return (
    <div style={{ width: viewW, height: 540 * scale, flexShrink: 0 }}>
      <div style={{ width: CANVAS_W, height: 540, transformOrigin: "top left", transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  );
      }
