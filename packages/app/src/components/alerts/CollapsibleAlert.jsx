import React from "react";

import Collapse from "@mui/material/Collapse";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";

export default function CollapsibleAlert({ title, ...props }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [open, setOpen] = React.useState(true);
  return (
    <Collapse in={open}>
      <Alert
        severity="info"
        action={
          <>
            <IconButton size="small" onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
            </IconButton>
            <IconButton size="small" onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
          </>
        }
      >
        <AlertTitle>{title}</AlertTitle>
        <Collapse in={!collapsed}>{props.children}</Collapse>
      </Alert>
    </Collapse>
  );
}
