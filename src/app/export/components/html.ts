import type { Element, Project, Slide } from "@/lib/builder/types";

/* ============================================================================
 * Build file HTML hoàn chỉnh từ 1 Project — tách riêng khỏi UI để dễ test
 * và để ExportPage không phải lo phần dựng chuỗi HTML.
 * ========================================================================== */

const SLIDE_WIDTH = 960;
const SLIDE_HEIGHT = 540;

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function elToHtml(el: Element): string {
  // Dùng % thay vì px tuyệt đối — vì .vb-slide co giãn responsive (max-width: 100%),
  // toạ độ px cố định sẽ lệch vị trí khi slide bị scale nhỏ hơn kích thước gốc.
  const left = (el.x / SLIDE_WIDTH) * 100;
  const top = (el.y / SLIDE_HEIGHT) * 100;
  const width = (el.width / SLIDE_WIDTH) * 100;
  const height = (el.height / SLIDE_HEIGHT) * 100;
  const base = `position:absolute;left:${left}%;top:${top}%;width:${width}%;height:${height}%;`;

  switch (el.type) {
    case "text":
      // Giữ font-size theo px gốc — vì khung text đã scale theo % (width/height),
      // chữ tự nhiên tràn/co theo khung khi nội dung dài, không cần ép theo viewport.
      return `<div style="${base}font-size:${el.fontSize}px;color:${esc(el.color)};line-height:1.4;overflow:hidden;">${esc(el.content)}</div>`;

    case "image":
      return `<img src="${esc(el.src)}" alt="${esc(el.alt)}" style="${base}object-fit:cover;border-radius:4px;" loading="lazy" />`;

    case "button":
      return `<a href="${esc(el.href)}" style="${base}display:inline-flex;align-items:center;justify-content:center;background:${esc(el.bg)};color:${esc(el.color)};border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">${esc(el.label)}</a>`;

    case "section":
      return `<div style="${base}background:${esc(el.bg)};border-radius:8px;"></div>`;
  }
}

function slideToHtml(slide: Slide, index: number): string {
  const elementsHtml = slide.elements.map(elToHtml).join("\n      ");
  return `    <section
      class="vb-slide"
      data-slide-index="${index}"
      style="background:${esc(slide.background)};"
      aria-label="${esc(slide.name)}"
    >
      ${elementsHtml}
    </section>`;
}

/**
 * Tạo file HTML hoàn chỉnh, tự đứng độc lập (không phụ thuộc React/Tailwind),
 * mỗi slide là 1 <section> co giãn theo màn hình nhưng giữ đúng tỉ lệ gốc.
 */
export function buildHtml(project: Project): string {
  const slidesHtml = project.slides.map(slideToHtml).join("\n\n");

  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(project.name)}</title>
  <style>
    :root {
      --slide-w: ${SLIDE_WIDTH};
      --slide-h: ${SLIDE_HEIGHT};
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: #eef1f6;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      padding: 32px 16px;
    }
    .vb-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 24px;
    }
    .vb-slide {
      position: relative;
      width: 100%;
      max-width: ${SLIDE_WIDTH}px;
      aspect-ratio: ${SLIDE_WIDTH} / ${SLIDE_HEIGHT};
      overflow: hidden;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06);
    }
    /* Phần tử bên trong định vị theo px gốc (960x540) — scale toàn bộ section
       theo container thật để khớp tỉ lệ trên mọi kích thước màn hình. */
    .vb-slide > * {
      position: absolute;
    }
    @media (max-width: 640px) {
      body { padding: 16px 8px; }
    }
  </style>
</head>
<body>
  <div class="vb-wrap">
${slidesHtml}
  </div>
</body>
</html>
`;
}
