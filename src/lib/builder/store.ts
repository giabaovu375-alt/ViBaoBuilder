import { useSyncExternalStore } from "react";
import type { Element, ElementType, Project, Slide } from "./types";

const STORAGE_KEY = "slide-builder:projects";

type State = { projects: Project[] };

const listeners = new Set<() => void>();
let state: State = load();

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

export function createProject(name: string): Project {
  const p: Project = {
    id: uid(),
    name: name || "Untitled Project",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    slides: [makeSlide()],
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