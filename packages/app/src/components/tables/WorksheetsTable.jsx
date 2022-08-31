import React from "react";
import DataTable from "./DataTable";

import { AuthoringAPI } from "@e2xauthoring/api";

export default function WorksheetsTable({ assignment }) {
  const api = new AuthoringAPI(window.base_url);
  const [loading, setLoading] = React.useState(true);
  const [rows, setRows] = React.useState([]);
  const load = () => {
    setLoading(true);
    api.worksheets.list(assignment).then((assignments) => {
      setRows(assignments);
      setLoading(false);
    });
  };

  React.useEffect(() => {
    load();
  }, []);

  const columns = React.useMemo(() => [
    {
      field: "name",
      headerName: "Name",
      flex: 2,
    },
  ]);

  return (
    <DataTable
      rows={rows}
      loading={loading}
      columns={columns}
      getRowId={(row) => `${row.assignment}-${row.name}`}
    />
  );
}
