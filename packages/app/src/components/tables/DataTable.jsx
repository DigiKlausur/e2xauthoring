import React from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";

export default function DataTable(props) {
  const [pageSize, setPageSize] = React.useState(10);

  return (
    <DataGrid
      {...props}
      density="compact"
      autoHeight
      pagination
      pageSize={pageSize}
      rowsPerPageOptions={[5, 10, 20, 50, 100]}
      onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
      disableSelectionOnClick
      disableColumnFilter
      disableColumnSelector
      disableDensitySelector
      components={{ Toolbar: GridToolbar }}
      componentsProps={{
        toolbar: {
          showQuickFilter: true,
          quickFilterProps: { debounceMs: 500 },
        },
      }}
    />
  );
}
