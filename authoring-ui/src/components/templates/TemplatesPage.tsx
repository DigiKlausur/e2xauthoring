import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Copy, Pencil, Plus, Trash2 } from "lucide-react";
import type { Template } from "@api";
import {
  useCopyTemplate,
  useCreateTemplate,
  useDeleteTemplate,
  useRenameTemplate,
  useTemplates,
} from "@hooks/templates";
import { useDocumentTitle } from "@hooks/ui";
import { NameDialog } from "@components/dialogs/NameDialog";
import { PageHeader } from "@components/layout/PageHeader";
import { Alert } from "@components/ui/Alert";
import { Button } from "@components/ui/Button";
import { Card } from "@components/ui/Card";
import { ConfirmDialog } from "@components/ui/ConfirmDialog";
import { DataTable, type DataTableColumn } from "@components/ui/DataTable";
import { IconButton } from "@components/ui/IconButton";
import { pageTexts } from "@domain/texts";
import { getErrorMessage } from "@/lib/errorMessage";
import { routes } from "@/lib/routes";

type TemplateAction = {
  kind: "rename" | "copy" | "delete";
  template: Template;
};

export function TemplatesPage() {
  useDocumentTitle(pageTexts.templates.title);
  const navigate = useNavigate();
  const templates = useTemplates();

  const [creating, setCreating] = useState(false);
  const create = useCreateTemplate();

  const [action, setAction] = useState<TemplateAction | null>(null);
  const target = action?.template.name ?? "";
  const rename = useRenameTemplate(target);
  const copy = useCopyTemplate(target);
  const remove = useDeleteTemplate(target);

  const templateNames = templates.data?.map((template) => template.name) ?? [];

  const closeCreate = () => {
    setCreating(false);
    create.reset();
  };

  const closeAction = () => {
    setAction(null);
    rename.reset();
    copy.reset();
    remove.reset();
  };

  const columns = useMemo(
    (): DataTableColumn<Template>[] => [
      {
        key: "name",
        header: "Name",
        sortValue: (template) => template.name,
        filterValue: (template) => template.name,
        cell: (template) => (
          <Link
            to={routes.template(template.name)}
            className="font-medium text-primary hover:underline"
          >
            {template.name}
          </Link>
        ),
      },
      {
        key: "variables",
        header: "Variables",
        filterValue: (template) => template.variables.join(" "),
        cell: (template) =>
          template.variables.length === 0 ? (
            <span className="text-gray-400">None</span>
          ) : (
            <span className="font-mono text-xs">
              {template.variables.join(", ")}
            </span>
          ),
      },
      {
        key: "actions",
        header: "Actions",
        align: "right",
        cell: (template) => (
          <div className="inline-flex gap-1">
            <IconButton
              label={`Rename ${template.name}`}
              icon={<Pencil className="size-4" />}
              onClick={() => setAction({ kind: "rename", template })}
            />
            <IconButton
              label={`Copy ${template.name}`}
              icon={<Copy className="size-4" />}
              onClick={() => setAction({ kind: "copy", template })}
            />
            <IconButton
              label={`Delete ${template.name}`}
              variant="danger"
              icon={<Trash2 className="size-4" />}
              onClick={() => setAction({ kind: "delete", template })}
            />
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div>
      <PageHeader
        title={pageTexts.templates.title}
        subtitle={pageTexts.templates.description}
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-4" />
            New Template
          </Button>
        }
      />

      <div className="px-10 py-8">
        {templates.isError && (
          <Alert title="Could not load the templates" className="mb-6">
            {getErrorMessage(templates.error)}
          </Alert>
        )}
        <Card>
          <DataTable
            rows={templates.data}
            columns={columns}
            getRowId={(template) => template.name}
            isLoading={templates.isPending}
            emptyMessage="No templates yet."
            noMatchMessage="No matching templates."
            filterPlaceholder="Filter templates…"
            initialSort={{ key: "name", direction: "asc" }}
          />
        </Card>
      </div>

      <NameDialog
        open={creating}
        onClose={closeCreate}
        title="New template"
        label="Template name"
        submitLabel="Create Template"
        pendingLabel="Creating…"
        takenNames={templateNames}
        isSubmitting={create.isPending}
        errorTitle="Could not create the template"
        error={create.error}
        onSubmit={(name) =>
          create.mutate(name, {
            onSuccess: () => navigate(routes.template(name)),
          })
        }
      />

      <NameDialog
        open={action?.kind === "rename"}
        onClose={closeAction}
        title={`Rename ${target}`}
        label="New name"
        submitLabel="Rename"
        pendingLabel="Renaming…"
        takenNames={templateNames}
        isSubmitting={rename.isPending}
        errorTitle="Could not rename the template"
        error={rename.error}
        onSubmit={(name) => rename.mutate(name, { onSuccess: closeAction })}
      />

      <NameDialog
        open={action?.kind === "copy"}
        onClose={closeAction}
        title={`Copy ${target}`}
        label="Name of the copy"
        submitLabel="Copy"
        pendingLabel="Copying…"
        takenNames={templateNames}
        isSubmitting={copy.isPending}
        errorTitle="Could not copy the template"
        error={copy.error}
        onSubmit={(name) =>
          copy.mutate(name, {
            onSuccess: () => navigate(routes.template(name)),
          })
        }
      />

      <ConfirmDialog
        open={action?.kind === "delete"}
        onClose={closeAction}
        onConfirm={() => remove.mutate(undefined, { onSuccess: closeAction })}
        variant="destructive"
        title={`Delete ${target}`}
        description={
          <>
            This permanently deletes the template <strong>{target}</strong>.
            Worksheets created from it are not affected.
          </>
        }
        requireConfirmationText={target}
        confirmLabel="Delete Template"
        pendingLabel="Deleting…"
        isConfirming={remove.isPending}
        errorTitle="Could not delete the template"
        errorMessage={remove.error && getErrorMessage(remove.error)}
      />
    </div>
  );
}
