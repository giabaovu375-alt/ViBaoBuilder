import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useRef, useState } from "react";
import {
  addElement,
  addSlide,
  deleteElement,
  deleteSlide,
  updateElement,
  updateSlide,
  useStore,
} from "@/lib/builder/store";
import type { Element, ElementType } from "@/lib/builder/types";
import { ElementView } from "@/lib/builder/render";

export const Route = createFileRoute("/editor/$projectId")({
  head: () => ({ meta: [{ title: "Editor — Slide Builder" }] }),
  component: Editor,
});

const ELEMENT_TYPES: { type: ElementType; label: string }[] = [
  { type: "text", label: "Text" },
  { type: "image", label: "Image" },
  { type: "button", label: "Button" },
  { type: "section", label: "Section" },
];

function Editor() {
  const { projectId } = useParams({ from: "/editor/$projectId" });
  const project = useStore((s) => s.projects.find((p) => p.id === projectId));
  const [slideIdx, setSlideIdx] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Project not found.</p>
          <Link to="/" className="mt-2 inline-block text-sm underline">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const slide = project.slides[Math.min(slideIdx, project.slides.length - 1)];
  const selected = slide.elements.find((e) => e.id === selectedId) ?? null;

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-sm text-muted-foreground hover:underline">
            ← Projects
          </Link>
          <span className="text-sm font-semibold">{project.name}</span>
        </div>
        <Link
          to="/export/$projectId"
          params={{ projectId: project.id }}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
        >
          Export
        </Link>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: library + slides */}
        <aside className="w-56 shrink-0 overflow-y-auto border-r p-3">
          <div className="text-xs font-semibold uppercase text-muted-foreground">
            Add element
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {ELEMENT_TYPES.map((t) => (
              <button
                key={t.type}
                onClick={() => {
                  const id = addElement(project.id, slide.id, t.type);
                  setSelectedId(id);
                }}
                className="rounded-md border p-2 text-xs hover:bg-accent"
              >
                + {t.label}
              </button>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="text-xs font-semibold uppercase text-muted-foreground">
              Slides
            </div>
            <button
              onClick={() => addSlide(project.id)}
              className="text-xs underline"
            >
              + Add
            </button>
          </div>
          <ul className="mt-2 space-y-1">
            {project.slides.map((s, i) => (
              <li key={s.id} className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setSlideIdx(i);
                    setSelectedId(null);
                  }}
                  className={`flex-1 truncate rounded-md border px-2 py-1.5 text-left text-xs ${
                    i === slideIdx ? "border-primary bg-accent" : ""
                  }`}
                >
                  {i + 1}. {s.name}
                </button>
                {project.slides.length > 1 && (
                  <button
                    onClick={() => deleteSlide(project.id, s.id)}
                    className="text-xs text-muted-foreground hover:text-destructive"
                    aria-label="Delete slide"
                  >
                    ×
                  </button>
                )}
              </li>
            ))}
          </ul>
        </aside>

        {/* Center: canvas */}
        <main
          className="flex flex-1 items-center justify-center overflow-auto bg-muted/40 p-6"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelectedId(null);
          }}
        >
          <Canvas
            projectId={project.id}
            slideId={slide.id}
            elements={slide.elements}
            background={slide.background}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </main>

        {/* Right: property editor */}
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

