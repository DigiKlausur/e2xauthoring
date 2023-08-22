import React from "react";
import { Button } from "@mui/material";

import API from "@e2xauthoring/api";

import BaseDialog from "../../dialogs/BaseDialog";

export default function TurnIntoRepoDialog({ pool, open, setOpen, reload }) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const handleClose = () => {
    setOpen(false);
  };
  const handleSubmit = () => {
    setIsSubmitting(true);
    API.pools.turn_into_repository(pool).then((status) => {
      if (!status["success"]) {
        let error = status.hasOwnProperty("error")
          ? status["error"]
          : "Something went wrong";
        alert(error);
      } else {
        reload();
        setOpen(false);
      }
      setIsSubmitting(false);
    });
  };

  return (
    <BaseDialog
      open={open}
      handleClose={handleClose}
      title={`Turn ${pool} into repository`}
      actions={
        <Button
          variant="contained"
          color="success"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting" : "Turn into repository"}
        </Button>
      }
    ></BaseDialog>
  );
}
