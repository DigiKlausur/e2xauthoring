import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import type { Worksheet } from "@api";
import { useDocumentTitle } from "@hooks/ui";
import { useDeleteWorksheet, useWorksheets } from "@hooks/worksheets";
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
import { notebookUrls, routes } from "@/lib/routes";

export function AssignmentPage() {
  const { assignment = "" } = useParams<{ assignment: string }>();
  useDocumentTitle(pageTexts.assignments.title, assignment);
  const navigate = useNavigate();
  const worksheets = useWorksheets(assignment);

  // A freshly created assignment opens straight into the new-worksheet dialog.
  const location = useLocation();
  const [naming, setNaming] = useState(
    () =>
      (location.state as { newWorksheet?: boolean } | null)?.newWorksheet ===
      true,
  );
  // Drop the flag so going back or reloading does not reopen the dialog.
  useEffect(() => {
    if (location.state != null) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, location.pathname, navigate]);
  const [deleting, setDeleting] = useState<Worksheet | null>(null);
  const remove = useDeleteWorksheet(assignment, deleting?.name ?? "");

  const closeDelete = () => {
    setDeleting(null);
    remove.reset();
  };

  const columns = useMemo(
    (): DataTableColumn<Worksheet>[] => [
      {
        key: "name",
        header: "Name",
        sortValue: (worksheet) => worksheet.name,
        filterValue: (worksheet) => worksheet.name,
        cell: (worksheet) => (
          <a
            href={notebookUrls.worksheet(assignment, worksheet.name)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
          >
            {worksheet.name}
            <ExternalLink className="size-3.5" />
          </a>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        align: "right",
        cell: (worksheet) => (
          <IconButton
            label={`Delete ${worksheet.name}`}
            variant="danger"
            icon={<Trash2 className="size-4" />}
            onClick={() => setDeleting(worksheet)}
          />
        ),
      },
    ],
    [assignment],
  );

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: pageTexts.assignments.title, to: routes.assignments },
          { label: assignment },
        ]}
        title={assignment}
        subtitle={pageTexts.worksheets.description}
        actions={
          <Button onClick={() => setNaming(true)}>
            <Plus className="size-4" />
            New Worksheet
          </Button>
        }
      />

      <div className="px-10 py-8">
        {worksheets.isError && (
          <Alert title="Could not load the worksheets" className="mb-6">
            {getErrorMessage(worksheets.error)}
          </Alert>
        )}
        <Card>
          <DataTable
            rows={worksheets.data}
            columns={columns}
            getRowId={(worksheet) => worksheet.name}
            isLoading={worksheets.isPending}
            emptyMessage="No worksheets in this assignment yet."
            noMatchMessage="No matching worksheets."
            filterPlaceholder="Filter worksheets…"
            initialSort={{ key: "name", direction: "asc" }}
          />
        </Card>
      </div>

      {/* Naming only picks the URL; the worksheet is created at the end of the wizard. */}
      <NameDialog
        open={naming}
        onClose={() => setNaming(false)}
        title="New worksheet"
        description="Next you choose a template and the tasks of the worksheet."
        label="Worksheet name"
        submitLabel="Continue"
        pendingLabel="Continuing…"
        takenNames={worksheets.data?.map((worksheet) => worksheet.name) ?? []}
        isSubmitting={false}
        errorTitle="Could not continue"
        error={null}
        onSubmit={(name) => navigate(routes.newWorksheet(assignment, name))}
      />

      <ConfirmDialog
        open={deleting !== null}
        onClose={closeDelete}
        onConfirm={() => remove.mutate(undefined, { onSuccess: closeDelete })}
        variant="destructive"
        title={`Delete ${deleting?.name ?? ""}`}
        description={
          <>
            This permanently deletes the worksheet{" "}
            <strong>{deleting?.name}</strong> and its files from the assignment{" "}
            {assignment}.
          </>
        }
        requireConfirmationText={deleting?.name}
        confirmLabel="Delete Worksheet"
        pendingLabel="Deleting…"
        isConfirming={remove.isPending}
        errorTitle="Could not delete the worksheet"
        errorMessage={remove.error && getErrorMessage(remove.error)}
      />
    </div>
  );
}
