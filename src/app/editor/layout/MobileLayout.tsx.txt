import { Toolbar } from "../components/Toolbar";
import { PageList } from "../components/PageList";
import { PropertyEditor } from "../components/PropertyEditor";
import { Canvas } from "../components/Canvas";
import { CanvasViewport } from "./CanvasViewport";
import { T } from "./tokens";
import type { PaneProps, MobileTab } from "./types";

export function MobileLayout({
  tabs,
  mobileTab,
  setMobileTab,
  ...p
}: PaneProps & {
  tabs: { key: MobileTab; label: string; icon: string }[];
  mobileTab: MobileTab;
  setMobileTab: (t: MobileTab) => void;
}) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
      {/* Canvas first on mobile for visibility */}
      <CanvasViewport zoom="fit" mobile>
        <Canvas
          projectId={p.project.id}
          slideId={p.slide.id}
          elements={p.slide.elements}
          background={p.slide.background}
          selectedId={p.selectedId}
          onSelect={(id) => {
            p.setSelectedId(id);
            if (id) setMobileTab("props");
          }}
        />
      </CanvasViewport>

      {/* Bottom sheet panel */}
      <div
        style={{
          background: T.surface,
          borderTop: `1px solid ${T.border}`,
          maxHeight: "42vh",
          overflowY: "auto",
          padding: "12px 14px",
          flexShrink: 0,
          boxShadow: "0 -4px 12px rgba(10,36,99,0.06)",
        }}
      >
        {mobileTab === "add" && (
          <Toolbar
            projectId={p.project.id}
            slideId={p.slide.id}
            onElementAdded={(id) => {
              p.setSelectedId(id);
              setMobileTab("props");
            }}
          />
        )}
        {mobileTab === "pages" && (
          <PageList
            projectId={p.project.id}
            slides={p.project.slides}
            slideIdx={p.slideIdx}
            onSelect={(i) => {
              p.onSelectSlide(i);
              setMobileTab("add");
            }}
          />
        )}
        {mobileTab === "props" && (
          <PropertyEditor
            projectId={p.project.id}
            slideId={p.slide.id}
            slideBackground={p.slide.background}
            slideName={p.slide.name}
            element={p.selected}
            onDelete={p.onDelete}
          />
        )}
      </div>

      {/* Bottom tab bar */}
      <nav
        role="tablist"
        aria-label="Bảng điều khiển"
        style={{
          display: "flex",
          background: T.surface,
          borderTop: `1px solid ${T.border}`,
          flexShrink: 0,
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {tabs.map((t) => {
          const active = mobileTab === t.key;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={active}
              onClick={() => setMobileTab(t.key)}
              style={{
                flex: 1,
                padding: "10px 4px",
                fontSize: 11,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                background: "transparent",
                color: active ? T.brand : T.textMuted,
                borderTop: active ? `2px solid ${T.brand}` : "2px solid transparent",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                fontFamily: T.font,
              }}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>{t.icon}</span>
              {t.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
