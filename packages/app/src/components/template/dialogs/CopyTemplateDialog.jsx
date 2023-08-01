import React from "react";

import API from "@e2xauthoring/api";

import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { useNavigate } from "react-router-dom";
import { getTemplateUrl } from "../../../utils/urls";

import { useFormik } from "formik";
import { FormDialogWithoutButton } from "../../dialogs/form-dialogs";
import { FormikTextField } from "../../forms/form-components";
import * as yup from "yup";

export default function CopyTemplateDialog({
  open,
  setOpen,
  reload,
  template,
}) {
  const navigate = useNavigate();
  const formik = useFormik({
    initialValues: {
      new_name: "",
    },
    validationSchema: yup.object({
      new_name: yup
        .string("Enter the name")
        .required()
        .min(3, "Name should have at least 3 characters")
        .matches(
          /^[A-Za-z\d]+[\w-]*$/,
          'Name can only consist of letters, digits, "-" and "_"!'
        ),
    }),
    onSubmit: (values, { resetForm, setSubmitting }) => {
      API.templates.copy(template, values.new_name).then((status) => {
        if (!status.success) {
          alert(status.error);
          resetForm({ values: "" });
          setSubmitting(false);
        } else {
          reload();
          setOpen(false);
          resetForm({ values: "" });
          navigate(getTemplateUrl(values.new_name));
        }
      });
    },
  });

  return (
    <>
      <FormDialogWithoutButton
        title={`Copy template ${template}`}
        buttonText="Copy Template"
        open={open}
        setOpen={setOpen}
        handleSubmit={formik.handleSubmit}
        isSubmitting={formik.isSubmitting}
      >
        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={2} sx={{ width: "50ch" }}>
            <Typography gutterBottom>Please specify the new name:</Typography>
            <FormikTextField formik={formik} name="new_name" label="New Name" />
          </Stack>
        </form>
      </FormDialogWithoutButton>
    </>
  );
}
