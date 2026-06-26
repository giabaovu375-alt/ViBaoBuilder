import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { createProject, deleteProject, renameProject, useStore } from "@/lib/builder/store";
import {
  Sparkles,
  Layout,
  FileDown,
  ChevronRight,
  Menu,
  Zap,
  Palette,
  Globe,
  ArrowRight,
  Star,
  Layers,
  Play,
  Plus,
} from "lucide-react";

const featuredTemplates = [
  {
    icon: "🎨",
    title: "Landing Page Pro",
    desc: "Trang giới thiệu sản phẩm chuyên nghiệp",
    color: "from-blue-400 to-blue-600",
    tags: ["Miễn phí", "Phổ biến"],
    isNew: true,
  },
  {
    icon: "🛍️",
    title: "Shop Online",
    desc: "Gian hàng trực tuyến đầy đủ tính năng",
    color: "from-amber-400 to-orange-500",
    tags: ["Miễn phí", "Mới"],
    isNew: true,
  },
  {
    icon: "📝",
    title: "Blog Cá Nhân",
    desc: "Chia sẻ câu chuyện của bạn",
    color: "from-violet-400 to-purple-600",
    tags: ["Miễn phí"],
    isNew: false,
  },
  {
    icon: "📱",
    title: "Portfolio",
    desc: "Showcase dự án & kỹ năng",
    color: "from-emerald-400 to-teal-600",
    tags: ["Miễn phí", "Xuất sắc"],
    isNew: true,
  },
];

