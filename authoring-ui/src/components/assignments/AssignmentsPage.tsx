import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import type { Assignment } from "@api";
import { useAssignments, useCreateAssignment } from "@hooks/assignments";
import { useDocumentTitle } from "@hooks/ui";
import { PageHeader } from "@components/layout/PageHeader";
import { Alert } from "@components/ui/Alert";
import { Badge } from "@components/ui/Badge";
import { Button } from "@components/ui/Button";
import { Card } from "@components/ui/Card";
import { DataTable, type DataTableColumn } from "@components/ui/DataTable";
import { Switch } from "@components/ui/Switch";
import {
  AssignmentStatus,
  assignmentStatus,
  assignmentStatusLabels,
} from "@domain/assignmentStatus";
import { pageTexts } from "@domain/texts";
import { formatDateTime, parseUtc } from "@/lib/dates";
import { getErrorMessage } from "@/lib/errorMessage";
import { routes } from "@/lib/routes";
import { NewAssignmentDialog } from "./NewAssignmentDialog";

export function AssignmentsPage() {
  useDocumentTitle(pageTexts.assignments.title);
  const navigate = useNavigate();
  const assignments = useAssignments();
  const [onlyDrafts, setOnlyDrafts] = useState(true);

  const [creating, setCreating] = useState(false);
  const create = useCreateAssignment();

  const closeCreate = () => {
    setCreating(false);
    create.reset();
  };

  const rows = useMemo(
    () =>
      onlyDrafts
        ? assignments.data?.filter(
            (assignment) =>
              assignmentStatus(assignment) === AssignmentStatus.Draft,
          )
        : assignments.data,
    [assignments.data, onlyDrafts],
  );

  const columns = useMemo(
    (): DataTableColumn<Assignment>[] => [
      {
        key: "name",
        header: "Name",
        sortValue: (assignment) => assignment.name,
        filterValue: (assignment) => assignment.name,
        cell: (assignment) => (
          <Link
            to={routes.assignment(assignment.name)}
            className="font-medium text-primary hover:underline"
          >
            {assignment.name}
          </Link>
        ),
      },
      {
        key: "duedate",
        header: "Due date",
        sortValue: (assignment) =>
          assignment.duedate ? parseUtc(assignment.duedate).getTime() : 0,
        cell: (assignment) =>
          assignment.duedate ? (
            formatDateTime(parseUtc(assignment.duedate))
          ) : (
            <span className="text-gray-400">None</span>
          ),
      },
      {
        key: "status",
        header: "Status",
        sortValue: (assignment) => assignmentStatus(assignment),
        cell: (assignment) => {
          const { label, tone } =
            assignmentStatusLabels[assignmentStatus(assignment)];
          return <Badge tone={tone}>{label}</Badge>;
        },
      },
      {
        key: "submissions",
        header: "Submissions",
        sortValue: (assignment) => assignment.num_submissions,
        cell: (assignment) => assignment.num_submissions,
      },
    ],
    [],
  );

  return (
    <div>
      <PageHeader
        title={pageTexts.assignments.title}
        subtitle={pageTexts.assignments.description}
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-4" />
            New Assignment
          </Button>
        }
      />

      <div className="px-10 py-8">
        {assignments.isError && (
          <Alert title="Could not load the assignments" className="mb-6">
            {getErrorMessage(assignments.error)}
          </Alert>
        )}
        <Card>
          <DataTable
            rows={rows}
            columns={columns}
            getRowId={(assignment) => assignment.name}
            isLoading={assignments.isPending}
            emptyMessage={
              onlyDrafts
                ? "No draft assignments without submissions."
                : "No assignments yet."
            }
            noMatchMessage="No matching assignments."
            filterPlaceholder="Filter assignments…"
            initialSort={{ key: "name", direction: "asc" }}
            toolbar={
              <Switch
                checked={onlyDrafts}
                onChange={setOnlyDrafts}
                label="Only drafts without submissions"
              />
            }
          />
        </Card>
      </div>

      <NewAssignmentDialog
        open={creating}
        onClose={closeCreate}
        takenNames={
          assignments.data?.map((assignment) => assignment.name) ?? []
        }
        isSubmitting={create.isPending}
        error={create.error}
        onSubmit={(assignment) =>
          create.mutate(assignment, {
            onSuccess: () =>
              navigate(routes.assignment(assignment.name), {
                state: { newWorksheet: true },
              }),
          })
        }
      />
    </div>
  );
}
