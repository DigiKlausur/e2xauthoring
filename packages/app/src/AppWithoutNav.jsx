import { Outlet } from "react-router-dom";

import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./theme";
import { ConfirmProvider } from "material-ui-confirm";

export default function AppWithoutNav() {
  return (
    <ThemeProvider theme={theme}>
      <ConfirmProvider>
        <Outlet />
      </ConfirmProvider>
    </ThemeProvider>
  );
}
