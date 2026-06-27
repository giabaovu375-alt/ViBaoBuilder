import { addElement } from "@/lib/builder/store";
import type { ElementType } from "@/lib/builder/types";
import { Type, Image, MousePointerClick, Square } from "lucide-react";

const TOOLS: { type: ElementType; label: string; hint: string; icon: typeof Type }[] = [
  { type: "text", label: "Văn bản", hint: "Tiêu đề, đoạn văn", icon: Type },
  { type: "image", label: "Hình ảnh", hint: "Ảnh, logo", icon: Image },
  { type: "button", label: "Nút bấm", hint: "Hành động, liên kết", icon: MousePointerClick },
  { type: "section", label: "Khối nền", hint: "Vùng chứa, nền màu", icon: Square },
];

interface Props {
  projectId: string;
  slideId: string;
  onElementAdded: (id: string) => void;
}

export function Toolbar({ projectId, slideId, onElementAdded }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {TOOLS.map((t) => {
        const Icon = t.icon;
        return (
          <button
            key={t.type}
            onClick={() => {
              const id = addElement(projectId, slideId, t.type);
              onElementAdded(id);
            }}
            className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-left transition-all active:scale-[0.97] active:bg-slate-50 hover:border-indigo-300 hover:shadow-sm"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
              <Icon size={18} strokeWidth={2.25} />
            </span>
            <span className="flex flex-col">
              <span className="text-[13px] font-semibold text-slate-800">{t.label}</span>
              <span className="text-[11px] leading-tight text-slate-400">{t.hint}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
