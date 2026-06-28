import type { Element } from "@/lib/builder/types";

interface Props {
  element: Element;
}

export function ElementRenderer({ element }: Props) {
  switch (element.type) {
    case "text":
      return (
        <p
          className="h-full w-full overflow-hidden p-1"
          style={{ fontSize: element.fontSize, color: element.color }}
        >
          {element.content}
        </p>
      );

    case "image":
      return (
        <img
          src={element.src}
          alt={element.alt}
          className="h-full w-full rounded object-cover"
          draggable={false}
          // Trình duyệt có hành vi mặc định "kéo ảnh để lưu/copy" trên <img>,
          // việc này can thiệp vào pointerdown/pointermove trước khi React xử
          // lý xong, khiến div cha (lo việc chọn/kéo/resize) không nhận được
          // event đúng cách. Tắt pointer-events trên <img> để mọi tương tác
          // "xuyên qua" thẳng tới div wrapper cha.
          style={{ pointerEvents: "none" }}
        />
      );

    case "button":
      return (
        <div
          className="flex h-full w-full items-center justify-center rounded-md text-sm font-medium"
          style={{ background: element.bg, color: element.color }}
        >
          {element.label}
        </div>
      );

    case "section":
      return (
        <div
          className="h-full w-full rounded-md"
          style={{ background: element.bg }}
        />
      );
  }
}
