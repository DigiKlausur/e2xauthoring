import React from "react";

import {
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import DeleteIcon from "@mui/icons-material/Delete";

export default function SelectedTasksTable({
  selectedTasks,
  setSelectedTasks,
}) {
  const findIndex = (task) => {
    return selectedTasks.findIndex(
      (_task) => task.name === _task.name && task.pool === _task.pool
    );
  };
  const moveSelectedTask = (from, to) => {
    if (from !== to && from >= 0 && to >= 0) {
      let newTasks = [...selectedTasks];
      newTasks.splice(to, 0, newTasks.splice(from, 1)[0]);
      setSelectedTasks(newTasks);
    }
  };
  const handleMoveUp = React.useCallback((task) => () => {
    let currentIndex = findIndex(task);
    moveSelectedTask(currentIndex, currentIndex - 1);
  });
  const handleMoveTop = React.useCallback((task) => () => {
    let currentIndex = findIndex(task);
    moveSelectedTask(currentIndex, 0);
  });
  const handleMoveDown = React.useCallback((task) => () => {
    let currentIndex = findIndex(task);
    moveSelectedTask(currentIndex, currentIndex + 1);
  });
  const handleMoveBottom = React.useCallback((task) => () => {
    let currentIndex = findIndex(task);
    moveSelectedTask(currentIndex, selectedTasks.length);
  });
  const handleDelete = React.useCallback((task) => () => {
    let newTasks = [...selectedTasks];
    newTasks.splice(findIndex(task), 1);
    setSelectedTasks(newTasks);
  });
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>
            <Typography sx={{ fontWeight: "bold" }}>Task</Typography>
          </TableCell>
          <TableCell>
            <Typography sx={{ fontWeight: "bold" }}>Pool</Typography>
          </TableCell>
          <TableCell>
            <Typography sx={{ fontWeight: "bold" }}># Questions</Typography>
          </TableCell>
          <TableCell>
            <Typography sx={{ fontWeight: "bold" }}>Points</Typography>
          </TableCell>
          <TableCell>
            <Typography sx={{ fontWeight: "bold" }}>Actions</Typography>
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {selectedTasks.length > 0 ? (
          selectedTasks.map((task) => (
            <TableRow key={task.name}>
              <TableCell>{task.name}</TableCell>
              <TableCell>{task.pool}</TableCell>
              <TableCell>{task.n_questions}</TableCell>
              <TableCell>{task.points}</TableCell>
              <TableCell>
                <IconButton onClick={handleMoveBottom(task)}>
                  <KeyboardDoubleArrowDownIcon />
                </IconButton>
                <IconButton onClick={handleMoveDown(task)}>
                  <KeyboardArrowDownIcon />
                </IconButton>
                <IconButton onClick={handleMoveUp(task)}>
                  <KeyboardArrowUpIcon />
                </IconButton>
                <IconButton onClick={handleMoveTop(task)}>
                  <KeyboardDoubleArrowUpIcon />
                </IconButton>
                <IconButton onClick={handleDelete(task)} color="error">
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={5}>No Tasks Selected</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
