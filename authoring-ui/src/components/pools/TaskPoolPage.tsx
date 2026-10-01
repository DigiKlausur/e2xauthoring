import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Copy, GitCommitHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import type { Task } from "@api";
import { useKernels } from "@hooks/kernels";
import {
  useCommitTask,
  useCopyTask,
  useCreateTask,
  useDeleteTask,
  useRenameTask,
  useTasks,
} from "@hooks/tasks";
import { useDocumentTitle } from "@hooks/ui";
import { NameDialog } from "@components/dialogs/NameDialog";
import { GitAuthorAlert } from "@components/git/GitAuthorAlert";
import { PageHeader } from "@components/layout/PageHeader";
import { CommitTaskDialog } from "@components/tasks/CommitTaskDialog";
import { KernelSelect } from "@components/tasks/KernelSelect";
import { Alert } from "@components/ui/Alert";
import { Badge } from "@components/ui/Badge";
import { Button } from "@components/ui/Button";
import { Card } from "@components/ui/Card";
import { ConfirmDialog } from "@components/ui/ConfirmDialog";
import { DataTable, type DataTableColumn } from "@components/ui/DataTable";
import { IconButton } from "@components/ui/IconButton";
import { GitStatus, gitStatusLabels } from "@domain/gitStatus";
import { pageTexts } from "@domain/texts";
import { getErrorMessage } from "@/lib/errorMessage";
import { routes } from "@/lib/routes";

type TaskAction = {
  kind: "rename" | "copy" | "commit" | "delete";
  task: Task;
};

