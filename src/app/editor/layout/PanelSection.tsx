import { T } from "./tokens";

export function PanelSection({
  title,
  children,
  grow,
}: {
  title: string;
  children: React.ReactNode;
  grow?: boolean;
}) {
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        flex: grow ? 1 : "0 0 auto",
        borderBottom: grow ? "none" : `1px solid ${T.border}`,
      }}
    >
      <header
        style={{
          padding: "8px 12px",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 0.4,
          textTransform: "uppercase",
          color: T.textMuted,
          background: T.surfaceAlt,
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        {title}
      </header>
      <div style={{ flex: grow ? 1 : "0 0 auto", overflowY: "auto", padding: 8 }}>{children}</div>
    </section>
  );
}
