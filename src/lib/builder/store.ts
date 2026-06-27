import { useSyncExternalStore } from "react";
import type { Element, ElementType, Project, Slide } from "./types";

const STORAGE_KEY = "slide-builder:projects";

type State = { projects: Project[] };

const listeners = new Set<() => void>();
let state: State = { projects: [] };
let hydrated = false;

function load(): State {
  if (typeof window === "undefined") return { projects: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { projects: [] };
    return JSON.parse(raw) as State;
  } catch {
    return { projects: [] };
  }
}

// Hydrate từ localStorage ngay khi có người dùng đầu tiên (client-side),
// thay vì chỉ lúc module load (lúc đó SSR có thể chưa có window, hoặc
// thứ tự load module khiến state cũ không được nhận diện cho tới khi reload).
function ensureHydrated() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  state = load();
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function setState(updater: (s: State) => State) {
  state = updater(state);
  persist();
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  // Lần subscribe đầu tiên (component mount trên client) sẽ hydrate state
  // thật từ localStorage rồi báo cho subscriber re-render ngay, không cần F5.
  if (!hydrated) {
    ensureHydrated();
    cb();
  }
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return state;
}

function getServerSnapshot(): State {
  return { projects: [] };
}

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(getSnapshot()),
    () => selector(getServerSnapshot()),
  );
}

const uid = () => Math.random().toString(36).slice(2, 10);

function makeSlide(name = "Slide 1"): Slide {
  return { id: uid(), name, background: "#ffffff", elements: [] };
}

export type TemplateKey = "blank" | "landing" | "portfolio" | "shop" | "event";

// Mỗi mẫu trả về 1 Slide khởi tạo sẵn (màu nền + vài element mở đầu),
// thay vì luôn trắng trơn như makeSlide().
function makeSlideFromTemplate(key: TemplateKey): Slide {
  const base = (background: string) => ({
    id: uid(),
    name: "Slide 1",
    background,
    elements: [] as Element[],
  });

  switch (key) {
    case "landing": {
      const slide = base("#0A2463");
      slide.elements = [
        {
          id: uid(),
          type: "text",
          x: 60,
          y: 60,
          width: 600,
          height: 70,
          content: "Tiêu đề sản phẩm của bạn",
          fontSize: 32,
          color: "#ffffff",
        },
        {
          id: uid(),
          type: "text",
          x: 60,
          y: 140,
          width: 520,
          height: 40,
          content: "Mô tả ngắn gọn giá trị sản phẩm mang lại cho khách hàng.",
          fontSize: 16,
          color: "#cbd5f5",
        },
        {
          id: uid(),
          type: "button",
          x: 60,
          y: 200,
          width: 160,
          height: 44,
          label: "Tìm hiểu thêm",
          href: "#",
          bg: "#F5C518",
          color: "#0A2463",
        },
      ];
      return slide;
    }

    case "portfolio": {
      const slide = base("#ffffff");
      slide.elements = [
        {
          id: uid(),
          type: "text",
          x: 60,
          y: 50,
          width: 400,
          height: 50,
          content: "Tên của bạn",
          fontSize: 28,
          color: "#111827",
        },
        {
          id: uid(),
          type: "image",
          x: 60,
          y: 120,
          width: 240,
          height: 160,
          src: "https://placehold.co/240x160",
          alt: "Dự án 1",
        },
        {
          id: uid(),
          type: "image",
          x: 320,
          y: 120,
          width: 240,
          height: 160,
          src: "https://placehold.co/240x160",
          alt: "Dự án 2",
        },
      ];
      return slide;
    }

    case "shop": {
      const slide = base("#f3f4f6");
      slide.elements = [
        {
          id: uid(),
          type: "section",
          x: 0,
          y: 0,
          width: 960,
          height: 100,
          bg: "#111827",
        },
        {
          id: uid(),
          type: "text",
          x: 30,
          y: 30,
          width: 300,
          height: 40,
          content: "Cửa hàng của bạn",
          fontSize: 24,
          color: "#ffffff",
        },
        {
          id: uid(),
          type: "image",
          x: 60,
          y: 140,
          width: 220,
          height: 160,
          src: "https://placehold.co/220x160",
          alt: "Sản phẩm",
        },
        {
          id: uid(),
          type: "button",
          x: 60,
          y: 320,
          width: 160,
          height: 44,
          label: "Mua ngay",
          href: "#",
          bg: "#111827",
          color: "#ffffff",
        },
      ];
      return slide;
    }

    case "event": {
      const slide = base("#fde8ff");
      slide.elements = [
        {
          id: uid(),
          type: "text",
          x: 60,
          y: 60,
          width: 500,
          height: 50,
          content: "Tên sự kiện",
          fontSize: 30,
          color: "#7c1aa3",
        },
        {
          id: uid(),
          type: "text",
          x: 60,
          y: 130,
          width: 400,
          height: 30,
          content: "Thứ Bảy, 12.07.2026 · 18:00",
          fontSize: 16,
          color: "#581c87",
        },
        {
          id: uid(),
          type: "button",
          x: 60,
          y: 180,
          width: 160,
          height: 44,
          label: "Đăng ký ngay",
          href: "#",
          bg: "#7c1aa3",
          color: "#ffffff",
        },
      ];
      return slide;
    }

    case "blank":
    default:
      return base("#ffffff");
  }
}

