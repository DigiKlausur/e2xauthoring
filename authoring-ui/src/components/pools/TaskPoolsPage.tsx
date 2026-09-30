import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Copy, GitBranch, Pencil, Plus, Trash2 } from "lucide-react";
import type { Pool } from "@api";
import {
  useCopyPool,
  useCreatePool,
  useDeletePool,
  usePools,
  useRenamePool,
  useTurnPoolIntoRepository,
} from "@hooks/pools";
import { useDocumentTitle } from "@hooks/ui";
import { NameDialog } from "@components/dialogs/NameDialog";
import { GitAuthorAlert } from "@components/git/GitAuthorAlert";
import { PageHeader } from "@components/layout/PageHeader";
import { Alert } from "@components/ui/Alert";
import { Badge } from "@components/ui/Badge";
import { Button } from "@components/ui/Button";
import { Card } from "@components/ui/Card";
import { ConfirmDialog } from "@components/ui/ConfirmDialog";
import { DataTable, type DataTableColumn } from "@components/ui/DataTable";
import { IconButton } from "@components/ui/IconButton";
import { Switch } from "@components/ui/Switch";
import { pageTexts } from "@domain/texts";
import { getErrorMessage } from "@/lib/errorMessage";
import { routes } from "@/lib/routes";

type PoolAction = {
  kind: "rename" | "copy" | "repository" | "delete";
  pool: Pool;
};

export function TaskPoolsPage() {
  useDocumentTitle(pageTexts.pools.title);
  const navigate = useNavigate();
  const pools = usePools();

  const [creating, setCreating] = useState(false);
  const [initRepository, setInitRepository] = useState(false);
  const create = useCreatePool();

  const [action, setAction] = useState<PoolAction | null>(null);
  const target = action?.pool.name ?? "";
  const rename = useRenamePool(target);
  const copy = useCopyPool(target);
  const turnIntoRepository = useTurnPoolIntoRepository(target);
  const remove = useDeletePool(target);

  const poolNames = pools.data?.map((pool) => pool.name) ?? [];

  const closeCreate = () => {
    setCreating(false);
    setInitRepository(false);
    create.reset();
  };

  const closeAction = () => {
    setAction(null);
    rename.reset();
    copy.reset();
    turnIntoRepository.reset();
    remove.reset();
  };

  const columns = useMemo(
    (): DataTableColumn<Pool>[] => [
      {
        key: "name",
        header: "Name",
        sortValue: (pool) => pool.name,
        filterValue: (pool) => pool.name,
        cell: (pool) => (
          <Link
            to={routes.pool(pool.name)}
            className="font-medium text-primary hover:underline"
          >
            {pool.name}
          </Link>
        ),
      },
      {
        key: "tasks",
        header: "Tasks",
        sortValue: (pool) => pool.n_tasks,
        cell: (pool) => pool.n_tasks,
      },
      {
        key: "repo",
        header: "Version control",
        sortValue: (pool) => (pool.is_repo ? 1 : 0),
        cell: (pool) =>
          pool.is_repo ? (
            <Badge tone="success">Git repository</Badge>
          ) : (
            <Badge tone="neutral">Not version controlled</Badge>
          ),
      },
      {
        key: "actions",
        header: "Actions",
        align: "right",
        cell: (pool) => (
          <div className="inline-flex gap-1">
            <IconButton
              label={`Rename ${pool.name}`}
              icon={<Pencil className="size-4" />}
              onClick={() => setAction({ kind: "rename", pool })}
            />
            <IconButton
              label={`Copy ${pool.name}`}
              icon={<Copy className="size-4" />}
              onClick={() => setAction({ kind: "copy", pool })}
            />
            <IconButton
              label={
                pool.is_repo
                  ? `${pool.name} is already a git repository`
                  : `Turn ${pool.name} into a git repository`
              }
              icon={<GitBranch className="size-4" />}
              disabled={pool.is_repo}
              onClick={() => setAction({ kind: "repository", pool })}
            />
            <IconButton
              label={`Delete ${pool.name}`}
              variant="danger"
              icon={<Trash2 className="size-4" />}
              onClick={() => setAction({ kind: "delete", pool })}
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
        title={pageTexts.pools.title}
        subtitle={pageTexts.pools.description}
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-4" />
            New Task Pool
          </Button>
        }
      />

      <div className="px-10 py-8">
        <GitAuthorAlert className="mb-6" />
        {pools.isError && (
          <Alert title="Could not load the task pools" className="mb-6">
            {getErrorMessage(pools.error)}
          </Alert>
        )}
        <Card>
          <DataTable
            rows={pools.data}
            columns={columns}
            getRowId={(pool) => pool.name}
            isLoading={pools.isPending}
            emptyMessage="No task pools yet."
            noMatchMessage="No matching task pools."
            filterPlaceholder="Filter task pools…"
            initialSort={{ key: "name", direction: "asc" }}
          />
        </Card>
      </div>

      <NameDialog
        open={creating}
        onClose={closeCreate}
        title="New task pool"
        label="Pool name"
        submitLabel="Create Task Pool"
        pendingLabel="Creating…"
        takenNames={poolNames}
        isSubmitting={create.isPending}
        errorTitle="Could not create the task pool"
        error={create.error}
        onSubmit={(name) =>
          create.mutate(
            { name, initRepository },
            { onSuccess: () => navigate(routes.pool(name)) },
          )
        }
      >
        <Switch
          checked={initRepository}
          onChange={setInitRepository}
          disabled={create.isPending}
          label="Initialize as git repository"
          description="Track changes to the tasks in this pool and commit them."
        />
      </NameDialog>

      <NameDialog
        open={action?.kind === "rename"}
        onClose={closeAction}
        title={`Rename ${target}`}
        label="New name"
        submitLabel="Rename"
        pendingLabel="Renaming…"
        takenNames={poolNames}
        isSubmitting={rename.isPending}
        errorTitle="Could not rename the task pool"
        error={rename.error}
        onSubmit={(name) => rename.mutate(name, { onSuccess: closeAction })}
      />

      <NameDialog
        open={action?.kind === "copy"}
        onClose={closeAction}
        title={`Copy ${target}`}
        description="The copy contains all tasks of the pool."
        label="Name of the copy"
        submitLabel="Copy"
        pendingLabel="Copying…"
        takenNames={poolNames}
        isSubmitting={copy.isPending}
        errorTitle="Could not copy the task pool"
        error={copy.error}
        onSubmit={(name) =>
          copy.mutate(name, { onSuccess: () => navigate(routes.pool(name)) })
        }
      />

      <ConfirmDialog
        open={action?.kind === "repository"}
        onClose={closeAction}
        onConfirm={() =>
          turnIntoRepository.mutate(undefined, { onSuccess: closeAction })
        }
        title={`Turn ${target} into a git repository`}
        description="A git repository is created for the pool, so that changes to its tasks can be reviewed and committed."
        confirmLabel="Turn into Repository"
        pendingLabel="Creating repository…"
        isConfirming={turnIntoRepository.isPending}
        errorTitle="Could not create the repository"
        errorMessage={
          turnIntoRepository.error && getErrorMessage(turnIntoRepository.error)
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
            This permanently deletes the task pool <strong>{target}</strong> and
            all {action?.pool.n_tasks ?? 0} tasks in it.
          </>
        }
        requireConfirmationText={target}
        confirmLabel="Delete Task Pool"
        pendingLabel="Deleting…"
        isConfirming={remove.isPending}
        errorTitle="Could not delete the task pool"
        errorMessage={remove.error && getErrorMessage(remove.error)}
      />
    </div>
  );
}
