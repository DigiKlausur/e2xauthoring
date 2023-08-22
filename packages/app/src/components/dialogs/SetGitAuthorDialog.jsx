import React from "react";
import * as yup from "yup";

import { useFormik } from "formik";
import { Button, Stack } from "@mui/material";

import API from "@e2xauthoring/api";

import { FormDialogWithoutButton } from "./form-dialogs";
import { FormikTextField } from "../forms/form-components";

export default function SetGitAuthorDialog() {
  const [open, setOpen] = React.useState(false);
  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
    },
    validationSchema: yup.object({
      name: yup
        .string()
        .required()
        .min(3, "The name needs to have at least 3 characters"),
      email: yup.string().email().required(),
    }),
    onSubmit: (values) => {
      API.git.setAuthor(values.name, values.email).then((res) => {
        if (!res["success"]) {
          alert(res["message"]);
        } else {
          setOpen(false);
        }
      });
    },
  });

  return (
    <>
      <Button onClick={() => setOpen(true)}>Set Git Author</Button>
      <FormDialogWithoutButton
        title="Set Git Author"
        buttonText="Set Git Author"
        handleSubmit={formik.handleSubmit}
        open={open}
        setOpen={setOpen}
        isSubmitting={formik.isSubmitting}
      >
        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={2} sx={{ width: "30ch" }}>
            <FormikTextField formik={formik} name="name" label="User Name" />
            <FormikTextField formik={formik} name="email" label="E-Mail" />
          </Stack>
        </form>
      </FormDialogWithoutButton>
    </>
  );
}
