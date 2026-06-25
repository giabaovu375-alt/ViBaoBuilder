import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useStore } from "@/lib/builder/store";
import { Canvas } from "./components/Canvas";
import { Toolbar } from "./components/Toolbar";
import { PageList } from "./components/PageList";
import { PropertyEditor } from "./components/PropertyEditor";
import { deleteElement } from "@/lib/builder/store";

interface Props { projectId: string }

export function EditorPage({ projectId }: Props) {
  const project = useStore((s) => s.projects.find((p) => p.id === projectId));
  const [slideIdx, setSlideIdx] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Không tìm thấy dự án.</p>
          <Link to="/" className="mt-2 inline-block text-sm underline">Về trang chủ</Link>
        </div>
      </div>
    );
  }

  const slide = project.slides[Math.min(slideIdx, project.slides.length - 1)];
  const selected = slide.elements.find((e) => e.id === selectedId) ?? null;

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-sm text-muted-foreground hover:underline">← Trang chủ</Link>
          <span className="text-sm font-semibold">{project.name}</span>
        </div>
        <Link
          to="/export/$projectId"
          params={{ projectId: project.id }}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
        >
          Xuất file
        </Link>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-48 shrink-0 overflow-y-auto border-r p-3">
          <Toolbar
            projectId={project.id}
            slideId={slide.id}
            onElementAdded={(id) => setSelectedId(id)}
          />
          <PageList
            projectId={project.id}
            slides={project.slides}
            slideIdx={slideIdx}
            onSelect={(i) => { setSlideIdx(i); setSelectedId(null); }}
          />
        </aside>

        <Canvas
          projectId={project.id}
          slideId={slide.id}
          elements={slide.elements}
          background={slide.background}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />

        <aside className="w-72 shrink-0 overflow-y-auto border-l p-3">
          <PropertyEditor
            projectId={project.id}
            slideId={slide.id}
            slideBackground={slide.background}
            slideName={slide.name}
            element={selected}
            onDelete={() => {
              if (selected) {
                deleteElement(project.id, slide.id, selected.id);
                setSelectedId(null);
              }
            }}
          />
        </aside>
      </div>
    </div>
  );
          }
