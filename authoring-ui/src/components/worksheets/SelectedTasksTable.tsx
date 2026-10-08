import {
  useRef,
  useState,
  type Dispatch,
  type DragEvent,
  type KeyboardEvent,
  type SetStateAction,
} from "react";
import { ChevronDown, ChevronUp, GripVertical, Trash2 } from "lucide-react";
import type { Task } from "@api";
import { IconButton } from "@components/ui/IconButton";
import { moveBefore, taskKey } from "./taskOrder";

interface Props {
  tasks: Task[];
  setTasks: Dispatch<SetStateAction<Task[]>>;
}

const cell = "border-t border-gray-200 px-3 py-2.5 text-sm";

/**
 * The tasks of the worksheet in order. Tasks are reordered by dragging the
 * handle, with the arrow keys on the focused handle, with the up/down buttons
 * or by typing a new position.
 */
export function SelectedTasksTable({ tasks, setTasks }: Props) {
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  // Index of the row the dragged task would be inserted in front of.
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const move = (from: number, before: number) =>
    setTasks((current) => moveBefore(current, from, before));

  const moveToPosition = (from: number, position: number) => {
    const to = position - 1;
    move(from, to > from ? to + 1 : to);
  };

  const remove = (index: number) =>
    setTasks((current) => current.filter((_, i) => i !== index));

  const resetDrag = () => {
    setDragIndex(null);
    setDropIndex(null);
  };

  const handleDragStart = (index: number) => (event: DragEvent) => {
    const key = taskKey(tasks[index]);
    const row = rowRefs.current[key];
    event.dataTransfer.effectAllowed = "move";
    // Firefox only starts a drag if some data is set.
    event.dataTransfer.setData("text/plain", key);
    if (row) event.dataTransfer.setDragImage(row, 20, row.offsetHeight / 2);
    setDragIndex(index);
  };

  const handleDragOver =
    (index: number) => (event: DragEvent<HTMLTableRowElement>) => {
      if (dragIndex === null) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      const rect = event.currentTarget.getBoundingClientRect();
      const inUpperHalf = event.clientY < rect.top + rect.height / 2;
      setDropIndex(inUpperHalf ? index : index + 1);
    };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    if (dragIndex !== null && dropIndex !== null) move(dragIndex, dropIndex);
    resetDrag();
  };

  const handleKeyDown = (index: number) => (event: KeyboardEvent) => {
    const targets: Record<string, number> = {
      ArrowUp: index - 1,
      ArrowDown: index + 2,
      Home: 0,
      End: tasks.length,
    };
    if (event.key in targets) {
      event.preventDefault();
      move(index, targets[event.key]);
    }
  };

  // Draws the insertion line on the edge of the row the task would land at.
  // Dropping directly above or below the dragged row changes nothing.
  const dropIndicator = (index: number) => {
    if (
      dragIndex === null ||
      dropIndex === null ||
      dropIndex === dragIndex ||
      dropIndex === dragIndex + 1
    ) {
      return "";
    }
    if (dropIndex === index)
      return "shadow-[inset_0_2px_0_var(--color-primary)]";
    if (index === tasks.length - 1 && dropIndex === tasks.length) {
      return "shadow-[inset_0_-2px_0_var(--color-primary)]";
    }
    return "";
  };

  return (
    <div>
      {tasks.length > 1 && (
        <p className="flex items-center gap-1 text-sm text-gray-500 mb-2">
          Drag tasks by
          <GripVertical className="size-4" />
          or click a task’s number to change its position.
        </p>
      )}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="w-10 px-3 py-2.5">
                <span className="sr-only">Reorder</span>
              </th>
              <th className="px-3 py-2.5 font-semibold">#</th>
              <th className="px-3 py-2.5 font-semibold">Task</th>
              <th className="px-3 py-2.5 font-semibold">Pool</th>
              <th className="px-3 py-2.5 font-semibold">Questions</th>
              <th className="px-3 py-2.5 font-semibold">Points</th>
              <th className="px-3 py-2.5 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody onDrop={handleDrop}>
            {tasks.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className={`${cell} text-center text-gray-500 py-6`}
                >
                  No tasks selected yet.
                </td>
              </tr>
            ) : (
              tasks.map((task, index) => (
                <tr
                  key={taskKey(task)}
                  ref={(el) => {
                    rowRefs.current[taskKey(task)] = el;
                  }}
                  onDragOver={handleDragOver(index)}
                  className={`hover:bg-gray-50 ${dragIndex === index ? "opacity-40" : ""} ${dropIndicator(index)}`}
                >
                  <td className={cell}>
                    <div
                      draggable
                      tabIndex={0}
                      role="button"
                      aria-label={`Reorder ${task.name}`}
                      title="Drag to reorder (or focus and use ↑ ↓ Home End)"
                      onDragStart={handleDragStart(index)}
                      onDragEnd={resetDrag}
                      onKeyDown={handleKeyDown(index)}
                      className={`flex justify-center text-gray-400 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${dragIndex === null ? "cursor-grab" : "cursor-grabbing"}`}
                    >
                      <GripVertical className="size-5" />
                    </div>
                  </td>
                  <td className={cell}>
                    <PositionCell
                      position={index + 1}
                      count={tasks.length}
                      onChange={(position) => moveToPosition(index, position)}
                    />
                  </td>
                  <td className={`${cell} font-medium`}>{task.name}</td>
                  <td className={cell}>{task.pool}</td>
                  <td className={cell}>{task.n_questions}</td>
                  <td className={cell}>{task.points}</td>
                  <td className={`${cell} text-right whitespace-nowrap`}>
                    <IconButton
                      label={`Move ${task.name} up`}
                      icon={<ChevronUp className="size-4" />}
                      disabled={index === 0}
                      onClick={() => move(index, index - 1)}
                    />
                    <IconButton
                      label={`Move ${task.name} down`}
                      icon={<ChevronDown className="size-4" />}
                      disabled={index === tasks.length - 1}
                      onClick={() => move(index, index + 2)}
                    />
                    <IconButton
                      label={`Remove ${task.name}`}
                      variant="danger"
                      icon={<Trash2 className="size-4" />}
                      onClick={() => remove(index)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Shows the 1-based position of a task. Clicking it lets the user type a new
 * position; Enter or leaving the field applies it, Escape cancels.
 */
function PositionCell({
  position,
  count,
  onChange,
}: {
  position: number;
  count: number;
  onChange: (position: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  // Guards against the blur that follows Enter / Escape when the input
  // unmounts, which would otherwise apply (or re-apply) the move.
  const doneRef = useRef(false);

  const startEditing = () => {
    doneRef.current = false;
    setValue(String(position));
    setEditing(true);
  };

  const finish = (apply: boolean) => {
    if (doneRef.current) return;
    doneRef.current = true;
    setEditing(false);
    const newPosition = parseInt(value, 10);
    if (apply && !Number.isNaN(newPosition)) {
      onChange(Math.min(Math.max(newPosition, 1), count));
    }
  };

  if (editing) {
    return (
      <input
        autoFocus
        type="number"
        min={1}
        max={count}
        aria-label="New position"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onBlur={() => finish(true)}
        onFocus={(event) => event.target.select()}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            finish(true);
          } else if (event.key === "Escape") {
            // Don't let Escape reach a surrounding dialog.
            event.stopPropagation();
            finish(false);
          }
        }}
        className="w-20 px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={startEditing}
      disabled={count < 2}
      title="Click to move to a specific position"
      aria-label={`Position ${position}. Click to change`}
      className="min-w-8 px-2 py-1 rounded-lg border border-transparent hover:border-gray-200 focus-visible:border-gray-200 focus:outline-none disabled:cursor-default"
    >
      {position}
    </button>
  );
}
