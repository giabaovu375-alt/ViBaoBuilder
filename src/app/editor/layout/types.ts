export type MobileTab = "add" | "pages" | "props";
export type Layout = { left: number; right: number };

export interface PaneProps {
  project: any;
  slide: any;
  slideIdx: number;
  selected: any;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  onSelectSlide: (i: number) => void;
  onDelete: () => void;
}
