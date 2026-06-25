import type { Element, Slide } from "./types";

export function ElementView({ element }: { element: Element }) {
  const style: React.CSSProperties = {
    position: "absolute",
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
  };
  switch (element.type) {
    case "text":
      return (
        <div style={{ ...style, fontSize: element.fontSize, color: element.color }}>
          {element.content}
        </div>
      );
    case "image":
      return (
        <img
          src={element.src}
          alt={element.alt}
          style={{ ...style, objectFit: "cover" }}
        />
      );
    case "button":
      return (
        <a
          href={element.href}
          style={{
            ...style,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: element.bg,
            color: element.color,
            borderRadius: 6,
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          {element.label}
        </a>
      );
    case "section":
      return <div style={{ ...style, background: element.bg, borderRadius: 8 }} />;
  }
}

export function SlideView({ slide }: { slide: Slide }) {
  return (
    <div
      style={{
        position: "relative",
        width: 960,
        height: 540,
        background: slide.background,
        overflow: "hidden",
      }}
    >
      {slide.elements.map((el) => (
        <ElementView key={el.id} element={el} />
      ))}
    </div>
  );
}