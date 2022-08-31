import React from "react";

import { DataGrid, GridToolbar } from "@mui/x-data-grid";

import { AuthoringAPI } from "@e2xauthoring/api";
import {
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
} from "@mui/material";
import SelectedTasksTable from "../tables/SelectedTasksTable";
import BaseDialog from "../dialogs/BaseDialog";

const taskInArray = (task, array) => {
  return array.find(
    (elem) => task.name === elem.name && task.pool === elem.pool
  );
};

function TaskSelectionTable({ tasks, setChecked, selectedTasks }) {
  const [pageSize, setPageSize] = React.useState(8);
  const [hideSelectedTasks, setHideSelectedTasks] = React.useState(true);
  const filterTasks = (_tasks) => {
    if (hideSelectedTasks) {
      return _tasks.filter((task) => !taskInArray(task, selectedTasks));
    } else {
      return _tasks;
    }
  };
  const columns = [
    {
      field: "name",
      headerName: "Task",
      flex: 2,
    },
    {
      field: "pool",
      headerName: "Pool",
      flex: 2,
    },
    {
      field: "questions",
      headerName: "# Questions",
      flex: 1,
    },
    {
      field: "points",
      headerName: "Points",
      flex: 1,
    },
  ];
  return (
    <>
      <FormControlLabel
        control={
          <Checkbox
            onChange={(event) => setHideSelectedTasks(event.target.checked)}
            checked={hideSelectedTasks}
          />
        }
        label="Hide selected tasks"
      />
      <DataGrid
        columns={columns}
        rows={filterTasks(tasks)}
        checkboxSelection
        disableSelectionOnClick
        getRowId={(row) => `${row.name}-${row.pool}`}
        autoHeight
        sx={{ minWidth: "800px" }}
        isRowSelectable={(params) => !taskInArray(params.row, selectedTasks)}
        pagination
        pageSize={pageSize}
        rowsPerPageOptions={[4, 8, 16, 32, 64]}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        onSelectionModelChange={(item) => setChecked(item)}
        density="compact"
        disableDensitySelector
        components={{ Toolbar: GridToolbar }}
        componentsProps={{
          toolbar: {
            showQuickFilter: true,
            showExport: false,

            quickFilterProps: { debounceMs: 500 },
          },
        }}
      />
    </>
  );
}

function AddTasksDialog({ tasks, selectedTasks, setSelectedTasks }) {
  const [open, setOpen] = React.useState(false);
  const [checked, setChecked] = React.useState([]);

  const handleSubmit = () => {
    let newTasks = tasks.filter((task) =>
      checked.includes(`${task.name}-${task.pool}`)
    );
    newTasks = newTasks.filter((task) => !taskInArray(task, selectedTasks));
    setSelectedTasks((prev) => [...prev, ...newTasks]);
    setOpen(false);
  };

  return (
    <>
      <BaseDialog
        open={open}
        handleClose={() => setOpen(false)}
        title="Add tasks"
        actions={
          <Button variant="contained" color="success" onClick={handleSubmit}>
            Add Tasks
          </Button>
        }
      >
        <TaskSelectionTable
          tasks={tasks}
          setChecked={setChecked}
          selectedTasks={selectedTasks}
        />
      </BaseDialog>
      <Button variant="contained" onClick={() => setOpen(true)} sx={{ mt: 1 }}>
        Add Tasks
      </Button>
    </>
  );
}

export default function SelectTasks({ selectedTasks, setSelectedTasks }) {
  const api = new AuthoringAPI(window.base_url);
  const [loading, setLoading] = React.useState(true);
  const [tasks, setTasks] = React.useState([]);
  React.useEffect(() => {
    api.tasks.list().then((_tasks) => {
      setTasks(_tasks);
      setLoading(false);
    });
  }, []);

  return (
    <>
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <SelectedTasksTable
            selectedTasks={selectedTasks}
            setSelectedTasks={setSelectedTasks}
          />
          <AddTasksDialog
            tasks={tasks}
            selectedTasks={selectedTasks}
            setSelectedTasks={setSelectedTasks}
          />
        </>
      )}
    </>
  );
}