function Canvas({
  projectId,
  slideId,
  elements,
  background,
  selectedId,
  onSelect,
}: {
  projectId: string;
  slideId: string;
  elements: Element[];
  background: string;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null);

  function onMouseDown(e: React.MouseEvent, el: Element) {
    e.stopPropagation();
    onSelect(el.id);
    const rect = ref.current!.getBoundingClientRect();
    drag.current = {
      id: el.id,
      dx: e.clientX - rect.left - el.x,
      dy: e.clientY - rect.top - el.y,
    };
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!drag.current || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = Math.max(0, e.clientX - rect.left - drag.current.dx);
    const y = Math.max(0, e.clientY - rect.top - drag.current.dy);
    updateElement(projectId, slideId, drag.current.id, { x, y });
  }

  function endDrag() {
    drag.current = null;
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseUp={endDrag}
      onMouseLeave={endDrag}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onSelect(null);
      }}
      className="relative shadow-lg"
      style={{ width: 960, height: 540, background }}
    >
      {elements.map((el) => (
        <div
          key={el.id}
          onMouseDown={(e) => onMouseDown(e, el)}
          style={{
            position: "absolute",
            left: el.x,
            top: el.y,
            width: el.width,
            height: el.height,
            outline:
              selectedId === el.id ? "2px solid #3b82f6" : "1px dashed transparent",
            cursor: "move",
          }}
          className="hover:outline-blue-300"
        >
          <div className="pointer-events-none absolute inset-0">
            <ElementView
              element={{ ...el, x: 0, y: 0 } as Element}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function PropertyEditor({
  projectId,
  slideId,
  slideBackground,
  slideName,
  element,
  onDelete,
}: {
  projectId: string;
  slideId: string;
  slideBackground: string;
  slideName: string;
  element: Element | null;
  onDelete: () => void;
}) {
  if (!element) {
    return (
      <div>
        <div className="text-xs font-semibold uppercase text-muted-foreground">
          Slide
        </div>
        <div className="mt-2 space-y-2">
          <Field label="Name">
            <input
              key={slideId + "name"}
              defaultValue={slideName}
              onBlur={(e) =>
                updateSlide(projectId, slideId, (s) => ({
                  ...s,
                  name: e.target.value || s.name,
                }))
              }
              className="w-full rounded border px-2 py-1 text-sm"
            />
          </Field>
          <Field label="Background">
            <input
              type="color"
              value={slideBackground}
              onChange={(e) =>
                updateSlide(projectId, slideId, (s) => ({
                  ...s,
                  background: e.target.value,
                }))
              }
              className="h-8 w-full"
            />
          </Field>
          <p className="pt-2 text-xs text-muted-foreground">
            Select an element to edit its properties.
          </p>
        </div>
      </div>
    );
  }

  const patch = (p: Partial<Element>) =>
    updateElement(projectId, slideId, element.id, p);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase text-muted-foreground">
          {element.type}
        </div>
        <button onClick={onDelete} className="text-xs text-destructive underline">
          Delete
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <NumField label="X" value={element.x} onChange={(v) => patch({ x: v })} />
        <NumField label="Y" value={element.y} onChange={(v) => patch({ y: v })} />
        <NumField
          label="W"
          value={element.width}
          onChange={(v) => patch({ width: v })}
        />
        <NumField
          label="H"
          value={element.height}
          onChange={(v) => patch({ height: v })}
        />
      </div>

      <div className="mt-4 space-y-2">
        {element.type === "text" && (
          <>
            <Field label="Content">
              <textarea
                key={element.id + "c"}
                defaultValue={element.content}
                onBlur={(e) => patch({ content: e.target.value })}
                className="w-full rounded border px-2 py-1 text-sm"
                rows={3}
              />
            </Field>
            <NumField
              label="Font size"
              value={element.fontSize}
              onChange={(v) => patch({ fontSize: v })}
            />
            <Field label="Color">
              <input
                type="color"
                value={element.color}
                onChange={(e) => patch({ color: e.target.value })}
                className="h-8 w-full"
              />
            </Field>
          </>
        )}
        {element.type === "image" && (
          <>
            <Field label="Source URL">
              <input
                key={element.id + "s"}
                defaultValue={element.src}
                onBlur={(e) => patch({ src: e.target.value })}
                className="w-full rounded border px-2 py-1 text-sm"
              />
            </Field>
            <Field label="Alt">
              <input
                key={element.id + "a"}
                defaultValue={element.alt}
                onBlur={(e) => patch({ alt: e.target.value })}
                className="w-full rounded border px-2 py-1 text-sm"
              />
            </Field>
          </>
        )}
        {element.type === "button" && (
          <>
            <Field label="Label">
              <input
                key={element.id + "l"}
                defaultValue={element.label}
                onBlur={(e) => patch({ label: e.target.value })}
                className="w-full rounded border px-2 py-1 text-sm"
              />
            </Field>
            <Field label="Link (href)">
              <input
                key={element.id + "h"}
                defaultValue={element.href}
                onBlur={(e) => patch({ href: e.target.value })}
                className="w-full rounded border px-2 py-1 text-sm"
              />
            </Field>
            <Field label="Background">
              <input
                type="color"
                value={element.bg}
                onChange={(e) => patch({ bg: e.target.value })}
                className="h-8 w-full"
              />
            </Field>
            <Field label="Text color">
              <input
                type="color"
                value={element.color}
                onChange={(e) => patch({ color: e.target.value })}
                className="h-8 w-full"
              />
            </Field>
          </>
        )}
        {element.type === "section" && (
          <Field label="Background">
            <input
              type="color"
              value={element.bg}
              onChange={(e) => patch({ bg: e.target.value })}
              className="h-8 w-full"
            />
          </Field>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <Field label={label}>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-full rounded border px-2 py-1 text-sm"
      />
    </Field>
  );
}