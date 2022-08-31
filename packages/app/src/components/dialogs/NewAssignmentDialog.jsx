import React from "react";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { Stack, TextField } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { AuthoringAPI } from "@e2xauthoring/api";

import { FormDialogWithButton } from "./form-dialogs";
import { FormikTextField } from "../forms/form-components";
import { baseSchema } from "../forms/validation-schemas";
import { getAssignmentUrl } from "../../utils/urls";
import * as yup from "yup";

export default function NewAssignmentDialog() {
  const api = new AuthoringAPI(window.base_url);
  const navigate = useNavigate();
  const formik = useFormik({
    initialValues: {
      name: "",
      date: null,
    },
    validationSchema: baseSchema.shape({
      date: yup
        .date()
        .min(new Date(), "Due date can not be in the past.")
        .nullable(),
    }),
    onSubmit: (values) => {
      console.log(values);
      api.assignments.new(values.name, values.date).then((status) => {
        if (!status.name === values.name) {
          alert("Something went wrong!");
        } else {
          navigate(getAssignmentUrl(values.name));
        }
      });
    },
  });

  return (
    <FormDialogWithButton
      title="Create a new assignment"
      buttonText="Add Assignment"
      handleSubmit={formik.handleSubmit}
    >
      <form onSubmit={formik.handleSubmit}>
        <Stack spacing={2} sx={{ width: "30ch" }}>
          <FormikTextField
            formik={formik}
            name="name"
            label="Assignment Name"
          />
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="Due Date (optional)"
              value={formik.values.date}
              onChange={(newDate) => {
                formik.setFieldValue("date", newDate);
              }}
              renderInput={(props) => (
                <TextField
                  {...props}
                  error={formik.touched.date && Boolean(formik.errors.date)}
                  helperText={formik.touched.date && formik.errors.date}
                />
              )}
            />
          </LocalizationProvider>
        </Stack>
      </form>
    </FormDialogWithButton>
  );
}
