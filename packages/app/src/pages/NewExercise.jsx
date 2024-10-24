import React from "react";
import { Helmet } from "react-helmet";
import Typography from "@mui/material/Typography";
import CreateWorksheetStepper from "../components/worksheet/create-worksheet/CreateWorksheetStepper";
import { useParams } from "react-router-dom";
import { assignmentsUrl, getAssignmentUrl } from "../utils/urls";
import { Breadcrumbs } from "@mui/material";
import NavLink from "../components/nav/NavLink";

export default function NewExercise() {
  const params = useParams();
  const assignment = params.assignment;
  const name = params.name;
  return (
    <>
      <Helmet>
        <title>
          Assignments/{assignment}/New Worksheet/{name} - e²xauthoring
        </title>
      </Helmet>
      <Breadcrumbs separator=">">
        <NavLink to={assignmentsUrl}>Assignments</NavLink>
        <NavLink to={getAssignmentUrl(assignment)}>{assignment}</NavLink>
        <Typography color="text.primary">New Worksheet</Typography>
        <Typography color="text.primary">{name}</Typography>
      </Breadcrumbs>
      <CreateWorksheetStepper assignment={assignment} name={name} />
    </>
  );
}
