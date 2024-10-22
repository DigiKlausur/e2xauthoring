import React from "react";
import { Helmet } from "react-helmet";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import TaskPoolTable from "../components/pool/tables/TaskPoolTable";
import NewTaskPoolDialog from "../components/pool/dialogs/NewTaskPoolDialog";
import { Breadcrumbs } from "@mui/material";
import CollapsibleAlert from "../components/alerts/CollapsibleAlert";
import GitAuthorNotSetAlert from "../components/alerts/GitAuthorNotSetAlert";

export default function TaskPools() {
  return (
    <>
      <Helmet>
        <title>Task Pools - e²xauthoring</title>
      </Helmet>
      <Breadcrumbs separator=">">
        <Typography color="text.primary">Task Pools</Typography>
      </Breadcrumbs>
      <GitAuthorNotSetAlert />
      <CollapsibleAlert title="Instructions">
        Task pools are collections of tasks about the same topic. A task
        consists of a collection of related questions.
      </CollapsibleAlert>
      <TaskPoolTable />
      <Stack direction="row">
        <NewTaskPoolDialog />
      </Stack>
    </>
  );
}
