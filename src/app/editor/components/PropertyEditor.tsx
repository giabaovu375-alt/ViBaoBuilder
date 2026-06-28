import { useRef } from "react";
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

const MAX_DIMENSION = 800; // cạnh dài tối đa khi lưu local, giữ localStorage gọn

// Đọc file ảnh user chọn, resize xuống MAX_DIMENSION và nén thành base64 JPEG.
// Dùng để lưu NGAY trong lúc thiết kế (nhanh, không cần chờ mạng).
function resizeImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Không đọc được ảnh"));
      img.onload = () => {
        let { width, height } = img;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Không tạo được canvas"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function PropertyEditor({ projectId, slideId, slideBackground, slideName, element, onDelete }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const patch = (p: Partial<Element>) =>
    element && updateElement(projectId, slideId, element.id, p);

  async function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // cho phép chọn lại cùng 1 file lần sau
    if (!file || !element) return;
    try {
      const dataUrl = await resizeImageToBase64(file);
      patch({ src: dataUrl, alt: file.name });
    } catch {
      alert("Không tải được ảnh này, thử ảnh khác nhé.");
    }
  }

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

      {element.type === "text" && (
        <p className="mt-2 text-[11px] text-muted-foreground">
          Bấm 2 lần vào chữ trên trang để sửa nội dung trực tiếp.
        </p>
      )}

      <div className="mt-3 space-y-2">
        {element.type === "text" && (
          <>
            <NumField label="Cỡ chữ" value={element.fontSize} onChange={(v) => patch({ fontSize: v })} />
            <Field label="Màu chữ">
              <input type="color" value={element.color} onChange={(e) => patch({ color: e.target.value })} className="h-8 w-full" />
            </Field>
          </>
        )}

        {element.type === "image" && (
          <Field label="Ảnh">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImagePick}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded border px-2 py-2 text-sm font-medium hover:bg-accent"
            >
              📁 Upload ảnh
            </button>
          </Field>
        )}

        {element.type === "button" && (
          <>
            <Field label="Nhãn nút">
              <input
                key={element.id + "l"}
                defaultValue={element.label}
                onBlur={(e) => patch({ label: e.target.value })}
                className="w-full rounded border px-2 py-1 text-sm"
              />
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

      <p className="mt-4 text-[11px] text-muted-foreground">
        Kéo phần tử để di chuyển. Kéo chấm tròn ở góc để đổi kích thước.
      </p>
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
