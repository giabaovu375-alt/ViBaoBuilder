import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useStore, deleteElement } from "@/lib/builder/store";
import { EditorHeader } from "./layout/EditorHeader";
import { DesktopLayout } from "./layout/DesktopLayout";
import { MobileLayout } from "./layout/MobileLayout";
import { T, clamp } from "./layout/tokens";
import type { Layout, MobileTab } from "./layout/types";

/* ============================================================================
 * EditorPage — chỉ còn state + effects + ráp layout.
 * Layout/UI thật nằm trong ./editor/* (DesktopLayout, MobileLayout, v.v.)
 * ========================================================================== */

interface Props {
  projectId: string;
}

/* ---------- localStorage helpers (layout panel widths) -------------------- */
const LS_KEY = "editor:layout:v1";
const DEFAULT_LAYOUT: Layout = { left: 220, right: 280 };

function loadLayout(): Layout {
  if (typeof window === "undefined") return DEFAULT_LAYOUT;
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULT_LAYOUT;
    const p = JSON.parse(raw) as Partial<Layout>;
    return {
      left: clamp(p.left ?? DEFAULT_LAYOUT.left, 180, 360),
      right: clamp(p.right ?? DEFAULT_LAYOUT.right, 220, 420),
    };
  } catch {
    return DEFAULT_LAYOUT;
  }
}
function saveLayout(l: Layout) {
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(l));
  } catch {
    /* ignore quota */
  }
}

/* ---------- Media query hook ---------------------------------------------- */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window === "undefined" ? true : window.matchMedia("(min-width: 768px)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return isDesktop;
}

/* ============================================================================
 * Main component
 * ========================================================================== */
export function EditorPage({ projectId }: Props) {
  const project = useStore((s) => s.projects.find((p) => p.id === projectId));
  const [slideIdx, setSlideIdx] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>("add");
  const [layout, setLayout] = useState<Layout>(loadLayout);
  const [zoom, setZoom] = useState<number | "fit">("fit");
  const isDesktop = useIsDesktop();

  // Persist layout
  useEffect(() => saveLayout(layout), [layout]);

  /* ----- Empty state -------------------------------------------------- */
  if (!project) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100dvh",
          background: T.surfaceAlt,
          fontFamily: T.font,
        }}
      >
        <div style={{ textAlign: "center", padding: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🗂️</div>
          <h1 style={{ margin: 0, fontSize: 18, color: T.textPrimary }}>Không tìm thấy dự án</h1>
          <p style={{ color: T.textMuted, fontSize: 14, marginTop: 6 }}>
            Dự án có thể đã bị xoá hoặc bạn không có quyền truy cập.
          </p>
          <Link
            to="/"
            style={{
              display: "inline-block",
              marginTop: 16,
              background: T.brand,
              color: "#fff",
              padding: "10px 18px",
              borderRadius: T.radius,
              textDecoration: "none",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            ← Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  const safeIdx = Math.min(slideIdx, project.slides.length - 1);
  const slide = project.slides[safeIdx];
  const selected = slide.elements.find((e) => e.id === selectedId) ?? null;

  /* ----- Actions ------------------------------------------------------ */
  const handleDelete = useCallback(() => {
    if (!selected) return;
    deleteElement(project.id, slide.id, selected.id);
    setSelectedId(null);
  }, [selected, project.id, slide.id]);

  const handleSelectSlide = useCallback((i: number) => {
    setSlideIdx(i);
    setSelectedId(null);
  }, []);

  /* ----- Keyboard shortcuts ------------------------------------------ */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      const inField = tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable;
      if (inField) return;

      if ((e.key === "Delete" || e.key === "Backspace") && selected) {
        e.preventDefault();
        handleDelete();
        return;
      }
      if (e.key === "Escape") {
        setSelectedId(null);
        return;
      }
      if (e.metaKey || e.ctrlKey) {
        if (e.key === "=" || e.key === "+") {
          e.preventDefault();
          setZoom((z) => clamp((typeof z === "number" ? z : 1) + 0.1, 0.25, 2));
        } else if (e.key === "-") {
          e.preventDefault();
          setZoom((z) => clamp((typeof z === "number" ? z : 1) - 0.1, 0.25, 2));
        } else if (e.key === "0") {
          e.preventDefault();
          setZoom("fit");
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, handleDelete]);

  const TABS: { key: MobileTab; label: string; icon: string }[] = useMemo(
    () => [
      { key: "add", label: "Thêm", icon: "＋" },
      { key: "pages", label: "Trang", icon: "▤" },
      { key: "props", label: selected ? "Sửa" : "Cài đặt", icon: selected ? "✎" : "⚙" },
    ],
    [selected],
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        fontFamily: T.font,
        overflow: "hidden",
        background: T.surfaceAlt,
        color: T.textPrimary,
      }}
    >
      <EditorHeader project={project} slideIdx={safeIdx} totalSlides={project.slides.length} />

      {isDesktop ? (
        <DesktopLayout
          layout={layout}
          setLayout={setLayout}
          project={project}
          slide={slide}
          slideIdx={safeIdx}
          selected={selected}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          onSelectSlide={handleSelectSlide}
          onDelete={handleDelete}
          zoom={zoom}
          setZoom={setZoom}
        />
      ) : (
        <MobileLayout
          project={project}
          slide={slide}
          slideIdx={safeIdx}
          selected={selected}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          onSelectSlide={handleSelectSlide}
          onDelete={handleDelete}
          tabs={TABS}
          mobileTab={mobileTab}
          setMobileTab={setMobileTab}
        />
      )}
    </div>
  );
}
