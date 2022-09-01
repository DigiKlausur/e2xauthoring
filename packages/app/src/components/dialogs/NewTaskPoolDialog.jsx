import React from "react";
import { useFormik } from "formik";
import { FormikTextField, FormikCheckbox } from "../forms/form-components";
import { baseSchema } from "../forms/validation-schemas";
import { AuthoringAPI } from "@e2xauthoring/api";
import { useNavigate } from "react-router-dom";
import { getPoolUrl } from "../../utils/urls";
import { Stack } from "@mui/material";

import { FormDialogWithButton } from "./form-dialogs";

export default function NewTaskPoolDialog() {
  const api = new AuthoringAPI(window.base_url);
  const navigate = useNavigate();
  const formik = useFormik({
    initialValues: {
      name: "",
      initRepo: false,
    },
    validationSchema: baseSchema,
    onSubmit: (values) => {
      api.pools.new(values.name, values.initRepo).then((status) => {
        if (!status["success"]) {
          alert(status["error"]);
        } else {
          navigate(getPoolUrl(values.name));
        }
      });
    },
  });

  return (
    <FormDialogWithButton
      title="Create a new task pool"
      buttonText="Add Task Pool"
      handleSubmit={formik.handleSubmit}
      isSubmitting={formik.isSubmitting}
    >
      <form onSubmit={formik.handleSubmit}>
        <Stack spacing={2} sx={{ width: "30ch" }}>
          <FormikTextField formik={formik} name="name" label="Pool Name" />
          <FormikCheckbox
            formik={formik}
            name="initRepo"
            label="Initialize as git repository"
          />
        </Stack>
      </form>
    </FormDialogWithButton>
  );
}
