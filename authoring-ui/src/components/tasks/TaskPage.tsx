import { useParams } from "react-router-dom";
import { useDocumentTitle } from "@hooks/ui";
import { NotebookFrame } from "@components/layout/NotebookFrame";
import { OpenInJupyterLink } from "@components/layout/OpenInJupyterLink";
import { PageHeader } from "@components/layout/PageHeader";
import { pageTexts } from "@domain/texts";
import { notebookUrls, routes } from "@/lib/routes";

export function TaskPage() {
  const { pool = "", task = "" } = useParams<{ pool: string; task: string }>();
  useDocumentTitle(pageTexts.pools.title, pool, task);
  const src = notebookUrls.task(pool, task);

  return (
    <div className="flex-1 flex flex-col">
      <PageHeader
        breadcrumbs={[
          { label: pageTexts.pools.title, to: routes.pools },
          { label: pool, to: routes.pool(pool) },
          { label: task },
        ]}
        title={task}
        actions={<OpenInJupyterLink href={src} />}
      />
      <NotebookFrame src={src} title={`Task ${task}`} />
    </div>
  );
}
