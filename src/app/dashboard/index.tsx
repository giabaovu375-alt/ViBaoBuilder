import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { createProject, deleteProject, renameProject, useStore } from "@/lib/builder/store";

export function DashboardPage() {
  const projects = useStore((s) => s.projects);
  const [name, setName] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const p = createProject(name.trim() || "Dự án mới");
    setName("");
    window.location.href = `/editor/${p.id}`;
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* NAV */}
      <nav style={{ background: "#0A2463", borderBottom: "2px solid #F5C518" }} className="sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span style={{ color: "#F5C518", fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px" }}>
              ViBao
            </span>
            <span style={{ color: "#fff", fontSize: 22, fontWeight: 300 }}>Builder</span>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink href="#">Mẫu thiết kế</NavLink>
            <NavLink href="#">Hướng dẫn</NavLink>
            <NavLink href="#">Cộng đồng</NavLink>
          </div>

          {/* Hamburger mobile */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span style={{ display: "block", width: 22, height: 2, background: "#F5C518", borderRadius: 2, transition: "all 0.2s", transform: menuOpen ? "rotate(45deg) translateY(6px)" : "none" }} />
            <span style={{ display: "block", width: 22, height: 2, background: "#F5C518", borderRadius: 2, opacity: menuOpen ? 0 : 1, transition: "all 0.2s" }} />
            <span style={{ display: "block", width: 22, height: 2, background: "#F5C518", borderRadius: 2, transition: "all 0.2s", transform: menuOpen ? "rotate(-45deg) translateY(-6px)" : "none" }} />
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div style={{ background: "#0A2463", borderTop: "1px solid #1a3a7a" }} className="md:hidden px-4 pb-4 flex flex-col gap-3">
            <NavLink href="#">Mẫu thiết kế</NavLink>
            <NavLink href="#">Hướng dẫn</NavLink>
            <NavLink href="#">Cộng đồng</NavLink>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section style={{ background: "linear-gradient(135deg, #0A2463 0%, #1a3a8a 60%, #0e3060 100%)", minHeight: 340 }} className="relative overflow-hidden flex flex-col items-center justify-center text-center px-4 py-16">
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: -60, right: -60, width: 260, height: 260, borderRadius: "50%", background: "rgba(245,197,24,0.07)" }} />
        <div style={{ position: "absolute", bottom: -40, left: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(245,197,24,0.05)" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-block", background: "#F5C518", color: "#0A2463", fontWeight: 700, fontSize: 11, letterSpacing: 2, padding: "4px 14px", borderRadius: 20, marginBottom: 16, textTransform: "uppercase" }}>
            No-code · Miễn phí
          </div>
          <h1 style={{ color: "#fff", fontSize: "clamp(28px, 5vw, 52px)", fontWeight: 800, lineHeight: 1.15, marginBottom: 16, letterSpacing: "-1px" }}>
            Tạo website<br />
            <span style={{ color: "#F5C518" }}>không cần code</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 16, maxWidth: 480, margin: "0 auto 32px" }}>
            Kéo thả, tuỳ chỉnh, xuất bản — nhanh hơn bạn nghĩ.
          </p>

          {/* Create form */}
          <form onSubmit={handleCreate} className="flex gap-2 max-w-md mx-auto">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Đặt tên dự án..."
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.12)",
                border: "1.5px solid rgba(255,255,255,0.25)",
                borderRadius: 10,
                padding: "12px 16px",
                color: "#fff",
                fontSize: 14,
                outline: "none",
              }}
            />
            <button
              type="submit"
              style={{
                background: "#F5C518",
                color: "#0A2463",
                fontWeight: 700,
                fontSize: 14,
                border: "none",
                borderRadius: 10,
                padding: "12px 20px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "opacity 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              + Tạo mới
            </button>
          </form>
        </div>
      </section>

      {/* FEATURED TEMPLATES */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-6">
          <span style={{ width: 4, height: 22, background: "#F5C518", borderRadius: 2, display: "inline-block" }} />
          <h2 style={{ color: "#0A2463", fontWeight: 700, fontSize: 18 }}>Mẫu nổi bật</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TEMPLATES.map((t) => (
            <TemplateCard key={t.id} template={t} onCreate={() => {
              const p = createProject(t.name);
              window.location.href = `/editor/${p.id}`;
            }} />
          ))}
        </div>
      </section>

      {/* DIVIDER */}
      <div style={{ borderTop: "1.5px solid #e8eef8", maxWidth: "100%" }} className="mx-4" />

      {/* PROJECTS */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-6">
          <span style={{ width: 4, height: 22, background: "#0A2463", borderRadius: 2, display: "inline-block" }} />
          <h2 style={{ color: "#0A2463", fontWeight: 700, fontSize: 18 }}>
            Dự án của bạn
            {projects.length > 0 && (
              <span style={{ marginLeft: 8, background: "#e8eef8", color: "#0A2463", fontSize: 12, fontWeight: 600, padding: "2px 8px", borderRadius: 20 }}>
                {projects.length}
              </span>
            )}
          </h2>
        </div>

        {projects.length === 0 ? (
          <div style={{ border: "2px dashed #c5d3e8", borderRadius: 16, padding: "48px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🗂️</div>
            <p style={{ color: "#7a90b0", fontSize: 14 }}>Chưa có dự án nào. Tạo cái đầu tiên hoặc chọn mẫu bên trên!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => (
              <div
                key={p.id}
                style={{ border: "1.5px solid #e0e8f4", borderRadius: 14, background: "#fff", overflow: "hidden", transition: "box-shadow 0.2s, border-color 0.2s" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(10,36,99,0.10)";
                  (e.currentTarget as HTMLElement).style.borderColor = "#0A2463";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  (e.currentTarget as HTMLElement).style.borderColor = "#e0e8f4";
                }}
              >
                {/* Thumbnail */}
                <div style={{ background: "linear-gradient(135deg, #e8eef8, #c5d3e8)", height: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 28 }}>🌐</span>
                </div>

                <div style={{ padding: "12px 14px" }}>
                  <input
                    defaultValue={p.name}
                    onBlur={(e) => renameProject(p.id, e.target.value || p.name)}
                    style={{ background: "transparent", border: "none", outline: "none", fontWeight: 600, fontSize: 14, color: "#0A2463", width: "100%" }}
                  />
                  <p style={{ color: "#7a90b0", fontSize: 11, marginTop: 2 }}>
                    {p.slides.length} trang · {new Date(p.updatedAt).toLocaleDateString("vi-VN")}
                  </p>

                  <div className="flex gap-2 mt-3">
                    <Link
                      to="/editor/$projectId"
                      params={{ projectId: p.id }}
                      style={{ flex: 1, background: "#0A2463", color: "#fff", fontWeight: 600, fontSize: 12, padding: "7px 0", borderRadius: 8, textAlign: "center", textDecoration: "none" }}
                    >
                      Chỉnh sửa
                    </Link>
                    <Link
                      to="/export/$projectId"
                      params={{ projectId: p.id }}
                      style={{ flex: 1, background: "#f0f4fa", color: "#0A2463", fontWeight: 600, fontSize: 12, padding: "7px 0", borderRadius: 8, textAlign: "center", textDecoration: "none" }}
                    >
                      Xuất file
                    </Link>
                    <button
                      onClick={() => { if (confirm(`Xóa "${p.name}"?`)) deleteProject(p.id); }}
                      style={{ background: "#fff0f0", color: "#e03", fontWeight: 600, fontSize: 12, padding: "7px 10px", borderRadius: 8, border: "none", cursor: "pointer" }}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#0A2463", borderTop: "2px solid #F5C518", marginTop: 24 }}>
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>© 2026 ViBaoBuilder</span>
          <span style={{ color: "#F5C518", fontSize: 12, fontWeight: 600 }}>Made in Vietnam 🇻🇳</span>
        </div>
      </footer>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, fontWeight: 500, textDecoration: "none", transition: "color 0.15s" }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "#F5C518")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.75)")}
    >
      {children}
    </a>
  );
}

function TemplateCard({ template, onCreate }: { template: typeof TEMPLATES[0]; onCreate: () => void }) {
  return (
    <div
      style={{ border: "1.5px solid #e0e8f4", borderRadius: 14, overflow: "hidden", background: "#fff", transition: "box-shadow 0.2s" }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(10,36,99,0.10)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
    >
      {/* Preview */}
      <div style={{ background: template.bg, height: 120, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>
        {template.emoji}
      </div>
      <div style={{ padding: "12px 14px" }}>
        <div className="flex items-center gap-2 mb-1">
          <span style={{ background: "#e8eef8", color: "#0A2463", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, textTransform: "uppercase", letterSpacing: 0.5 }}>
            {template.tag}
          </span>
        </div>
        <p style={{ fontWeight: 700, fontSize: 14, color: "#0A2463", marginBottom: 4 }}>{template.name}</p>
        <p style={{ color: "#7a90b0", fontSize: 12, marginBottom: 10 }}>{template.desc}</p>
        <button
          onClick={onCreate}
          style={{ width: "100%", background: "#F5C518", color: "#0A2463", fontWeight: 700, fontSize: 13, padding: "8px 0", borderRadius: 8, border: "none", cursor: "pointer" }}
        >
          Dùng mẫu này
        </button>
      </div>
    </div>
  );
}

const TEMPLATES = [
  { id: 1, name: "Landing Page", tag: "Phổ biến", desc: "Trang giới thiệu sản phẩm hoặc dịch vụ.", emoji: "🚀", bg: "linear-gradient(135deg, #e8f4ff, #c5deff)" },
  { id: 2, name: "Portfolio", tag: "Sáng tạo", desc: "Showcase tác phẩm cá nhân ấn tượng.", emoji: "🎨", bg: "linear-gradient(135deg, #fff8e0, #ffe88a)" },
  { id: 3, name: "Cửa hàng", tag: "Kinh doanh", desc: "Trưng bày sản phẩm và thông tin liên hệ.", emoji: "🛍️", bg: "linear-gradient(135deg, #e8fff4, #a8f0d0)" },
];
                  
