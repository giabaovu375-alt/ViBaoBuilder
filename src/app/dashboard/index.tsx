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
    <div style={{ minHeight: "100vh", background: "#f5f7fb", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* NAV */}
      <nav style={{ background: "#0A2463", borderBottom: "2px solid #F5C518", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 16px", height: 52, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: "#F5C518", fontSize: 18, fontWeight: 800 }}>ViBao</span>
            <span style={{ color: "#fff", fontSize: 18, fontWeight: 300 }}>Builder</span>
          </div>
          {/* Desktop links */}
          <div style={{ display: "flex", gap: 24, alignItems: "center" }} className="nav-desktop">
            <NavLink href="#">Mẫu</NavLink>
            <NavLink href="#">Hướng dẫn</NavLink>
            <NavLink href="#">Cộng đồng</NavLink>
          </div>
          {/* Hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, display: "flex", flexDirection: "column", gap: 5 }} className="nav-mobile" aria-label="Menu">
            <span style={{ width: 20, height: 2, background: "#F5C518", borderRadius: 2, display: "block", transition: "all 0.2s", transform: menuOpen ? "rotate(45deg) translateY(7px)" : "none" }} />
            <span style={{ width: 20, height: 2, background: "#F5C518", borderRadius: 2, display: "block", opacity: menuOpen ? 0 : 1, transition: "opacity 0.2s" }} />
            <span style={{ width: 20, height: 2, background: "#F5C518", borderRadius: 2, display: "block", transition: "all 0.2s", transform: menuOpen ? "rotate(-45deg) translateY(-7px)" : "none" }} />
          </button>
        </div>
        {menuOpen && (
          <div style={{ background: "#0A2463", borderTop: "1px solid rgba(255,255,255,0.1)", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
            <NavLink href="#">Mẫu</NavLink>
            <NavLink href="#">Hướng dẫn</NavLink>
            <NavLink href="#">Cộng đồng</NavLink>
          </div>
        )}
      </nav>

      <style>{`
        @media(min-width:640px){.nav-mobile{display:none!important}.nav-desktop{display:flex!important}}
        @media(max-width:639px){.nav-desktop{display:none!important}}
      `}</style>

      {/* HERO */}
      <section style={{ background: "linear-gradient(135deg, #0A2463 0%, #1a3a8a 100%)", padding: "48px 16px" }}>
        <div style={{ maxWidth: 500, margin: "0 auto", textAlign: "center" }}>
          <span style={{ display: "inline-block", background: "#F5C518", color: "#0A2463", fontWeight: 700, fontSize: 10, letterSpacing: 2, padding: "3px 12px", borderRadius: 20, textTransform: "uppercase", marginBottom: 14 }}>
            No-code · Miễn phí
          </span>
          <h1 style={{ color: "#fff", fontSize: "clamp(24px, 6vw, 42px)", fontWeight: 800, lineHeight: 1.2, marginBottom: 10, letterSpacing: "-0.5px" }}>
            Tạo website<br /><span style={{ color: "#F5C518" }}>không cần code</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, marginBottom: 24 }}>
            Kéo thả, tuỳ chỉnh, xuất bản — nhanh hơn bạn nghĩ.
          </p>
          <form onSubmit={handleCreate} style={{ display: "flex", gap: 8 }}>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên dự án..."
              style={{ flex: 1, minWidth: 0, background: "rgba(255,255,255,0.13)", border: "1.5px solid rgba(255,255,255,0.22)", borderRadius: 9, padding: "10px 13px", color: "#fff", fontSize: 13, outline: "none" }} />
            <button type="submit" style={{ background: "#F5C518", color: "#0A2463", fontWeight: 700, fontSize: 13, border: "none", borderRadius: 9, padding: "10px 16px", cursor: "pointer", whiteSpace: "nowrap" }}>
              + Tạo mới
            </button>
          </form>
        </div>
      </section>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 16px" }}>

        {/* TEMPLATES */}
        <section style={{ paddingTop: 32, paddingBottom: 24 }}>
          <SectionTitle bar="#F5C518">Mẫu nổi bật</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginTop: 14 }}>
            {TEMPLATES.map((t) => (
              <div key={t.id} style={{ border: "1.5px solid #e0e8f4", borderRadius: 12, overflow: "hidden", background: "#fff", cursor: "pointer" }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(10,36,99,0.10)")}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}>
                <div style={{ background: t.bg, height: 80, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>{t.emoji}</div>
                <div style={{ padding: "10px 11px" }}>
                  <span style={{ background: "#e8eef8", color: "#0A2463", fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 20, textTransform: "uppercase", letterSpacing: 0.5 }}>{t.tag}</span>
                  <p style={{ fontWeight: 700, fontSize: 13, color: "#0A2463", margin: "5px 0 2px" }}>{t.name}</p>
                  <p style={{ color: "#7a90b0", fontSize: 11, marginBottom: 8 }}>{t.desc}</p>
                  <button onClick={() => { const p = createProject(t.name); window.location.href = `/editor/${p.id}`; }}
                    style={{ width: "100%", background: "#F5C518", color: "#0A2463", fontWeight: 700, fontSize: 12, padding: "6px 0", borderRadius: 7, border: "none", cursor: "pointer" }}>
                    Dùng mẫu
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div style={{ borderTop: "1.5px solid #e0e8f4", margin: "0 0 24px" }} />

        {/* PROJECTS */}
        <section style={{ paddingBottom: 40 }}>
          <SectionTitle bar="#0A2463">
            Dự án của bạn
            {projects.length > 0 && <span style={{ marginLeft: 7, background: "#e8eef8", color: "#0A2463", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20 }}>{projects.length}</span>}
          </SectionTitle>

          {projects.length === 0 ? (
            <div style={{ border: "2px dashed #c5d3e8", borderRadius: 14, padding: "36px 16px", textAlign: "center", marginTop: 14 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🗂️</div>
              <p style={{ color: "#7a90b0", fontSize: 13 }}>Chưa có dự án nào. Tạo hoặc chọn mẫu bên trên!</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginTop: 14 }}>
              {projects.map((p) => (
                <div key={p.id} style={{ border: "1.5px solid #e0e8f4", borderRadius: 12, background: "#fff", overflow: "hidden", transition: "box-shadow 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(10,36,99,0.10)")}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}>
                  <div style={{ background: "linear-gradient(135deg, #e8eef8, #c5d3e8)", height: 70, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🌐</div>
                  <div style={{ padding: "10px 11px" }}>
                    <input defaultValue={p.name} onBlur={(e) => renameProject(p.id, e.target.value || p.name)}
                      style={{ background: "transparent", border: "none", outline: "none", fontWeight: 700, fontSize: 13, color: "#0A2463", width: "100%" }} />
                    <p style={{ color: "#7a90b0", fontSize: 10, marginTop: 1, marginBottom: 8 }}>
                      {p.slides.length} trang · {new Date(p.updatedAt).toLocaleDateString("vi-VN")}
                    </p>
                    <div style={{ display: "flex", gap: 5 }}>
                      <Link to="/editor/$projectId" params={{ projectId: p.id }}
                        style={{ flex: 1, background: "#0A2463", color: "#fff", fontWeight: 600, fontSize: 11, padding: "6px 0", borderRadius: 7, textAlign: "center", textDecoration: "none" }}>
                        Sửa
                      </Link>
                      <Link to="/export/$projectId" params={{ projectId: p.id }}
                        style={{ flex: 1, background: "#f0f4fa", color: "#0A2463", fontWeight: 600, fontSize: 11, padding: "6px 0", borderRadius: 7, textAlign: "center", textDecoration: "none" }}>
                        Xuất
                      </Link>
                      <button onClick={() => { if (confirm(`Xóa "${p.name}"?`)) deleteProject(p.id); }}
                        style={{ background: "#fff0f0", color: "#cc0022", fontWeight: 600, fontSize: 11, padding: "6px 8px", borderRadius: 7, border: "none", cursor: "pointer" }}>
                        🗑
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* FOOTER */}
      <footer style={{ background: "#0A2463", borderTop: "2px solid #F5C518" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 20, marginBottom: 24 }}>
            <div>
              <p style={{ color: "#F5C518", fontWeight: 700, fontSize: 14, marginBottom: 8 }}>ViBaoBuilder</p>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, lineHeight: 1.6 }}>Công cụ tạo website no-code dành cho người Việt.</p>
            </div>
            <FooterCol title="Sản phẩm" links={["Tính năng", "Mẫu thiết kế", "Bảng giá", "Changelog"]} />
            <FooterCol title="Hỗ trợ" links={["Hướng dẫn", "FAQ", "Cộng đồng", "Liên hệ"]} />
            <FooterCol title="Pháp lý" links={["Điều khoản", "Bảo mật", "Cookie", "Về chúng tôi"]} />
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
            <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>© 2026 ViBaoBuilder</span>
            <span style={{ color: "#F5C518", fontSize: 11, fontWeight: 600 }}>Made with ❤️ in Vietnam 🇻🇳</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 500, textDecoration: "none" }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "#F5C518")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}>
      {children}
    </a>
  );
}

function SectionTitle({ children, bar }: { children: React.ReactNode; bar: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ width: 3, height: 18, background: bar, borderRadius: 2, flexShrink: 0 }} />
      <h2 style={{ color: "#0A2463", fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", gap: 6, margin: 0 }}>{children}</h2>
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <p style={{ color: "rgba(255,255,255,0.6)", fontWeight: 600, fontSize: 11, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>{title}</p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
        {links.map((l) => (
          <li key={l}>
            <a href="#" style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, textDecoration: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#F5C518")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}>
              {l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

const TEMPLATES = [
  { id: 1, name: "Landing Page", tag: "Phổ biến", desc: "Giới thiệu sản phẩm/dịch vụ.", emoji: "🚀", bg: "linear-gradient(135deg, #e8f4ff, #c5deff)" },
  { id: 2, name: "Portfolio", tag: "Sáng tạo", desc: "Showcase tác phẩm cá nhân.", emoji: "🎨", bg: "linear-gradient(135deg, #fff8e0, #ffe88a)" },
  { id: 3, name: "Cửa hàng", tag: "Kinh doanh", desc: "Trưng bày sản phẩm.", emoji: "🛍️", bg: "linear-gradient(135deg, #e8fff4, #a8f0d0)" },
];
  
