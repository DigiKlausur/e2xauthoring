import React from "react";

import GitHubIcon from "@mui/icons-material/GitHub";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditIcon from "@mui/icons-material/Edit";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DataTable from "../../tables/DataTable";

import { GridActionsCellItem } from "@mui/x-data-grid";

import API from "@e2xauthoring/api";
import CommitTaskDialog from "../dialogs/CommitTaskDialog";
import EditTaskDialog from "../dialogs/EditTaskDialog";
import { getTaskUrl } from "../../../utils/urls";
import NavLink from "../../nav/NavLink";
import { Chip } from "@mui/material";
import CopyTaskDialog from "../dialogs/CopyTaskDialog";
import { useConfirm } from "material-ui-confirm";

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
  const confirm = useConfirm();
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [openEdit, setOpenEdit] = React.useState(false);
  const [openCopy, setOpenCopy] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState({});

  const load = React.useCallback(() => {
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
  }, [props.pool]);

  React.useEffect(() => {
    load();
  }, [load]);

  const deleteTask = React.useCallback(
    (pool, task) => () => {
      confirm({
        description: `Are you sure you want to delete the task ${task} from pool ${pool}?`,
        title: "Delete Task",
      }).then(() => {
        API.tasks.remove(pool, task).then((message) => {
          if (!message.success) {
            alert(message.error);
          }
          load();
        });
      });
    },
    [confirm, load]
  );

  const editTask = React.useCallback(
    (row) => () => {
      setSelectedRow(row);
      setOpenEdit(true);
    },
    []
  );

  const copyTask = React.useCallback(
    (row) => () => {
      setSelectedRow(row);
      setOpenCopy(true);
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
        field: "n_questions",
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
            key="edit"
            icon={<EditIcon />}
            label="Edit"
            title="Rename Task"
            color="primary"
            onClick={editTask(params.row)}
          />,
          <GridActionsCellItem
            key="copy"
            icon={<ContentCopyIcon />}
            label="Copy"
            title="Copy Task"
            color="primary"
            onClick={copyTask(params.row)}
          />,
          <>
            {params.row.hasOwnProperty("git_status") ? (
              <GridActionsCellItem
                title="Commit"
                key="commit"
                icon={<GitHubIcon />}
                color="primary"
                label="Commit Task"
                disabled={params.row.git_status.status === "unchanged"}
                onClick={commitTask(params.row)}
              />
            ) : (
              <></>
            )}
          </>,
          <GridActionsCellItem
            key="del"
            icon={<DeleteForeverIcon />}
            color="error"
            label="Delete"
            title="Delete Task"
            onClick={deleteTask(params.row.pool, params.row.name)}
          />,
        ],
      },
    ],
    [deleteTask, editTask, commitTask, copyTask]
  );

  return (
    <>
      <DataTable
        rows={rows}
        {...props}
        columns={columns}
        loading={loading}
        getRowId={(row) => row.name}
        initialSort={{ field: "name", sort: "asc" }}
      />
      <CommitTaskDialog
        open={open}
        setOpen={setOpen}
        reload={load}
        row={selectedRow}
      />
      <EditTaskDialog
        open={openEdit}
        setOpen={setOpenEdit}
        reload={load}
        row={selectedRow}
      />
      <CopyTaskDialog
        open={openCopy}
        setOpen={setOpenCopy}
        reload={load}
        row={selectedRow}
      />
    </>
  );
}
