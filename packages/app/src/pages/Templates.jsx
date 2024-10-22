import React from "react";
import { Helmet } from "react-helmet";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";

import TemplateTable from "../components/template/tables/TemplateTable";
import NewTemplateDialog from "../components/template/dialogs/NewTemplateDialog";
import { Breadcrumbs } from "@mui/material";
import CollapsibleAlert from "../components/alerts/CollapsibleAlert";

export default function Templates() {
  return (
    <>
      <Helmet>
        <title>Templates - e²xauthoring</title>
      </Helmet>
      <Breadcrumbs separator=">">
        <Typography color="text.primary">Templates</Typography>
      </Breadcrumbs>
      <CollapsibleAlert title="Instructions">
        Templates are used for creating exercises. A template consists of header
        and footer cells, as well as special cells like student info. You can
        use variables in templates by enclosing them in double curly braces
        (e.g. <code>{"{{ var }}"}</code>). When creating an exercise you can set
        the values for those variables.
      </CollapsibleAlert>
      <TemplateTable />
      <Stack direction="row">
        <NewTemplateDialog />
      </Stack>
    </>
  );
}
