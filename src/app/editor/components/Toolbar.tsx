import { addElement } from "@/lib/builder/store";
import type { ElementType } from "@/lib/builder/types";

const TOOLS: { type: ElementType; label: string }[] = [
  { type: "text",    label: "Văn bản" },
  { type: "image",   label: "Hình ảnh" },
  { type: "button",  label: "Nút bấm" },
  { type: "section", label: "Khối nền" },
];

interface Props {
  projectId: string;
  slideId: string;
  onElementAdded: (id: string) => void;
}

export function Toolbar({ projectId, slideId, onElementAdded }: Props) {
  return (
    <aside className="w-48 shrink-0 overflow-y-auto border-r p-3">
      <div className="text-xs font-semibold uppercase text-muted-foreground">
        Thêm phần tử
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {TOOLS.map((t) => (
          <button
            key={t.type}
            onClick={() => {
              const id = addElement(projectId, slideId, t.type);
              onElementAdded(id);
            }}
            className="rounded-md border p-2 text-xs hover:bg-accent"
          >
            + {t.label}
          </button>
        ))}
      </div>
    </aside>
  );
}
