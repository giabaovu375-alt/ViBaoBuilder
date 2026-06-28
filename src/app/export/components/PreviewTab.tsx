import { SlideView } from "@/lib/builder/render";
import type { Project } from "@/lib/builder/types";

interface Props {
  project: Project;
}

export function PreviewTab({ project }: Props) {
  return (
    <div className="space-y-8">
      {project.slides.map((s, i) => (
        <div key={s.id}>
          <div className="mb-2 text-xs text-muted-foreground">
            Trang {i + 1} — {s.name}
          </div>
          <div className="inline-block border shadow-sm">
            <SlideView slide={s} />
          </div>
        </div>
      ))}
    </div>
  );
}
