import { createFileRoute, useParams } from "@tanstack/react-router";
import { EditorPage } from "@/app/editor";

export const Route = createFileRoute("/editor/$projectId")({
  head: () => ({ meta: [{ title: "Editor — ViBaoBuilder" }] }),
  component: function Editor() {
    const { projectId } = useParams({ from: "/editor/$projectId" });
    return <EditorPage projectId={projectId} />;
  },
});
