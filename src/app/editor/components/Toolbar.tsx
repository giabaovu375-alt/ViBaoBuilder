import { useState } from "react";
import { Type, Image, MousePointerClick, Square, FileText, Settings2, Plus } from "lucide-react";

/**
 * ---- Giả lập API gốc của bro để demo chạy độc lập ----
 * Trong project thật, xoá phần này và dùng lại:
 *   import { addElement } from "@/lib/builder/store";
 *   import type { ElementType } from "@/lib/builder/types";
 */
function addElement(projectId, slideId, type) {
  return `${type}-${Math.random().toString(36).slice(2, 7)}`;
}

const TOOLS = [
  { type: "text", label: "Văn bản", hint: "Tiêu đề, đoạn văn", icon: Type },
  { type: "image", label: "Hình ảnh", hint: "Ảnh, logo", icon: Image },
  { type: "button", label: "Nút bấm", hint: "Hành động, liên kết", icon: MousePointerClick },
  { type: "section", label: "Khối nền", hint: "Vùng chứa, nền màu", icon: Square },
];

function Toolbar({ projectId, slideId, onElementAdded }) {
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

/** ---- Demo shell: mô phỏng builder mobile để thấy Toolbar trong ngữ cảnh ---- */
export default function BuilderDemo() {
  const [tab, setTab] = useState("add");
  const [elements, setElements] = useState([]);
  const [toast, setToast] = useState(null);

  function handleAdded(id) {
    setElements((prev) => [...prev, id]);
    setToast(`Đã thêm: ${id}`);
    setTimeout(() => setToast(null), 1500);
  }

  return (
    <div className="flex h-[700px] w-full max-w-sm flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50 font-sans shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between bg-indigo-700 px-4 py-3 text-white">
        <div className="flex items-center gap-3">
          <button className="text-lg">←</button>
          <div>
            <div className="text-[15px] font-bold leading-tight">Dự án mới</div>
            <div className="text-[11px] text-indigo-200">Trang 1 / 1</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[12px] text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Đã lưu
          </span>
          <button className="rounded-lg bg-amber-400 px-3 py-1.5 text-[12px] font-bold text-indigo-950">
            ↓ Xuất file
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative flex-1 overflow-y-auto bg-slate-100 p-4">
        <div className="mx-auto flex min-h-[280px] w-full max-w-[260px] flex-col gap-2 rounded-lg bg-white p-3 shadow-sm">
          {elements.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-1 py-16 text-center">
              <span className="text-[12px] font-medium text-slate-400">Trang trống</span>
              <span className="text-[11px] text-slate-300">Bấm "Thêm" để tạo phần tử đầu tiên</span>
            </div>
          ) : (
            elements.map((id) => (
              <div key={id} className="rounded-md border border-dashed border-indigo-200 bg-indigo-50/60 px-2 py-1.5 text-[11px] text-indigo-500">
                {id}
              </div>
            ))
          )}
        </div>

        {toast && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-slate-900/90 px-4 py-1.5 text-[11px] font-medium text-white shadow-lg">
            {toast}
          </div>
        )}
      </div>

      {/* Sliding panel (chỉ hiện khi tab = add) */}
      <div
        className={`overflow-hidden border-t border-slate-200 bg-white transition-all duration-300 ease-out ${
          tab === "add" ? "max-h-64" : "max-h-0"
        }`}
      >
        <div className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
              Thêm phần tử
            </span>
            <span className="text-[11px] text-slate-300">{TOOLS.length} loại</span>
          </div>
          <Toolbar projectId="demo" slideId="s1" onElementAdded={handleAdded} />
        </div>
      </div>

      {/* Bottom nav */}
      <div className="flex border-t border-slate-200 bg-white">
        {[
          { key: "add", label: "Thêm", icon: Plus },
          { key: "page", label: "Trang", icon: FileText },
          { key: "settings", label: "Cài đặt", icon: Settings2 },
        ].map((item) => {
          const Icon = item.icon;
          const active = tab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setTab(active ? null : item.key)}
              className="flex flex-1 flex-col items-center gap-1 py-2.5"
            >
              <Icon size={20} strokeWidth={2.25} className={active ? "text-indigo-600" : "text-slate-400"} />
              <span className={`text-[11px] font-semibold ${active ? "text-indigo-600" : "text-slate-400"}`}>
                {item.label}
              </span>
              {active && <span className="absolute -mt-[1px] h-0.5 w-10 rounded-full bg-indigo-600" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
