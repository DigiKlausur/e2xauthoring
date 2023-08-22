import React from "react";

import API from "@e2xauthoring/api";
import { Stack } from "@mui/system";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";

export default function WorksheetOptions({
  worksheetOptions,
  setWorksheetOptions,
}) {
  const [kernels, setKernels] = React.useState({});
  React.useEffect(() => {
    if (!worksheetOptions.hasOwnProperty("task-headers")) {
      setWorksheetOptions({ ...worksheetOptions, "task-headers": false });
    }
    API.kernels.list().then((_kernels) => {
      setKernels(_kernels);
      if (
        !worksheetOptions.hasOwnProperty("kernel") &&
        Object.keys(_kernels).length > 0
      ) {
        setWorksheetOptions({
          ...worksheetOptions,
          kernel: Object.keys(_kernels)[0],
        });
      }
    });
  }, []);

  return (
    <Stack spacing={2}>
      <FormControlLabel
        control={
          <Checkbox
            checked={worksheetOptions["task-headers"]}
            onChange={(event) =>
              setWorksheetOptions({
                ...worksheetOptions,
                "task-headers": event.target.checked,
              })
            }
          />
        }
        label="Add task headers"
      />
      <FormControl>
        <InputLabel id="kernel-label">Kernel</InputLabel>
        <Select
          labelId="kernel-label"
          label="Kernel"
          value={
            worksheetOptions.hasOwnProperty("kernel")
              ? worksheetOptions.kernel
              : "No kernel selected"
          }
          onChange={(event) =>
            setWorksheetOptions({
              ...worksheetOptions,
              kernel: event.target.value,
            })
          }
        >
          {Object.keys(kernels).map((kernel) => (
            <MenuItem key={kernel} value={kernel}>
              {kernels[kernel].spec.display_name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
}
