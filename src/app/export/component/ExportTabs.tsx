export type ExportTab = "preview" | "html" | "json";

const TAB_LABELS: Record<ExportTab, string> = {
  preview: "Xem trước",
  html: "HTML",
  json: "JSON",
};

interface Props {
  active: ExportTab;
  onChange: (tab: ExportTab) => void;
}

export function ExportTabs({ active, onChange }: Props) {
  return (
    <div className="border-b px-4">
      <nav className="flex gap-4 text-sm">
        {(Object.keys(TAB_LABELS) as ExportTab[]).map((t) => (
          <button
            key={t}
            onClick={() => onChange(t)}
            className={`border-b-2 py-2 ${
              active === t ? "border-primary" : "border-transparent text-muted-foreground"
            }`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </nav>
    </div>
  );
}
