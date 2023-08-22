import React from "react";
import API from "@e2xauthoring/api";
import SetGitAuthorDialog from "../dialogs/SetGitAuthorDialog";
import { Alert, AlertTitle } from "@mui/material";

export default function GitAuthorNotSetAlert() {
  const [authorIsSet, setAuthorIsSet] = React.useState(true);
  React.useEffect(() => {
    API.git_author.get().then((author) => {
      setAuthorIsSet(!!author);
    });
  }, []);
  return (
    <>
      {authorIsSet ? (
        <></>
      ) : (
        <Alert severity="warning">
          <AlertTitle>Git Author is not set</AlertTitle>
          <SetGitAuthorDialog />
        </Alert>
      )}
    </>
  );
}
