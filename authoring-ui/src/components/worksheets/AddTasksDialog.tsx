import { useMemo, useState } from "react";
import type { Task } from "@api";
import { useSelection } from "@hooks/ui";
import { Alert } from "@components/ui/Alert";
import { Button } from "@components/ui/Button";
import { DataTable, type DataTableColumn } from "@components/ui/DataTable";
import { Modal } from "@components/ui/Modal";
import { Switch } from "@components/ui/Switch";
import { getErrorMessage } from "@/lib/errorMessage";
import { taskKey } from "./taskOrder";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Every task of every pool. */
  tasks: Task[] | undefined;
  isLoading: boolean;
  error: unknown;
  /** Tasks already on the worksheet; they cannot be added twice. */
  selectedTasks: Task[];
  onAdd: (tasks: Task[]) => void;
}

const columns: DataTableColumn<Task>[] = [
  {
    key: "name",
    header: "Task",
    sortValue: (task) => task.name,
    filterValue: (task) => task.name,
    cell: (task) => <span className="font-medium">{task.name}</span>,
  },
  {
    key: "pool",
    header: "Pool",
    sortValue: (task) => task.pool,
    filterValue: (task) => task.pool,
    cell: (task) => task.pool,
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
];

export function AddTasksDialog(props: Props) {
  // Unmounting on close clears the checked rows.
  if (!props.open) return null;
  return <AddTasksDialogPanel {...props} />;
}

function AddTasksDialogPanel({
  onClose,
  tasks,
  isLoading,
  error,
  selectedTasks,
  onAdd,
}: Props) {
  const selection = useSelection();
  const [hideSelected, setHideSelected] = useState(true);

  const alreadyAdded = useMemo(
    () => new Set(selectedTasks.map(taskKey)),
    [selectedTasks],
  );

  const rows = useMemo(
    () =>
      hideSelected
        ? tasks?.filter((task) => !alreadyAdded.has(taskKey(task)))
        : tasks,
    [tasks, hideSelected, alreadyAdded],
  );

  const add = () => {
    onAdd(
      (tasks ?? []).filter(
        (task) =>
          selection.selected.has(taskKey(task)) &&
          !alreadyAdded.has(taskKey(task)),
      ),
    );
  };

  const count = selection.selected.size;

  return (
    <Modal
      open
      onClose={onClose}
      title="Add tasks"
      description="Choose tasks from any pool. They are added at the end of the worksheet."
      size="wide"
      fixedHeight
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={add} disabled={count === 0}>
            {count === 0
              ? "Add Tasks"
              : `Add ${count} ${count === 1 ? "Task" : "Tasks"}`}
          </Button>
        </>
      }
    >
      {error != null && (
        <Alert title="Could not load the tasks" className="mb-4">
          {getErrorMessage(error)}
        </Alert>
      )}
      <DataTable
        rows={rows}
        columns={columns}
        getRowId={taskKey}
        rowLabel={taskKey}
        isLoading={isLoading}
        emptyMessage="There are no tasks in any pool yet."
        noMatchMessage="No matching tasks."
        filterPlaceholder="Filter by task or pool…"
        initialSort={{ key: "pool", direction: "asc" }}
        pageSizeStorageKey="e2xauthoring.addTasks.pageSize"
        selection={{
          ...selection,
          isRowSelectable: (task) => !alreadyAdded.has(taskKey(task)),
        }}
        toolbar={
          <Switch
            checked={hideSelected}
            onChange={setHideSelected}
            label="Hide tasks already on the worksheet"
          />
        }
      />
    </Modal>
  );
}
