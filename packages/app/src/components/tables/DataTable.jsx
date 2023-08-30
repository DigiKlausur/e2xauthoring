import React, { useContext } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import SettingsContext from "../../settings/SettingsContext";

export default function DataTable(props) {
  const { settings, setSettings } = useContext(SettingsContext);

  const getInitialState = (props) => {
    if (!props.initialSort) {
      return {};
    }
    return {
      sorting: {
        sortModel: [props.initialSort],
      },
    };
  };

  return (
    <DataGrid
      {...props}
      density="compact"
      autoHeight
      pagination
      pageSize={settings.pageSize}
      rowsPerPageOptions={[5, 10, 20, 50, 100]}
      onPageSizeChange={(newPageSize) =>
        setSettings({ ...settings, pageSize: newPageSize })
      }
      sortingOrder={["asc", "desc", null]}
      initialState={getInitialState(props)}
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
