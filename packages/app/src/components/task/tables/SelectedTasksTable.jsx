import React from "react";

import {
  Box,
  ButtonBase,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import DeleteIcon from "@mui/icons-material/Delete";

const taskKey = (task) => `${task.pool}/${task.name}`;

// Moves the element at index `from` so that it ends up in front of the
// element that is currently at index `before` (0 <= before <= length).
const moveBefore = (array, from, before) => {
  const to = before > from ? before - 1 : before;
  if (from === to || from < 0 || to < 0 || to >= array.length) {
    return array;
  }
  const result = [...array];
  result.splice(to, 0, result.splice(from, 1)[0]);
  return result;
};

const headerCell = (label, props = {}) => (
  <TableCell {...props}>
    <Typography sx={{ fontWeight: "bold" }}>{label}</Typography>
  </TableCell>
);

// Shows the 1-based position of a task. Clicking it lets the user type a
// new position; Enter or leaving the field applies it, Escape cancels.
function PositionCell({ position, count, onChange }) {
  const [editing, setEditing] = React.useState(false);
  const [value, setValue] = React.useState("");
  // Guards against the blur that can follow Enter / Escape when the input
  // unmounts, which would otherwise apply (or re-apply) the move.
  const doneRef = React.useRef(false);

  const startEditing = () => {
    doneRef.current = false;
    setValue(String(position));
    setEditing(true);
  };

  const finish = (apply) => {
    if (doneRef.current) {
      return;
    }
    doneRef.current = true;
    setEditing(false);
    const newPosition = parseInt(value, 10);
    if (apply && !Number.isNaN(newPosition)) {
      onChange(Math.min(Math.max(newPosition, 1), count));
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      finish(true);
    } else if (event.key === "Escape") {
      // Don't let Escape close the surrounding dialog
      event.stopPropagation();
      finish(false);
    }
  };

  if (editing) {
    return (
      <TextField
        autoFocus
        size="small"
        type="number"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onBlur={() => finish(true)}
        onKeyDown={handleKeyDown}
        onFocus={(event) => event.target.select()}
        inputProps={{ min: 1, max: count, "aria-label": "New position" }}
        sx={{ width: "5.5em" }}
      />
    );
  }

  return (
    <Tooltip title="Click to move to a specific position" enterDelay={700}>
      <ButtonBase
        onClick={startEditing}
        disabled={count < 2}
        sx={{
          minWidth: "2em",
          px: 1,
          py: 0.5,
          borderRadius: 1,
          font: "inherit",
          border: 1,
          borderColor: "transparent",
          "&:hover, &:focus-visible": { borderColor: "divider" },
        }}
      >
        {position}
      </ButtonBase>
    </Tooltip>
  );
}

export default function SelectedTasksTable({
  selectedTasks,
  setSelectedTasks,
}) {
  const rowRefs = React.useRef({});
  const [dragIndex, setDragIndex] = React.useState(null);
  // Index of the row the dragged task would be inserted in front of
  const [dropIndex, setDropIndex] = React.useState(null);

  const move = (from, before) =>
    setSelectedTasks((tasks) => moveBefore(tasks, from, before));

  // Moves a task so that it ends up at `position` (1-based)
  const moveToPosition = (from, position) => {
    const to = position - 1;
    move(from, to > from ? to + 1 : to);
  };

  const remove = (index) =>
    setSelectedTasks((tasks) => tasks.filter((_, i) => i !== index));

  const resetDrag = () => {
    setDragIndex(null);
    setDropIndex(null);
  };

  const handleDragStart = (index) => (event) => {
    const row = rowRefs.current[taskKey(selectedTasks[index])];
    event.dataTransfer.effectAllowed = "move";
    // Firefox only starts a drag if some data is set
    event.dataTransfer.setData("text/plain", taskKey(selectedTasks[index]));
    if (row) {
      event.dataTransfer.setDragImage(row, 20, row.offsetHeight / 2);
    }
    setDragIndex(index);
  };

  const handleDragOver = (index) => (event) => {
    if (dragIndex === null) {
      return;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    const rect = event.currentTarget.getBoundingClientRect();
    const inUpperHalf = event.clientY < rect.top + rect.height / 2;
    setDropIndex(inUpperHalf ? index : index + 1);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    if (dragIndex !== null && dropIndex !== null) {
      move(dragIndex, dropIndex);
    }
    resetDrag();
  };

  const handleKeyDown = (index) => (event) => {
    const targets = {
      ArrowUp: index - 1,
      ArrowDown: index + 2,
      Home: 0,
      End: selectedTasks.length,
    };
    if (event.key in targets) {
      event.preventDefault();
      move(index, targets[event.key]);
    }
  };

  // Draw the insertion line on the edge of the row the task would land at.
  // Dropping directly above or below the dragged row changes nothing.
  const dropIndicator = (index) => {
    if (
      dragIndex === null ||
      dropIndex === null ||
      dropIndex === dragIndex ||
      dropIndex === dragIndex + 1
    ) {
      return {};
    }
    const line = (offset) => ({
      boxShadow: (theme) =>
        `inset 0 ${offset}px 0 ${theme.palette.primary.main}`,
    });
    if (dropIndex === index) {
      return line(2);
    }
    const isLast = index === selectedTasks.length - 1;
    if (isLast && dropIndex === selectedTasks.length) {
      return line(-2);
    }
    return {};
  };

  return (
    <>
      {selectedTasks.length > 1 && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}
        >
          Drag tasks by
          <DragIndicatorIcon fontSize="small" />
          or click a task's number to change its position.
        </Typography>
      )}
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox" />
            {headerCell("#")}
            {headerCell("Task")}
            {headerCell("Pool")}
            {headerCell("# Questions")}
            {headerCell("Points")}
            {headerCell("Actions", { align: "right" })}
          </TableRow>
        </TableHead>
        <TableBody onDrop={handleDrop}>
          {selectedTasks.length > 0 ? (
            selectedTasks.map((task, index) => (
              <TableRow
                key={taskKey(task)}
                ref={(el) => (rowRefs.current[taskKey(task)] = el)}
                onDragOver={handleDragOver(index)}
                hover
                sx={{
                  opacity: dragIndex === index ? 0.4 : 1,
                  ...dropIndicator(index),
                }}
              >
                <TableCell padding="checkbox">
                  <Tooltip
                    title="Drag to reorder (or focus and use ↑ ↓ Home End)"
                    enterDelay={700}
                  >
                    <Box
                      draggable
                      tabIndex={0}
                      role="button"
                      aria-label={`Reorder ${task.name}`}
                      onDragStart={handleDragStart(index)}
                      onDragEnd={resetDrag}
                      onKeyDown={handleKeyDown(index)}
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        cursor: dragIndex === null ? "grab" : "grabbing",
                        color: "text.secondary",
                        borderRadius: 1,
                        "&:focus-visible": {
                          outline: (theme) =>
                            `2px solid ${theme.palette.primary.main}`,
                        },
                      }}
                    >
                      <DragIndicatorIcon />
                    </Box>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <PositionCell
                    position={index + 1}
                    count={selectedTasks.length}
                    onChange={(position) => moveToPosition(index, position)}
                  />
                </TableCell>
                <TableCell>{task.name}</TableCell>
                <TableCell>{task.pool}</TableCell>
                <TableCell>{task.n_questions}</TableCell>
                <TableCell>{task.points}</TableCell>
                <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                  <Tooltip title="Move up">
                    <span>
                      <IconButton
                        size="small"
                        disabled={index === 0}
                        onClick={() => move(index, index - 1)}
                      >
                        <KeyboardArrowUpIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Move down">
                    <span>
                      <IconButton
                        size="small"
                        disabled={index === selectedTasks.length - 1}
                        onClick={() => move(index, index + 2)}
                      >
                        <KeyboardArrowDownIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Remove">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => remove(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7}>No Tasks Selected</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
}
