import { Button } from "@mui/material";
import React from "react";

import BaseDialog from "./BaseDialog";

export function FormDialogWithButton({
  title,
  handleSubmit,
  buttonText,
  children,
  isSubmitting,
}) {
  const [open, setOpen] = React.useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  return (
    <>
      <Button variant="contained" onClick={handleClickOpen}>
        {buttonText}
      </Button>
      <BaseDialog
        open={open}
        handleClose={handleClose}
        title={title}
        actions={
          <Button
            type="submit"
            variant="contained"
            color="success"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting" : buttonText}
          </Button>
        }
      >
        {children}
      </BaseDialog>
    </>
  );
}

export function FormDialogWithoutButton({
  title,
  handleSubmit,
  buttonText,
  children,
  open,
  setOpen,
  isSubmitting,
}) {
  const handleClose = () => {
    setOpen(false);
  };
  return (
    <>
      <BaseDialog
        open={open}
        handleClose={handleClose}
        title={title}
        actions={
          <Button
            type="submit"
            variant="contained"
            color="success"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting" : buttonText}
          </Button>
        }
      >
        {children}
      </BaseDialog>
    </>
  );
}
