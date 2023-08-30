import { Outlet } from "react-router-dom";

import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./theme";
import { ConfirmProvider } from "material-ui-confirm";
import { SettingsProvider } from "./settings/SettingsContext";

export default function AppWithoutNav() {
  return (
    <ThemeProvider theme={theme}>
      <SettingsProvider>
        <ConfirmProvider>
          <Outlet />
        </ConfirmProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}
