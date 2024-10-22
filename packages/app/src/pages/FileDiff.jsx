import React from "react";
import { Helmet } from "react-helmet";
import Anser from "anser";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { useParams, useSearchParams } from "react-router-dom";

import API from "@e2xauthoring/api";
import { Paper } from "@mui/material";

export default function FileDiff() {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const pool = params.pool;
  const task = params.task;
  const file = searchParams.get("file");
  const [, setLoading] = React.useState(true);
  const [diff, setDiff] = React.useState("");

  React.useEffect(() => {
    API.tasks.git_diff(pool, task, file).then((message) => {
      if (!message.success) {
        alert(message.error);
      } else {
        setDiff(message.data);
        setLoading(false);
      }
    });
  }, [file, pool, task]);

  return (
    <>
      <Helmet>
        <title>
          Diff for {pool}/{task}/{file} - e²xauthoring
        </title>
      </Helmet>
      <Stack spacing={2}>
        <Typography variant="h6" sx={{ mt: 2 }}>
          Showing diff for file {pool}/{task}/{file}
        </Typography>
        <Paper
          dangerouslySetInnerHTML={{
            __html: `<pre>${Anser.ansiToHtml(diff)}</pre>`,
          }}
        />
      </Stack>
    </>
  );
}
