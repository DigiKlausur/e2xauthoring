import React from "react";

import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditIcon from "@mui/icons-material/Edit";
import DataTable from "./DataTable";

import API from "@e2xauthoring/api";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { getTemplateUrl } from "../../utils/urls";
import NavLink from "../nav/NavLink";

export default function TemplateTable() {
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const load = () => {
    setLoading(true);
    API.templates.list().then((message) => {
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

  const deleteTemplate = React.useCallback((template) => () => {
    if (
      window.confirm(
        "Are you sure you want to delete the template " + template + "?"
      )
    ) {
      API.templates.remove(template).then((message) => {
        if (!message.success) {
          alert(message.error);
        }
        load();
      });
    }
  });

  const editTemplate = React.useCallback((pool) => () => {
    alert("Edit " + pool);
  });

  const columns = React.useMemo(
    () => [
      {
        field: "name",
        headerName: "Name",
        flex: 2,
        renderCell: (params) => (
          <NavLink to={getTemplateUrl(params.row.name)}>
            {params.row.name}
          </NavLink>
        ),
      },
      {
        field: "actions",
        type: "actions",
        flex: 1,
        getActions: (params) => [
          <GridActionsCellItem
            icon={<DeleteForeverIcon />}
            label="Delete"
            color="error"
            onClick={deleteTemplate(params.row.name)}
          />,
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            color="primary"
            onClick={editTemplate(params.row.name)}
          />,
        ],
      },
    ],
    [deleteTemplate]
  );

  return (
    <DataTable
      rows={rows}
      loading={loading}
      columns={columns}
      getRowId={(row) => row.name}
    />
  );
}
