import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useStore } from "@/lib/builder/store";
import { buildHtml } from "@/lib/builder/export/html";
import { downloadFile } from "@/lib/builder/export/download";
import { resolveImagesForExport, hasUnresolvedImages } from "@/lib/builder/export/resolveImages";
import { ExportHeader } from "./components/ExportHeader";
import { ExportTabs, type ExportTab } from "./components/ExportTabs";
import { PreviewTab } from "./components/PreviewTab";
import { CodeTab } from "./components/CodeTab";

interface Props {
  projectId: string;
}

export function ExportPage({ projectId }: Props) {
  const project = useStore((s) => s.projects.find((p) => p.id === projectId));
  const [tab, setTab] = useState<ExportTab>("preview");
  const [resolving, setResolving] = useState(false);
  const [resolveNote, setResolveNote] = useState<string | null>(null);

  const json = useMemo(() => (project ? JSON.stringify(project, null, 2) : ""), [project]);
  const html = useMemo(() => (project ? buildHtml(project) : ""), [project]);

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Link to="/" className="text-sm underline">
          Không tìm thấy dự án — về trang chủ
        </Link>
      </div>
    );
  }

  /**
   * Trước khi xuất HTML: nếu còn ảnh base64 (lưu nhanh lúc thiết kế), upload
   * lên HuggingFace qua Worker trung gian để file HTML xuất ra nhẹ, không
   * nhúng base64 nặng. Ảnh đã là URL thật thì bỏ qua, không upload lại.
   */
  async function handleDownloadHtml() {
    if (!hasUnresolvedImages(project)) {
      downloadFile(`${project.name}.html`, html, "text/html");
      return;
    }

    setResolving(true);
    setResolveNote(null);
    try {
      const { project: resolved, uploadedCount, failedCount } = await resolveImagesForExport(project);
      const resolvedHtml = buildHtml(resolved);
      downloadFile(`${project.name}.html`, resolvedHtml, "text/html");
      if (failedCount > 0) {
        setResolveNote(
          `Đã tải lên ${uploadedCount} ảnh, ${failedCount} ảnh lỗi (vẫn giữ tạm trong file, có thể nặng hơn).`,
        );
      }
    } finally {
      setResolving(false);
    }
  }

  function handleDownloadJson() {
    downloadFile(`${project.name}.json`, json, "application/json");
  }

  return (
    <div className="min-h-screen bg-background">
      <ExportHeader
        projectName={project.name}
        projectId={project.id}
        resolving={resolving}
        onDownloadJson={handleDownloadJson}
        onDownloadHtml={handleDownloadHtml}
      />

      <ExportTabs active={tab} onChange={setTab} />

      <div className="p-6">
        {resolveNote && (
          <p className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            {resolveNote}
          </p>
        )}
        {tab === "preview" && <PreviewTab project={project} />}
        {tab === "html" && <CodeTab code={html} />}
        {tab === "json" && <CodeTab code={json} />}
      </div>
    </div>
  );
}
