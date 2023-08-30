import React from "react";
import DataTable from "../../tables/DataTable";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { GridActionsCellItem } from "@mui/x-data-grid";
import API from "@e2xauthoring/api";
import { useConfirm } from "material-ui-confirm";

export default function WorksheetsTable({ assignment }) {
  const confirm = useConfirm();
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
    confirm({
      description: `Are you sure you want to delete the worksheet ${name} from assignment ${assignment}?`,
      title: "Delete Worksheet",
    }).then(() => {
      API.worksheets.remove(name, assignment).then((message) => {
        if (!message.success) {
          alert(message.error);
        }
        load();
      });
    });
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
            title="Delete Worksheet"
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
      initialSort={{ field: "name", sort: "asc" }}
    />
  );
}
