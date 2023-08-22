import React from "react";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { Stack } from "@mui/material";

import API from "@e2xauthoring/api";

import { FormDialogWithButton } from "../../dialogs/form-dialogs";
import { FormikTextField } from "../../forms/form-components";
import { baseSchema } from "../../forms/validation-schemas";
import { getTemplateUrl } from "../../../utils/urls";

export default function NewTemplateDialog() {
  const navigate = useNavigate();
  const formik = useFormik({
    initialValues: {
      name: "",
    },
    validationSchema: baseSchema,
    onSubmit: (values) => {
      API.templates.create(values.name).then((status) => {
        if (!status.success) {
          alert(status.error);
        } else {
          navigate(getTemplateUrl(values.name));
        }
      });
    },
  });

  return (
    <FormDialogWithButton
      title="Create a new template"
      buttonText="Add Template"
      handleSubmit={formik.handleSubmit}
      isSubmitting={formik.isSubmitting}
    >
      <form onSubmit={formik.handleSubmit}>
        <Stack spacing={2} sx={{ width: "30ch" }}>
          <FormikTextField formik={formik} name="name" label="Template Name" />
        </Stack>
      </form>
    </FormDialogWithButton>
  );
}
