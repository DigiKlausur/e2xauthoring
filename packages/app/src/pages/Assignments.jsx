import React from "react";

import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Breadcrumbs from "@mui/material/Breadcrumbs";

import AssignmentsTable from "../components/assignment/tables/AssignmentsTable";
import NewAssignmentDialog from "../components/assignment/dialogs/NewAssignmentDialog";
import CollapsibleAlert from "../components/alerts/CollapsibleAlert";

export default function Assignments() {
  return (
    <>
      <Breadcrumbs separator=">">
        <Typography color="text.primary">Assignments</Typography>
      </Breadcrumbs>
      <CollapsibleAlert title="Instructions">
        Here you can choose which assignment you want to create a worksheet for.
        A worksheet is a single Jupyter Notebook consisting of tasks.
      </CollapsibleAlert>
      <AssignmentsTable />
      <Stack direction="row">
        <NewAssignmentDialog />
      </Stack>
    </>
  );
}
