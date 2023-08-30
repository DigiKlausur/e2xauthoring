import React from "react";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useNavigate, useLocation } from "react-router-dom";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AssessmentIcon from "@mui/icons-material/Assessment";
import CreateIcon from "@mui/icons-material/Create";

import { urlJoin } from "@e2xauthoring/api";
import { appUrl } from "./utils/urls";

const MenuButton = (props) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const url = urlJoin(appUrl, props.link);
  const selected = pathname.includes(url);

  return (
    <Button
      startIcon={props.startIcon}
      variant="contained"
      disableElevation
      onClick={() => {
        navigate(urlJoin(appUrl, props.link));
      }}
      sx={{
        border: selected ? 1 : 0,
        borderColor: "white",
      }}
    >
      {props.label}
    </Button>
  );
};

export default function Navbar() {
  return (
    <div>
      <AppBar position="static">
        <Toolbar variant="dense">
          <Typography variant="h6" color="inherit">
            <Stack direction="row" spacing={2}>
              <MenuButton
                startIcon={<AssessmentIcon />}
                label="Tasks"
                link="pools"
              />
              <MenuButton
                startIcon={<CreateIcon />}
                label="Templates"
                link="templates"
              />
              <MenuButton
                startIcon={<AssignmentIcon />}
                label="Assignments"
                link="assignments"
              />
            </Stack>
          </Typography>
        </Toolbar>
      </AppBar>
    </div>
  );
}
