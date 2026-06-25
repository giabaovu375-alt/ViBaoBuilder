import { updateElement, updateSlide } from "@/lib/builder/store";
import type { Element } from "@/lib/builder/types";

interface Props {
  projectId: string;
  slideId: string;
  slideBackground: string;
  slideName: string;
  element: Element | null;
  onDelete: () => void;
}

export function PropertyEditor({ projectId, slideId, slideBackground, slideName, element, onDelete }: Props) {
  const patch = (p: Partial<Element>) =>
    element && updateElement(projectId, slideId, element.id, p);

  if (!element) {
    return (
      <div>
        <div className="text-xs font-semibold uppercase text-muted-foreground">Trang</div>
        <div className="mt-2 space-y-2">
          <Field label="Tên trang">
            <input
              key={slideId + "name"}
              defaultValue={slideName}
              onBlur={(e) =>
                updateSlide(projectId, slideId, (s) => ({ ...s, name: e.target.value || s.name }))
              }
              className="w-full rounded border px-2 py-1 text-sm"
            />
          </Field>
          <Field label="Màu nền">
            <input
              type="color"
              value={slideBackground}
              onChange={(e) =>
                updateSlide(projectId, slideId, (s) => ({ ...s, background: e.target.value }))
              }
              className="h-8 w-full"
            />
          </Field>
          <p className="pt-2 text-xs text-muted-foreground">Chọn phần tử để chỉnh sửa.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase text-muted-foreground">{element.type}</div>
        <button onClick={onDelete} className="text-xs text-destructive underline">Xóa</button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <NumField label="X" value={element.x} onChange={(v) => patch({ x: v })} />
        <NumField label="Y" value={element.y} onChange={(v) => patch({ y: v })} />
        <NumField label="Rộng" value={element.width} onChange={(v) => patch({ width: v })} />
        <NumField label="Cao" value={element.height} onChange={(v) => patch({ height: v })} />
      </div>

      <div className="mt-4 space-y-2">
        {element.type === "text" && (
          <>
            <Field label="Nội dung">
              <textarea
                key={element.id + "c"}
                defaultValue={element.content}
                onBlur={(e) => patch({ content: e.target.value })}
                className="w-full rounded border px-2 py-1 text-sm"
                rows={3}
              />
            </Field>
            <NumField label="Cỡ chữ" value={element.fontSize} onChange={(v) => patch({ fontSize: v })} />
            <Field label="Màu chữ">
              <input type="color" value={element.color} onChange={(e) => patch({ color: e.target.value })} className="h-8 w-full" />
            </Field>
          </>
        )}
        {element.type === "image" && (
          <>
            <Field label="URL ảnh">
              <input key={element.id + "s"} defaultValue={element.src} onBlur={(e) => patch({ src: e.target.value })} className="w-full rounded border px-2 py-1 text-sm" />
            </Field>
            <Field label="Mô tả (alt)">
              <input key={element.id + "a"} defaultValue={element.alt} onBlur={(e) => patch({ alt: e.target.value })} className="w-full rounded border px-2 py-1 text-sm" />
            </Field>
          </>
        )}
        {element.type === "button" && (
          <>
            <Field label="Nhãn nút">
              <input key={element.id + "l"} defaultValue={element.label} onBlur={(e) => patch({ label: e.target.value })} className="w-full rounded border px-2 py-1 text-sm" />
            </Field>
            <Field label="Link (href)">
              <input key={element.id + "h"} defaultValue={element.href} onBlur={(e) => patch({ href: e.target.value })} className="w-full rounded border px-2 py-1 text-sm" />
            </Field>
            <Field label="Màu nền">
              <input type="color" value={element.bg} onChange={(e) => patch({ bg: e.target.value })} className="h-8 w-full" />
            </Field>
            <Field label="Màu chữ">
              <input type="color" value={element.color} onChange={(e) => patch({ color: e.target.value })} className="h-8 w-full" />
            </Field>
          </>
        )}
        {element.type === "section" && (
          <Field label="Màu nền khối">
            <input type="color" value={element.bg} onChange={(e) => patch({ bg: e.target.value })} className="h-8 w-full" />
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

function NumField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
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
