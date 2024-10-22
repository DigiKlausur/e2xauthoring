import React from "react";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import {
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

import API from "@e2xauthoring/api";
import { FormDialogWithButton } from "../../dialogs/form-dialogs";
import { FormikTextField } from "../../forms/form-components";
import { baseSchema } from "../../forms/validation-schemas";
import { getTaskUrl } from "../../../utils/urls";

export default function NewTaskDialog({ pool }) {
  const navigate = useNavigate();
  const [kernels, setKernels] = React.useState({});

  const formik = useFormik({
    initialValues: {
      name: "",
      kernel: "",
    },
    validationSchema: baseSchema,
    onSubmit: (values) => {
      API.tasks.create(pool, values.name, values.kernel).then((status) => {
        if (!status.success) {
          alert(status.error);
        } else {
          navigate(getTaskUrl(pool, values.name));
        }
      });
    },
  });

  React.useEffect(() => {
    API.kernels.list().then((_kernels) => {
      setKernels(_kernels);
      if (
        Object.keys(_kernels).length > 0 &&
        formik.values.kernel.length === 0
      ) {
        formik.setFieldValue("kernel", Object.keys(_kernels)[0]);
      }
    });
  }, [formik]);

  return (
    <FormDialogWithButton
      title="Create a new task"
      buttonText="Add Task"
      handleSubmit={formik.handleSubmit}
      isSubmitting={formik.isSubmitting}
    >
      <form onSubmit={formik.handleSubmit}>
        <Stack spacing={2} sx={{ width: "30ch" }}>
          <FormikTextField formik={formik} name="name" label="Task Name" />
          <FormControl>
            <InputLabel id="kernel-label">Kernel</InputLabel>
            <Select
              labelId="kernel-label"
              label="Kernel"
              value={formik.values.kernel}
              onChange={formik.handleChange}
              name="kernel"
            >
              {Object.keys(kernels).map((kernel) => (
                <MenuItem key={kernel} value={kernel}>
                  {kernels[kernel].spec.display_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </form>
    </FormDialogWithButton>
  );
}
