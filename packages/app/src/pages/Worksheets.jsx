import React from "react";

import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";

import WorksheetsTable from "../components/tables/WorksheetsTable";
import { useParams } from "react-router-dom";
import { assignmentsUrl } from "../utils/urls";
import NewWorksheetDialog from "../components/dialogs/NewWorksheetDialog";
import { Breadcrumbs } from "@mui/material";
import NavLink from "../components/nav/NavLink";

export default function Worksheets() {
  const params = useParams();
  const assignment = params.assignment;
  return (
    <>
      <Breadcrumbs>
        <NavLink to={assignmentsUrl}>Assignments</NavLink>
        <Typography color="text.primary">{assignment}</Typography>
      </Breadcrumbs>
      <WorksheetsTable assignment={assignment} />
      <Stack direction="row">
        <NewWorksheetDialog assignment={assignment} />
      </Stack>
    </>
  );
}
