import { Link } from "@tanstack/react-router";

interface Props {
  projectName: string;
  projectId: string;
  resolving: boolean;
  onDownloadJson: () => void;
  onDownloadHtml: () => void;
}

export function ExportHeader({ projectName, projectId, resolving, onDownloadJson, onDownloadHtml }: Props) {
  return (
    <header className="flex items-center justify-between border-b px-4 py-2">
      <div className="flex items-center gap-3">
        <Link to="/" className="text-sm text-muted-foreground hover:underline">
          ← Trang chủ
        </Link>
        <span className="text-sm font-semibold">{projectName} — Xuất file</span>
      </div>
      <div className="flex gap-2">
        <Link
          to="/editor/$projectId"
          params={{ projectId }}
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
        >
          Chỉnh sửa
        </Link>
        <button
          onClick={onDownloadJson}
          disabled={resolving}
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-60"
        >
          Tải JSON
        </button>
        <button
          onClick={onDownloadHtml}
          disabled={resolving}
          className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground disabled:opacity-60"
        >
          {resolving ? "⏳ Đang xử lý ảnh..." : "Tải HTML"}
        </button>
      </div>
    </header>
  );
}
