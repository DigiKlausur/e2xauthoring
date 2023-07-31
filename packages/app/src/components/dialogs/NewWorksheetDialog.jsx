import React from "react";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { Stack } from "@mui/material";

import { urlJoin } from "@e2xauthoring/api";

import { FormDialogWithButton } from "./form-dialogs";
import { FormikTextField } from "../forms/form-components";
import { baseSchema } from "../forms/validation-schemas";
import { getAssignmentUrl } from "../../utils/urls";

export default function NewWorksheetDialog({ assignment }) {
  const navigate = useNavigate();
  const formik = useFormik({
    initialValues: {
      name: "",
    },
    validationSchema: baseSchema,
    onSubmit: (values) => {
      navigate(urlJoin(getAssignmentUrl(assignment), "new", values.name));
    },
  });

  return (
    <FormDialogWithButton
      title="Create a new worksheet"
      buttonText="Add Worksheet"
      handleSubmit={formik.handleSubmit}
      isSubmitting={formik.isSubmitting}
    >
      <form onSubmit={formik.handleSubmit}>
        <Stack spacing={2} sx={{ width: "30ch" }}>
          <FormikTextField formik={formik} name="name" label="Worksheet Name" />
        </Stack>
      </form>
    </FormDialogWithButton>
  );
}
