import { Link } from "@tanstack/react-router";
import { T } from "./tokens";

export function EditorHeader({
  project,
  slideIdx,
  totalSlides,
}: {
  project: { id: string; name: string };
  slideIdx: number;
  totalSlides: number;
}) {
  return (
    <header
      role="banner"
      style={{
        background: T.brand,
        borderBottom: `2px solid ${T.accent}`,
        height: T.headerH,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 14px",
        flexShrink: 0,
        boxShadow: T.shadow,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <Link
          to="/"
          aria-label="Về trang chủ"
          style={{
            color: "rgba(255,255,255,0.75)",
            fontSize: 18,
            textDecoration: "none",
            lineHeight: 1,
            padding: "4px 6px",
            borderRadius: 6,
          }}
        >
          ←
        </Link>
        <div style={{ width: 1, height: 22, background: "rgba(255,255,255,0.15)" }} />
        <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
          <span
            style={{
              color: "#fff",
              fontWeight: 600,
              fontSize: 14,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "40vw",
            }}
            title={project.name}
          >
            {project.name}
          </span>
          <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 11 }}>
            Trang {slideIdx + 1} / {totalSlides}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          aria-live="polite"
          style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: 11,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              background: "#34D399",
              boxShadow: "0 0 6px #34D399",
            }}
          />
          Đã lưu
        </span>
        <Link
          to="/export/$projectId"
          params={{ projectId: project.id }}
          style={{
            background: T.accent,
            color: T.brand,
            fontWeight: 700,
            fontSize: 13,
            padding: "7px 14px",
            borderRadius: T.radius,
            textDecoration: "none",
            whiteSpace: "nowrap",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          ⬇ Xuất file
        </Link>
      </div>
    </header>
  );
}