export function TaskPoolPage() {
  const { pool = "" } = useParams<{ pool: string }>();
  useDocumentTitle(pageTexts.pools.title, pool);
  const navigate = useNavigate();
  const tasks = useTasks(pool);
  const kernels = useKernels();

  const [creating, setCreating] = useState(false);
  // null = follow the first installed kernel.
  const [kernel, setKernel] = useState<string | null>(null);
  const currentKernel = kernel ?? kernels.data?.[0]?.name ?? "";
  const create = useCreateTask(pool);

  const [action, setAction] = useState<TaskAction | null>(null);
  const target = action?.task.name ?? "";
  const rename = useRenameTask(pool, target);
  const copy = useCopyTask(pool, target);
  const commit = useCommitTask(pool, target);
  const remove = useDeleteTask(pool, target);

  const taskNames = tasks.data?.map((task) => task.name) ?? [];

  const closeCreate = () => {
    setCreating(false);
    setKernel(null);
    create.reset();
  };

  const closeAction = () => {
    setAction(null);
    rename.reset();
    copy.reset();
    commit.reset();
    remove.reset();
  };

  const columns = useMemo(
    (): DataTableColumn<Task>[] => [
      {
        key: "name",
        header: "Name",
        sortValue: (task) => task.name,
        filterValue: (task) => task.name,
        cell: (task) => (
          <Link
            to={routes.task(task.pool, task.name)}
            className="font-medium text-primary hover:underline"
          >
            {task.name}
          </Link>
        ),
      },
      {
        key: "questions",
        header: "Questions",
        sortValue: (task) => task.n_questions,
        cell: (task) => task.n_questions,
      },
      {
        key: "points",
        header: "Points",
        sortValue: (task) => task.points,
        cell: (task) => task.points,
      },
      {
        key: "status",
        header: "Version control",
        sortValue: (task) => gitStatusLabels[task.git_status.status].label,
        cell: (task) => {
          const { label, tone } = gitStatusLabels[task.git_status.status];
          return <Badge tone={tone}>{label}</Badge>;
        },
      },
      {
        key: "actions",
        header: "Actions",
        align: "right",
        cell: (task) => {
          const status = task.git_status.status;
          return (
            <div className="inline-flex gap-1">
              <IconButton
                label={`Rename ${task.name}`}
                icon={<Pencil className="size-4" />}
                onClick={() => setAction({ kind: "rename", task })}
              />
              <IconButton
                label={`Copy ${task.name}`}
                icon={<Copy className="size-4" />}
                onClick={() => setAction({ kind: "copy", task })}
              />
              {status !== GitStatus.NotVersionControlled && (
                <IconButton
                  label={
                    status === GitStatus.Unchanged
                      ? `${task.name} has no uncommitted changes`
                      : `Commit ${task.name}`
                  }
                  icon={<GitCommitHorizontal className="size-4" />}
                  disabled={status === GitStatus.Unchanged}
                  onClick={() => setAction({ kind: "commit", task })}
                />
              )}
              <IconButton
                label={`Delete ${task.name}`}
                variant="danger"
                icon={<Trash2 className="size-4" />}
                onClick={() => setAction({ kind: "delete", task })}
              />
            </div>
          );
        },
      },
    ],
    [],
  );

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: pageTexts.pools.title, to: routes.pools },
          { label: pool },
        ]}
        title={pool}
        subtitle={pageTexts.pool.description}
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-4" />
            New Task
          </Button>
        }
      />

      <div className="px-10 py-8">
        <GitAuthorAlert className="mb-6" />
        {tasks.isError && (
          <Alert title="Could not load the tasks" className="mb-6">
            {getErrorMessage(tasks.error)}
          </Alert>
        )}
        <Card>
          <DataTable
            rows={tasks.data}
            columns={columns}
            getRowId={(task) => task.name}
            isLoading={tasks.isPending}
            emptyMessage="No tasks in this pool yet."
            noMatchMessage="No matching tasks."
            filterPlaceholder="Filter tasks…"
            initialSort={{ key: "name", direction: "asc" }}
          />
        </Card>
      </div>

      <NameDialog
        open={creating}
        onClose={closeCreate}
        title="New task"
        label="Task name"
        submitLabel="Create Task"
        pendingLabel="Creating…"
        takenNames={taskNames}
        isSubmitting={create.isPending}
        errorTitle="Could not create the task"
        error={create.error}
        onSubmit={(name) =>
          create.mutate(
            { name, kernelName: currentKernel },
            { onSuccess: () => navigate(routes.task(pool, name)) },
          )
        }
      >
        <KernelSelect
          kernels={kernels.data}
          value={currentKernel}
          onChange={setKernel}
          disabled={create.isPending}
        />
      </NameDialog>

      <NameDialog
        open={action?.kind === "rename"}
        onClose={closeAction}
        title={`Rename ${target}`}
        label="New name"
        submitLabel="Rename"
        pendingLabel="Renaming…"
        takenNames={taskNames}
        isSubmitting={rename.isPending}
        errorTitle="Could not rename the task"
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
        takenNames={taskNames}
        isSubmitting={copy.isPending}
        errorTitle="Could not copy the task"
        error={copy.error}
        onSubmit={(name) =>
          copy.mutate(name, {
            onSuccess: () => navigate(routes.task(pool, name)),
          })
        }
      />

      <CommitTaskDialog
        task={action?.kind === "commit" ? action.task : null}
        onClose={closeAction}
        onSubmit={(message) =>
          commit.mutate(message, { onSuccess: closeAction })
        }
        isSubmitting={commit.isPending}
        error={commit.error}
      />

      <ConfirmDialog
        open={action?.kind === "delete"}
        onClose={closeAction}
        onConfirm={() => remove.mutate(undefined, { onSuccess: closeAction })}
        variant="destructive"
        title={`Delete ${target}`}
        description={
          <>
            This permanently deletes the task <strong>{target}</strong> from the
            pool {pool}, including its data and images.
          </>
        }
        requireConfirmationText={target}
        confirmLabel="Delete Task"
        pendingLabel="Deleting…"
        isConfirming={remove.isPending}
        errorTitle="Could not delete the task"
        errorMessage={remove.error && getErrorMessage(remove.error)}
      />
    </div>
  );
}
