import { createFileRoute, useParams } from "@tanstack/react-router";
import { ExportPage } from "@/app/export";

export const Route = createFileRoute("/export/$projectId")({
  head: () => ({ meta: [{ title: "Xuất file — ViBaoBuilder" }] }),
  component: function Export() {
    const { projectId } = useParams({ from: "/export/$projectId" });
    return <ExportPage projectId={projectId} />;
  },
});
