export type ElementType = "text" | "image" | "button" | "section";

export interface BaseElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TextElement extends BaseElement {
  type: "text";
  content: string;
  fontSize: number;
  color: string;
}

export interface ImageElement extends BaseElement {
  type: "image";
  src: string;
  alt: string;
}

export interface ButtonElement extends BaseElement {
  type: "button";
  label: string;
  href: string;
  bg: string;
  color: string;
}

export interface SectionElement extends BaseElement {
  type: "section";
  bg: string;
}

export type Element = TextElement | ImageElement | ButtonElement | SectionElement;

export interface Slide {
  id: string;
  name: string;
  background: string;
  elements: Element[];
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  slides: Slide[];
}