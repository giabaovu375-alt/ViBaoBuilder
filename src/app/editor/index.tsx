import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useStore, deleteElement } from "@/lib/builder/store";
import { Canvas } from "./components/Canvas";
import { Toolbar } from "./components/Toolbar";
import { PageList } from "./components/PageList";
import { PropertyEditor } from "./components/PropertyEditor";

interface Props { projectId: string }

type MobileTab = "toolbar" | "pages" | "properties";

export function EditorPage({ projectId }: Props) {
  const project = useStore((s) => s.projects.find((p) => p.id === projectId));
  const [slideIdx, setSlideIdx] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>("toolbar");

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p style={{ color: "#7a90b0", fontSize: 14 }}>Không tìm thấy dự án.</p>
          <Link to="/" style={{ color: "#0A2463", fontSize: 14, textDecoration: "underline", display: "block", marginTop: 8 }}>← Về trang chủ</Link>
        </div>
      </div>
    );
  }

  const slide = project.slides[Math.min(slideIdx, project.slides.length - 1)];
  const selected = slide.elements.find((e) => e.id === selectedId) ?? null;

  const TAB_LABELS: { key: MobileTab; label: string }[] = [
    { key: "toolbar", label: "Thêm" },
    { key: "pages", label: "Trang" },
    { key: "properties", label: selected ? "Thuộc tính" : "Trang" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", background: "#f5f7fb", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* HEADER */}
      <header style={{ background: "#0A2463", borderBottom: "2px solid #F5C518", padding: "0 12px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link to="/" style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, textDecoration: "none" }}>← Trang chủ</Link>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>·</span>
          <span style={{ color: "#fff", fontWeight: 600, fontSize: 14, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{project.name}</span>
        </div>
        <Link to="/export/$projectId" params={{ projectId: project.id }}
          style={{ background: "#F5C518", color: "#0A2463", fontWeight: 700, fontSize: 13, padding: "6px 14px", borderRadius: 8, textDecoration: "none" }}>
          Xuất file
        </Link>
      </header>

      {/* DESKTOP LAYOUT */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <aside style={{ width: 180, background: "#fff", borderRight: "1px solid #e0e8f4", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Toolbar projectId={project.id} slideId={slide.id} onElementAdded={(id) => setSelectedId(id)} />
          <div style={{ borderTop: "1px solid #e0e8f4", flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <PageList projectId={project.id} slides={project.slides} slideIdx={slideIdx}
              onSelect={(i) => { setSlideIdx(i); setSelectedId(null); }} />
          </div>
        </aside>

        {/* Canvas */}
        <Canvas projectId={project.id} slideId={slide.id} elements={slide.elements}
          background={slide.background} selectedId={selectedId} onSelect={setSelectedId} />

        {/* Right sidebar */}
        <aside style={{ width: 240, background: "#fff", borderLeft: "1px solid #e0e8f4", overflow: "y-auto", padding: 14 }}>
          <PropertyEditor projectId={project.id} slideId={slide.id}
            slideBackground={slide.background} slideName={slide.name}
            element={selected}
            onDelete={() => { if (selected) { deleteElement(project.id, slide.id, selected.id); setSelectedId(null); } }} />
        </aside>
      </div>

      {/* MOBILE LAYOUT */}
      <div className="flex md:hidden flex-col flex-1 overflow-hidden">
        {/* Mobile tab bar */}
        <div style={{ background: "#fff", borderBottom: "1px solid #e0e8f4", display: "flex", flexShrink: 0 }}>
          {TAB_LABELS.map((t) => (
            <button key={t.key} onClick={() => setMobileTab(t.key)}
              style={{ flex: 1, padding: "10px 4px", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", transition: "all 0.15s",
                background: mobileTab === t.key ? "#0A2463" : "#fff",
                color: mobileTab === t.key ? "#F5C518" : "#7a90b0",
                borderBottom: mobileTab === t.key ? "2px solid #F5C518" : "2px solid transparent",
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Mobile panel */}
        <div style={{ background: "#fff", borderBottom: "1px solid #e0e8f4", flexShrink: 0, maxHeight: 180, overflowY: "auto", padding: "10px 12px" }}>
          {mobileTab === "toolbar" && (
            <Toolbar projectId={project.id} slideId={slide.id} onElementAdded={(id) => { setSelectedId(id); setMobileTab("properties"); }} />
          )}
          {mobileTab === "pages" && (
            <PageList projectId={project.id} slides={project.slides} slideIdx={slideIdx}
              onSelect={(i) => { setSlideIdx(i); setSelectedId(null); }} />
          )}
          {mobileTab === "properties" && (
            <PropertyEditor projectId={project.id} slideId={slide.id}
              slideBackground={slide.background} slideName={slide.name}
              element={selected}
              onDelete={() => { if (selected) { deleteElement(project.id, slide.id, selected.id); setSelectedId(null); } }} />
          )}
        </div>

        {/* Canvas mobile — scroll ngang */}
        <div style={{ flex: 1, overflow: "auto", background: "#e8eef8" }}>
          <Canvas projectId={project.id} slideId={slide.id} elements={slide.elements}
            background={slide.background} selectedId={selectedId}
            onSelect={(id) => { setSelectedId(id); if (id) setMobileTab("properties"); }} />
        </div>
      </div>
    </div>
  );
}
