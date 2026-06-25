import { addSlide, deleteSlide } from "@/lib/builder/store";
import type { Slide } from "@/lib/builder/types";

interface Props {
  projectId: string;
  slides: Slide[];
  slideIdx: number;
  onSelect: (idx: number) => void;
}

export function PageList({ projectId, slides, slideIdx, onSelect }: Props) {
  return (
    <>
      <div className="mt-6 flex items-center justify-between">
        <div className="text-xs font-semibold uppercase text-muted-foreground">Trang</div>
        <button onClick={() => addSlide(projectId)} className="text-xs underline">
          + Thêm
        </button>
      </div>
      <ul className="mt-2 space-y-1">
        {slides.map((s, i) => (
          <li key={s.id} className="flex items-center gap-1">
            <button
              onClick={() => onSelect(i)}
              className={`flex-1 truncate rounded-md border px-2 py-1.5 text-left text-xs ${
                i === slideIdx ? "border-primary bg-accent" : ""
              }`}
            >
              {i + 1}. {s.name}
            </button>
            {slides.length > 1 && (
              <button
                onClick={() => deleteSlide(projectId, s.id)}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                ×
              </button>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
