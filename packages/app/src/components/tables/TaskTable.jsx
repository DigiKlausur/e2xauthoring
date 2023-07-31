import React from "react";

import GitHubIcon from "@mui/icons-material/GitHub";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import DataTable from "./DataTable";

import { GridActionsCellItem } from "@mui/x-data-grid";

import API from "@e2xauthoring/api";
import CommitTaskDialog from "../dialogs/CommitTaskDialog";
import { getTaskUrl } from "../../utils/urls";
import NavLink from "../nav/NavLink";
import { Chip } from "@mui/material";

function GitStatus({ status }) {
  let color = "primary";
  let icon = <></>;
  if (status === "unchanged") {
    color = "success";
    icon = <TaskAltIcon />;
  } else if (status === "modified") {
    color = "warning";
    icon = <WarningAmberIcon />;
  } else if (status === "Not a git repo") {
    icon = <InfoOutlinedIcon />;
  }
  return (
    <Chip
      size="small"
      icon={icon}
      label={status}
      color={color}
      variant="outlined"
    />
  );
}

export default function TaskTable(props) {
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState({});

  const load = () => {
    setLoading(true);
    API.tasks.list(props.pool).then((message) => {
      if (message.success) {
        const tasks = message.data;
        setRows(tasks);
        setLoading(false);
      } else {
        alert(message.error);
        setLoading(false);
      }
    });
  };

  React.useEffect(() => {
    load();
  }, []);

  const deleteTask = React.useCallback(
    (pool, task) => () => {
      if (
        window.confirm(
          "Are you sure you want to delete " + pool + ", " + task + "?"
        )
      ) {
        API.tasks.remove(pool, task).then((message) => {
          if (!message.success) {
            alert(message.error);
          }
          load();
        });
      }
    },
    []
  );

  const commitTask = React.useCallback(
    (row) => () => {
      setSelectedRow(row);
      setOpen(true);
    },
    []
  );

  const git_status = (params) =>
    `${
      params.row.hasOwnProperty("git_status")
        ? params.row.git_status.status
        : "Not a git repo"
    }`;

  const columns = React.useMemo(
    () => [
      {
        field: "name",
        headerName: "Name",
        flex: 2,
        renderCell: (params) => (
          <NavLink to={getTaskUrl(params.row.pool, params.row.name)}>
            {params.row.name}
          </NavLink>
        ),
      },
      {
        field: "questions",
        headerName: "# Questions",
        flex: 1,
      },
      {
        field: "points",
        headerName: "# Total Points",
        flex: 1,
      },
      {
        field: "version_control",
        headerName: "Version Control",
        flex: 1,
        valueGetter: (params) => git_status(params),
        renderCell: (params) => <GitStatus status={git_status(params)} />,
      },
      {
        field: "actions",
        type: "actions",
        flex: 1,
        getActions: (params) => [
          <GridActionsCellItem
            icon={<DeleteForeverIcon />}
            color="error"
            label="Delete"
            onClick={deleteTask(params.row.pool, params.row.name)}
          />,
          <>
            {params.row.hasOwnProperty("git_status") ? (
              <GridActionsCellItem
                icon={<GitHubIcon />}
                color="primary"
                label="Commit"
                disabled={params.row.git_status.status === "unchanged"}
                onClick={commitTask(params.row)}
              />
            ) : (
              <></>
            )}
          </>,
        ],
      },
    ],
    [deleteTask]
  );

  return (
    <>
      <DataTable
        rows={rows}
        {...props}
        columns={columns}
        loading={loading}
        getRowId={(row) => row.name}
      />
      <CommitTaskDialog
        open={open}
        setOpen={setOpen}
        reload={load}
        row={selectedRow}
      />
    </>
  );
}
