import React from "react";

import API from "@e2xauthoring/api";

import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";

import { useFormik } from "formik";
import { FormDialogWithoutButton } from "../../dialogs/form-dialogs";
import { FormikTextField } from "../../forms/form-components";
import { nameRegex } from "../../../utils/validator";
import * as yup from "yup";

export default function EditTaskDialog({ open, setOpen, reload, row }) {
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
          nameRegex,
          'Name can only consist of letters, digits, "-" and "_"!'
        ),
    }),
    onSubmit: (values, { resetForm, setSubmitting }) => {
      API.tasks.rename(row.pool, row.name, values.new_name).then((status) => {
        if (!status.success) {
          alert(status.error);
          resetForm({ values: "" });
          setSubmitting(false);
        } else {
          reload();
          setOpen(false);
          resetForm({ values: "" });
        }
      });
    },
  });

  return (
    <>
      <FormDialogWithoutButton
        title={`Rename task ${row.name}`}
        buttonText="Rename Task"
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
