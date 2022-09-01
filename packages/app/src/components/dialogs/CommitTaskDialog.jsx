import React from "react";

import { AuthoringAPI } from "@e2xauthoring/api";

import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";

import { useFormik } from "formik";
import { FormDialogWithoutButton } from "./form-dialogs";
import { FormikTextField } from "../forms/form-components";
import * as yup from "yup";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { Link } from "react-router-dom";
import { getDiffUrl } from "../../utils/urls";

function GitStatusList({ git_status, pool, task }) {
  let rows = [];
  for (let i in git_status.untracked) {
    rows.push({
      name: git_status.untracked[i],
      status: "New File",
    });
  }
  for (let i in git_status.unstaged) {
    rows.push({
      name: git_status.unstaged[i],
      status: "Modified",
    });
  }
  for (let i in git_status.staged) {
    rows.push({
      name: git_status.staged[i],
      status: "Modified",
    });
  }

  return (
    <>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>
              <Typography sx={{ fontWeight: "bold" }}>Filename</Typography>
            </TableCell>
            <TableCell>
              <Typography sx={{ fontWeight: "bold" }}>Status</Typography>
            </TableCell>
            <TableCell>
              <Typography sx={{ fontWeight: "bold" }}>Diff</Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.name}>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.status}</TableCell>
              <TableCell>
                {row.status === "Modified" ? (
                  <Link to={getDiffUrl(pool, task, row.name)} target="_blank">
                    Show Changes
                  </Link>
                ) : (
                  <></>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}

export default function CommitTaskDialog({ open, setOpen, reload, row }) {
  const api = new AuthoringAPI(window.base_url);
  const formik = useFormik({
    initialValues: {
      message: "",
    },
    validationSchema: yup.object({
      message: yup
        .string()
        .required()
        .min(3, "Message should have at least 3 characters"),
    }),
    onSubmit: (values, { resetForm }) => {
      api.tasks.commit(row.pool, row.name, values.message).then((status) => {
        if (!status["success"]) {
          alert(status["error"]);
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
        title={`Commit task ${row.name}`}
        buttonText="Commit Task"
        open={open}
        setOpen={setOpen}
        handleSubmit={formik.handleSubmit}
        isSubmitting={formik.isSubmitting}
      >
        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={2} sx={{ width: "50ch" }}>
            <Typography gutterBottom>What has changed?</Typography>
            <GitStatusList
              git_status={row.git_status}
              pool={row.pool}
              task={row.name}
            />
            <Typography gutterBottom>Write your commit message:</Typography>
            <FormikTextField
              formik={formik}
              name="message"
              label="Commit Message"
              multiline
              maxRows={5}
            />
          </Stack>
        </form>
      </FormDialogWithoutButton>
    </>
  );
}
