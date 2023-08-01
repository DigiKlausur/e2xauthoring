import React from "react";

import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditIcon from "@mui/icons-material/Edit";
import GitHubIcon from "@mui/icons-material/GitHub";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DataTable from "../../tables/DataTable";
import API from "@e2xauthoring/api";

import { GridActionsCellItem } from "@mui/x-data-grid";
import TurnIntoRepoDialog from "../dialogs/TurnIntoRepoDialog";
import EditTaskPoolDialog from "../dialogs/EditTaskPoolDialog";
import { getPoolUrl } from "../../../utils/urls";
import NavLink from "../../nav/NavLink";
import CopyTaskPoolDialog from "../dialogs/CopyTaskPoolDialog";

export default function TaskPoolTable() {
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [openEdit, setOpenEdit] = React.useState(false);
  const [openCopy, setOpenCopy] = React.useState(false);
  const [selectedPool, setSelectedPool] = React.useState("");

  const load = () => {
    setLoading(true);
    API.pools.list().then((message) => {
      if (!message.success) {
        alert(message.error);
      } else {
        setRows(message.data);
        setLoading(false);
      }
    });
  };

  React.useEffect(() => {
    load();
  }, []);

  const deletePool = React.useCallback((pool) => () => {
    if (
      window.confirm(
        "Are you sure you want to delete the task pool " + pool + "?"
      )
    ) {
      API.pools.remove(pool).then((message) => {
        if (!message.success) {
          alert(message.error);
        }
        load();
      });
    }
  });

  const editPool = React.useCallback((pool) => () => {
    setSelectedPool(pool);
    setOpenEdit(true);
  });

  const copyPool = React.useCallback((pool) => () => {
    setSelectedPool(pool);
    setOpenCopy(true);
  });

  const turnPoolIntoRepo = React.useCallback((pool) => () => {
    setSelectedPool(pool);
    setOpen(true);
  });

  const columns = React.useMemo(
    () => [
      {
        field: "name",
        headerName: "Name",
        flex: 2,
        renderCell: (params) => (
          <NavLink to={getPoolUrl(params.row.name)}>{params.row.name}</NavLink>
        ),
      },
      {
        field: "tasks",
        headerName: "# Tasks",
        flex: 1,
      },
      {
        field: "is_repo",
        headerName: "Version Control",
        flex: 1,
        valueGetter: (params) => `${params.row.is_repo ? "Yes" : "No"}`,
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
            title="Rename Task Pool"
            color="primary"
            onClick={editPool(params.row.name)}
          />,
          <GridActionsCellItem
            key="copy"
            icon={<ContentCopyIcon />}
            label="Copy"
            title="Copy Task Pool"
            color="primary"
            onClick={copyPool(params.row.name)}
          />,
          <GridActionsCellItem
            key="repo"
            icon={<GitHubIcon />}
            label="Turn into repository"
            title="Turn into repository"
            color="primary"
            disabled={params.row.is_repo}
            onClick={turnPoolIntoRepo(params.row.name)}
          />,
          <GridActionsCellItem
            key="del"
            icon={<DeleteForeverIcon />}
            label="Delete"
            title="Delete Task Pool"
            color="error"
            onClick={deletePool(params.row.name)}
          />,
        ],
      },
    ],
    [deletePool]
  );

  return (
    <>
      <DataTable
        rows={rows}
        loading={loading}
        columns={columns}
        getRowId={(row) => row.name}
      />
      <TurnIntoRepoDialog
        open={open}
        setOpen={setOpen}
        pool={selectedPool}
        reload={load}
      />
      <EditTaskPoolDialog
        open={openEdit}
        setOpen={setOpenEdit}
        pool={selectedPool}
        reload={load}
      />
      <CopyTaskPoolDialog
        open={openCopy}
        setOpen={setOpenCopy}
        pool={selectedPool}
        reload={load}
      />
    </>
  );
}
