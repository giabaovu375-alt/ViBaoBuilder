import { T, clamp } from "./tokens";

export function ZoomBar({
  zoom,
  setZoom,
}: {
  zoom: number | "fit";
  setZoom: React.Dispatch<React.SetStateAction<number | "fit">>;
}) {
  const pct = zoom === "fit" ? "Fit" : `${Math.round(zoom * 100)}%`;
  const btn: React.CSSProperties = {
    background: T.surface,
    border: `1px solid ${T.border}`,
    color: T.textPrimary,
    width: 28,
    height: 28,
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  };
  return (
    <div
      style={{
        height: 36,
        background: T.surface,
        borderTop: `1px solid ${T.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        flexShrink: 0,
      }}
    >
      <button
        aria-label="Thu nhỏ"
        style={btn}
        onClick={() =>
          setZoom((z) => clamp((typeof z === "number" ? z : 1) - 0.1, 0.25, 2))
        }
      >
        −
      </button>
      <button
        onClick={() => setZoom("fit")}
        style={{
          ...btn,
          width: "auto",
          padding: "0 10px",
          minWidth: 64,
          fontSize: 12,
          color: zoom === "fit" ? T.brand : T.textPrimary,
        }}
      >
        {pct}
      </button>
      <button
        aria-label="Phóng to"
        style={btn}
        onClick={() =>
          setZoom((z) => clamp((typeof z === "number" ? z : 1) + 0.1, 0.25, 2))
        }
      >
        +
      </button>
      <span style={{ fontSize: 10, color: T.textMuted, marginLeft: 6 }}>
        ⌘ + / − / 0
      </span>
    </div>
  );
}