export function createProject(name: string, templateKey: TemplateKey = "blank"): Project {
  ensureHydrated();
  const p: Project = {
    id: uid(),
    name: name || "Untitled Project",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    slides: [makeSlideFromTemplate(templateKey)],
  };
  setState((s) => ({ projects: [...s.projects, p] }));
  return p;
}

export function deleteProject(id: string) {
  setState((s) => ({ projects: s.projects.filter((p) => p.id !== id) }));
}

export function renameProject(id: string, name: string) {
  updateProject(id, (p) => ({ ...p, name }));
}

export function updateProject(id: string, fn: (p: Project) => Project) {
  setState((s) => ({
    projects: s.projects.map((p) =>
      p.id === id ? { ...fn(p), updatedAt: Date.now() } : p,
    ),
  }));
}

export function addSlide(projectId: string) {
  updateProject(projectId, (p) => ({
    ...p,
    slides: [...p.slides, makeSlide(`Slide ${p.slides.length + 1}`)],
  }));
}

export function deleteSlide(projectId: string, slideId: string) {
  updateProject(projectId, (p) => ({
    ...p,
    slides: p.slides.length > 1 ? p.slides.filter((s) => s.id !== slideId) : p.slides,
  }));
}

export function updateSlide(projectId: string, slideId: string, fn: (s: Slide) => Slide) {
  updateProject(projectId, (p) => ({
    ...p,
    slides: p.slides.map((s) => (s.id === slideId ? fn(s) : s)),
  }));
}

function defaultElement(type: ElementType): Element {
  const base = { id: uid(), x: 80, y: 80, width: 240, height: 80 };
  switch (type) {
    case "text":
      return { ...base, type, content: "New text", fontSize: 18, color: "#111827" };
    case "image":
      return {
        ...base,
        type,
        width: 240,
        height: 160,
        src: "https://placehold.co/240x160",
        alt: "Image",
      };
    case "button":
      return {
        ...base,
        type,
        width: 160,
        height: 44,
        label: "Click me",
        href: "#",
        bg: "#111827",
        color: "#ffffff",
      };
    case "section":
      return { ...base, type, width: 480, height: 240, bg: "#f3f4f6" };
  }
}

export function addElement(projectId: string, slideId: string, type: ElementType): string {
  const el = defaultElement(type);
  updateSlide(projectId, slideId, (s) => ({ ...s, elements: [...s.elements, el] }));
  return el.id;
}

export function deleteElement(projectId: string, slideId: string, elementId: string) {
  updateSlide(projectId, slideId, (s) => ({
    ...s,
    elements: s.elements.filter((e) => e.id !== elementId),
  }));
}

export function updateElement(
  projectId: string,
  slideId: string,
  elementId: string,
  patch: Partial<Element>,
) {
  updateSlide(projectId, slideId, (s) => ({
    ...s,
    elements: s.elements.map((e) =>
      e.id === elementId ? ({ ...e, ...patch } as Element) : e,
    ),
  }));
}

export function getProject(id: string): Project | undefined {
  return state.projects.find((p) => p.id === id);
           }
