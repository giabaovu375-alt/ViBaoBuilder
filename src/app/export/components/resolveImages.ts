import type { Element, Project, Slide } from "@/lib/builder/types";

/* ============================================================================
 * Trước khi xuất file, ảnh đang lưu base64 (để sửa nhanh trong lúc thiết kế)
 * cần được tải lên HuggingFace qua Worker trung gian, đổi `src` thành URL thật.
 * Mục đích: file HTML/JSON xuất ra nhẹ, không nhúng base64 nặng vào trong đó.
 * ========================================================================== */

const UPLOAD_PROXY_URL = "https://proxy-token.giabaovu375.workers.dev/";

function isBase64Image(src: string): boolean {
  return src.startsWith("data:image/");
}

async function uploadBase64(dataUrl: string, filename: string): Promise<string> {
  const res = await fetch(UPLOAD_PROXY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename, dataUrl }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.url) {
    throw new Error(data?.error || `Upload ảnh lỗi (${res.status})`);
  }
  return data.url as string;
}

export interface ResolveResult {
  project: Project; // bản project đã thay src base64 -> URL thật
  uploadedCount: number;
  failedCount: number;
}

/**
 * Quét toàn bộ slide/element trong project, với mỗi ảnh đang là base64:
 * upload lên HuggingFace, thay `src` bằng URL trả về. Ảnh đã là URL thật
 * (http/https) thì giữ nguyên, không upload lại.
 *
 * Nếu 1 ảnh upload lỗi (mất mạng, worker lỗi...), giữ nguyên base64 cho ảnh
 * đó (không làm hỏng cả export) và đếm vào failedCount để UI báo cho người dùng.
 */
export async function resolveImagesForExport(project: Project): Promise<ResolveResult> {
  let uploadedCount = 0;
  let failedCount = 0;

  const resolvedSlides: Slide[] = await Promise.all(
    project.slides.map(async (slide) => {
      const resolvedElements: Element[] = await Promise.all(
        slide.elements.map(async (el) => {
          if (el.type !== "image" || !isBase64Image(el.src)) {
            return el;
          }
          try {
            const filename = (el.alt || "image").replace(/[^a-zA-Z0-9._-]/g, "_") + ".jpg";
            const hostedUrl = await uploadBase64(el.src, filename);
            uploadedCount++;
            return { ...el, src: hostedUrl };
          } catch {
            failedCount++;
            return el; // giữ base64 cũ nếu upload thất bại
          }
        }),
      );
      return { ...slide, elements: resolvedElements };
    }),
  );

  return {
    project: { ...project, slides: resolvedSlides },
    uploadedCount,
    failedCount,
  };
}

/** True nếu project còn ít nhất 1 ảnh base64 chưa được upload lên hosting thật. */
export function hasUnresolvedImages(project: Project): boolean {
  return project.slides.some((s) => s.elements.some((el) => el.type === "image" && isBase64Image(el.src)));
}