export function DashboardPage() {
  const projects = useStore((s) => s.projects);
  const [name, setName] = useState("");
  const [isHoveredCreate, setIsHoveredCreate] = useState(false);

  // Real data from store
  const totalProjects = projects.length;
  const totalSlides = projects.reduce((sum, p) => sum + p.slides.length, 0);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const p = createProject(name.trim() || "Dự án mới");
    setName("");
    window.location.href = `/editor/${p.id}`;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      {/* ===== NAVBAR ===== */}
      <nav className="sticky top-0 z-50 border-b border-blue-100/50 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-lg shadow-md shadow-blue-200">
              V
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              ViBaoBuilder
            </span>
          </div>

          <button className="rounded-lg border border-blue-100 p-2 hover:bg-blue-50 transition-colors">
            <Menu className="h-5 w-5 text-blue-700" />
          </button>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 pb-20">
        {/* ===== HERO SECTION ===== */}
        <section className="relative mt-12 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 p-10 text-white shadow-2xl shadow-blue-200/50">
          <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-amber-400/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          
          <div className="absolute inset-0 opacity-10" 
               style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

          <div className="relative z-10 flex items-center justify-between">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm mb-4">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                <span>Thiết kế website kéo thả · Lưu trên máy</span>
              </div>
              <h1 className="text-4xl font-extrabold leading-tight">
                Tạo website <span className="text-amber-300">kéo thả</span> <br />đơn giản & nhanh chóng
              </h1>
              <p className="mt-3 text-blue-100 text-sm leading-relaxed max-w-md">
                Miễn phí · Không cần đăng ký · Dữ liệu của bạn nằm trên máy
              </p>

              <form onSubmit={handleCreate} className="mt-6 flex gap-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Đặt tên dự án mới..."
                  className="flex-1 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-3 text-sm text-white placeholder-blue-200 outline-none focus:border-amber-300 focus:bg-white/20 transition-all"
                />
                <button
                  type="submit"
                  onMouseEnter={() => setIsHoveredCreate(true)}
                  onMouseLeave={() => setIsHoveredCreate(false)}
                  className="group rounded-xl bg-amber-400 px-5 py-3 text-sm font-semibold text-blue-900 shadow-lg shadow-amber-400/30 hover:bg-amber-300 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Tạo ngay
                  <ArrowRight className={`h-4 w-4 transition-transform ${isHoveredCreate ? 'translate-x-1' : ''}`} />
                </button>
              </form>
            </div>

            {/* Hero illustration */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="flex flex-col gap-3">
                <div className="h-24 w-32 rounded-xl bg-white/15 backdrop-blur-sm border border-white/10 flex items-center justify-center text-3xl hover:scale-105 transition-transform">
                  🎨
                </div>
                <div className="h-20 w-32 rounded-xl bg-amber-400/20 backdrop-blur-sm border border-amber-300/30 flex items-center justify-center text-2xl hover:scale-105 transition-transform">
                  ⚡
                </div>
              </div>
              <div className="flex flex-col gap-3 mt-6">
                <div className="h-20 w-32 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center text-2xl hover:scale-105 transition-transform">
                  📄
                </div>
                <div className="h-24 w-32 rounded-xl bg-white/15 backdrop-blur-sm border border-white/10 flex items-center justify-center text-3xl hover:scale-105 transition-transform">
                  🚀
                </div>
              </div>
            </div>
          </div>

          {/* Real stats */}
          <div className="relative z-10 mt-8 flex gap-6 pt-6 border-t border-white/10">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-amber-300" />
              <span className="text-sm font-semibold">{totalProjects}</span>
              <span className="text-xs text-blue-200">dự án</span>
            </div>
            <div className="flex items-center gap-2">
              <Layout className="h-4 w-4 text-amber-300" />
              <span className="text-sm font-semibold">{totalSlides}</span>
              <span className="text-xs text-blue-200">trang đã tạo</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-amber-300" />
              <span className="text-xs text-blue-200">miễn phí trọn đời</span>
            </div>
          </div>
        </section>

        {/* ===== QUICK ACTIONS ===== */}
        <section className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Play, label: "Bắt đầu nhanh", color: "blue", action: () => document.querySelector<HTMLInputElement>('input')?.focus() },
            { icon: Palette, label: "Mẫu thiết kế", color: "amber", action: () => window.scrollTo({ top: document.getElementById('templates')?.offsetTop, behavior: 'smooth' }) },
            { icon: Globe, label: "Dự án của tôi", color: "emerald", action: () => window.scrollTo({ top: document.getElementById('projects')?.offsetTop, behavior: 'smooth' }) },
            { icon: Zap, label: "Tài liệu", color: "violet", action: () => {} },
          ].map((action, idx) => (
            <button
              key={idx}
              onClick={action.action}
              className="group flex flex-col items-center gap-2 rounded-xl border border-blue-100 bg-white p-4 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                <action.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-slate-700">{action.label}</span>
            </button>
          ))}
        </section>

        {/* ===== FEATURED TEMPLATES ===== */}
        <section id="templates" className="mt-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                Mẫu thiết kế xuất sắc
              </h2>
              <p className="text-sm text-slate-500 mt-1">Chọn template để bắt đầu nhanh hơn</p>
            </div>
            <button className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors group">
              Xem tất cả 
              <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredTemplates.map((tpl, idx) => (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-2xl border border-blue-100 bg-white p-5 shadow-sm hover:shadow-xl hover:shadow-blue-100/50 hover:-translate-y-2 transition-all duration-300 cursor-pointer"
              >
                {tpl.isNew && (
                  <div className="absolute top-3 right-3 z-10">
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                      <Sparkles className="h-2.5 w-2.5" /> MỚI
                    </span>
                  </div>
                )}

                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${tpl.color}`} />

                <div className="mt-2 mb-4 h-32 rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
                    <span className="text-xs font-medium bg-white/90 px-2 py-0.5 rounded-full text-slate-700 shadow-sm">
                      Dùng ngay
                    </span>
                  </div>
                  {tpl.icon}
                </div>

                <h3 className="font-semibold text-slate-800">{tpl.title}</h3>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">{tpl.desc}</p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {tpl.tags.map((tag, tagIdx) => (
                    <span
                      key={tagIdx}
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                        tag === "Phổ biến" || tag === "Xuất sắc"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : tag === "Mới"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== MY PROJECTS ===== */}
        <section id="projects" className="mt-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Layers className="h-5 w-5 text-blue-600" />
                Dự án của bạn
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {totalProjects > 0
                  ? `${totalProjects} dự án · ${totalSlides} trang`
                  : "Bắt đầu tạo dự án đầu tiên"}
              </p>
            </div>
          </div>

          {totalProjects === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50/50 to-white p-12 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-3xl shadow-inner">
                📂
              </div>
              <h3 className="mt-4 font-semibold text-slate-700 text-lg">Chưa có dự án nào</h3>
              <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
                Tạo dự án đầu tiên từ mẫu có sẵn hoặc bắt đầu với trang trắng
              </p>
              <button
                onClick={() => document.querySelector<HTMLInputElement>('input')?.focus()}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" /> Tạo dự án đầu tiên
              </button>
            </div>
          ) : (
            <div className="grid gap-3">
              {projects.map((p) => (
                <div
                  key={p.id}
                  className="group flex items-center justify-between rounded-xl border border-blue-100 bg-white p-4 shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <input
                        defaultValue={p.name}
                        onBlur={(e) => renameProject(p.id, e.target.value || p.name)}
                        className="bg-transparent text-base font-semibold text-slate-800 outline-none border-b border-transparent hover:border-blue-200 focus:border-blue-400 transition-colors"
                      />
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Layout className="h-3 w-3" /> {p.slides.length} trang
                      </span>
                      <span>
                        Cập nhật {new Date(p.updatedAt).toLocaleString("vi-VN")}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      to="/editor/$projectId"
                      params={{ projectId: p.id }}
                      className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                    >
                      ✏️ Sửa
                    </Link>
                    <Link
                      to="/export/$projectId"
                      params={{ projectId: p.id }}
                      className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-100 transition-colors"
                    >
                      <FileDown className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm(`Xóa "${p.name}"?`)) deleteProject(p.id);
                      }}
                      className="rounded-lg border border-red-100 px-3 py-1.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
