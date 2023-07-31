import React from "react";
import DataTable from "./DataTable";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { GridActionsCellItem } from "@mui/x-data-grid";
import API from "@e2xauthoring/api";

export default function WorksheetsTable({ assignment }) {
  const [loading, setLoading] = React.useState(true);
  const [rows, setRows] = React.useState([]);
  const load = () => {
    setLoading(true);
    API.worksheets.list(assignment).then((message) => {
      if (!message.success) {
        alert(message.error);
      }
      setRows(message.data);
      setLoading(false);
    });
  };

  React.useEffect(() => {
    load();
  }, []);

  const deleteWorksheet = React.useCallback((assignment, name) => () => {
    if (
      window.confirm(
        "Are you sure you want to delete the worksheet " + name + "?"
      )
    ) {
      API.worksheets.remove(name, assignment).then((message) => {
        if (!message.success) {
          alert(message.error);
        }
        load();
      });
    }
  });

  const columns = React.useMemo(
    () => [
      {
        field: "name",
        headerName: "Name",
        flex: 2,
      },
      {
        field: "actions",
        type: "actions",
        flex: 1,
        getActions: (params) => [
          <GridActionsCellItem
            key="del"
            icon={<DeleteForeverIcon />}
            label="Delete"
            color="error"
            onClick={deleteWorksheet(assignment, params.row.name)}
          />,
        ],
      },
    ],
    [deleteWorksheet]
  );

  return (
    <DataTable
      rows={rows}
      loading={loading}
      columns={columns}
      getRowId={(row) => `${row.assignment}-${row.name}`}
    />
  );
}
