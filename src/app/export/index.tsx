import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useStore } from "@/lib/builder/store";
import { SlideView } from "@/lib/builder/render";
import type { Element, Project } from "@/lib/builder/types";

interface Props { projectId: string }

export function ExportPage({ projectId }: Props) {
  const project = useStore((s) => s.projects.find((p) => p.id === projectId));
  const [tab, setTab] = useState<"preview" | "json" | "html">("preview");
  const json = useMemo(() => (project ? JSON.stringify(project, null, 2) : ""), [project]);
  const html = useMemo(() => (project ? buildHtml(project) : ""), [project]);

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Link to="/" className="text-sm underline">Không tìm thấy dự án — về trang chủ</Link>
      </div>
    );
  }

  function download(filename: string, content: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-sm text-muted-foreground hover:underline">← Trang chủ</Link>
          <span className="text-sm font-semibold">{project.name} — Xuất file</span>
        </div>
        <div className="flex gap-2">
          <Link
            to="/editor/$projectId"
            params={{ projectId: project.id }}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
          >
            Chỉnh sửa
          </Link>
          <button
            onClick={() => download(`${project.name}.json`, json, "application/json")}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
          >
            Tải JSON
          </button>
          <button
            onClick={() => download(`${project.name}.html`, html, "text/html")}
            className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
          >
            Tải HTML
          </button>
        </div>
      </header>

      <div className="border-b px-4">
        <nav className="flex gap-4 text-sm">
          {(["preview", "html", "json"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`border-b-2 py-2 ${tab === t ? "border-primary" : "border-transparent text-muted-foreground"}`}
            >
              {t === "preview" ? "Xem trước" : t.toUpperCase()}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {tab === "preview" && (
          <div className="space-y-8">
            {project.slides.map((s, i) => (
              <div key={s.id}>
                <div className="mb-2 text-xs text-muted-foreground">Trang {i + 1} — {s.name}</div>
                <div className="inline-block border shadow-sm"><SlideView slide={s} /></div>
              </div>
            ))}
          </div>
        )}
        {tab === "json" && <pre className="overflow-auto rounded-md border bg-muted/50 p-4 text-xs">{json}</pre>}
        {tab === "html" && <pre className="overflow-auto rounded-md border bg-muted/50 p-4 text-xs">{html}</pre>}
      </div>
    </div>
  );
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function elHtml(el: Element): string {
  const base = `position:absolute;left:${el.x}px;top:${el.y}px;width:${el.width}px;height:${el.height}px;`;
  switch (el.type) {
    case "text": return `<div style="${base}font-size:${el.fontSize}px;color:${el.color};">${esc(el.content)}</div>`;
    case "image": return `<img src="${esc(el.src)}" alt="${esc(el.alt)}" style="${base}object-fit:cover;" />`;
    case "button": return `<a href="${esc(el.href)}" style="${base}display:inline-flex;align-items:center;justify-content:center;background:${el.bg};color:${el.color};border-radius:6px;text-decoration:none;font-weight:500;">${esc(el.label)}</a>`;
    case "section": return `<div style="${base}background:${el.bg};border-radius:8px;"></div>`;
  }
}

function buildHtml(project: Project): string {
  const slides = project.slides.map((s) =>
    `<section style="position:relative;width:960px;height:540px;background:${s.background};margin:0 auto 24px;overflow:hidden;">${s.elements.map(elHtml).join("")}</section>`
  ).join("\n");
  return `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${esc(project.name)}</title>
<style>body{margin:0;background:#f3f4f6;font-family:system-ui,sans-serif;padding:24px 0;}</style>
</head>
<body>${slides}</body>
</html>`;
                                 }
