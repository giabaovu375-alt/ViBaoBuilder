import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  createProject,
  deleteProject,
  renameProject,
  useStore,
} from "@/lib/builder/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Slide Builder — Dashboard" },
      { name: "description", content: "Build slide-based websites." },
    ],
  }),
  component: Index,
});

function Index() {
  const projects = useStore((s) => s.projects);
  const [name, setName] = useState("");

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold">Projects</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Slide-based website builder. Saved locally.
        </p>

        <form
          className="mt-6 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const p = createProject(name.trim() || "Untitled Project");
            setName("");
            window.location.href = `/editor/${p.id}`;
          }}
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name"
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            New project
          </button>
        </form>

        <div className="mt-8 grid gap-3">
          {projects.length === 0 && (
            <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
              No projects yet.
            </div>
          )}
          {projects.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-md border p-4"
            >
              <div>
                <input
                  defaultValue={p.name}
                  onBlur={(e) => renameProject(p.id, e.target.value || p.name)}
                  className="bg-transparent text-base font-medium outline-none"
                />
                <div className="text-xs text-muted-foreground">
                  {p.slides.length} slide{p.slides.length === 1 ? "" : "s"} · updated{" "}
                  {new Date(p.updatedAt).toLocaleString()}
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  to="/editor/$projectId"
                  params={{ projectId: p.id }}
                  className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
                >
                  Edit
                </Link>
                <Link
                  to="/export/$projectId"
                  params={{ projectId: p.id }}
                  className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
                >
                  Export
                </Link>
                <button
                  onClick={() => {
                    if (confirm(`Delete "${p.name}"?`)) deleteProject(p.id);
                  }}
                  className="rounded-md border px-3 py-1.5 text-sm text-destructive hover:bg-accent"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
