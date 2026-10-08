import { useParams } from "react-router-dom";
import { useDocumentTitle } from "@hooks/ui";
import { NotebookFrame } from "@components/layout/NotebookFrame";
import { OpenInJupyterLink } from "@components/layout/OpenInJupyterLink";
import { PageHeader } from "@components/layout/PageHeader";
import { pageTexts } from "@domain/texts";
import { notebookUrls, routes } from "@/lib/routes";

export function TemplatePage() {
  const { template = "" } = useParams<{ template: string }>();
  useDocumentTitle(pageTexts.templates.title, template);
  const src = notebookUrls.template(template);

  return (
    <div className="flex-1 flex flex-col">
      <PageHeader
        breadcrumbs={[
          { label: pageTexts.templates.title, to: routes.templates },
          { label: template },
        ]}
        title={template}
        actions={<OpenInJupyterLink href={src} />}
      />
      <NotebookFrame src={src} title={`Template ${template}`} />
    </div>
  );
}
