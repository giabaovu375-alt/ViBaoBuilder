import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { createProject, deleteProject, renameProject, useStore } from "@/lib/builder/store";

export function DashboardPage() {
  const projects = useStore((s) => s.projects);
  const [name, setName] = useState("");

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const p = createProject(name.trim() || "Dự án mới");
    setName("");
    window.location.href = `/editor/${p.id}`;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold">🇻🇳 ViBaoBuilder</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tạo website bằng kéo thả. Lưu trên máy.
        </p>

        <form className="mt-6 flex gap-2" onSubmit={handleCreate}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tên dự án..."
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            + Tạo mới
          </button>
        </form>

        <div className="mt-8 grid gap-3">
          {projects.length === 0 && (
            <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
              Chưa có dự án nào. Tạo cái đầu tiên đi!
            </div>
          )}
          {projects.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-md border p-4">
              <div>
                <input
                  defaultValue={p.name}
                  onBlur={(e) => renameProject(p.id, e.target.value || p.name)}
                  className="bg-transparent text-base font-medium outline-none"
                />
                <div className="text-xs text-muted-foreground">
                  {p.slides.length} trang · cập nhật{" "}
                  {new Date(p.updatedAt).toLocaleString("vi-VN")}
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  to="/editor/$projectId"
                  params={{ projectId: p.id }}
                  className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
                >
                  Chỉnh sửa
                </Link>
                <Link
                  to="/export/$projectId"
                  params={{ projectId: p.id }}
                  className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
                >
                  Xuất file
                </Link>
                <button
                  onClick={() => { if (confirm(`Xóa "${p.name}"?`)) deleteProject(p.id); }}
                  className="rounded-md border px-3 py-1.5 text-sm text-destructive hover:bg-accent"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
