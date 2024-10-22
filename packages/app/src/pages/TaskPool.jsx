import React from "react";
import { Helmet } from "react-helmet";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";

import TaskTable from "../components/task/tables/TaskTable";
import { useParams } from "react-router-dom";
import { poolUrl } from "../utils/urls";
import NewTaskDialog from "../components/task/dialogs/NewTaskDialog";
import { Breadcrumbs } from "@mui/material";
import NavLink from "../components/nav/NavLink";
import CollapsibleAlert from "../components/alerts/CollapsibleAlert";
import GitAuthorNotSetAlert from "../components/alerts/GitAuthorNotSetAlert";

export default function TaskPool() {
  const params = useParams();
  const pool = params.pool;

  return (
    <>
      <Helmet>
        <title>Task Pools/{pool} - e²xauthoring</title>
      </Helmet>
      <Breadcrumbs separator=">">
        <NavLink to={poolUrl}>Task Pools</NavLink>
        <Typography color="text.primary">{pool}</Typography>
      </Breadcrumbs>
      <GitAuthorNotSetAlert />
      <CollapsibleAlert title="Instructions">
        A task is a single Jupyter notebook consisting of a task with several
        questions (i.e. Task 1.1, Task 1.2, Task 1.3).
      </CollapsibleAlert>
      <TaskTable pool={pool} />
      <Stack direction="row">
        <NewTaskDialog pool={pool} />
      </Stack>
    </>
  );
}
