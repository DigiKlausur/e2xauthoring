import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

import { Stack } from "@mui/material";
import { ConfirmProvider } from "material-ui-confirm";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./theme";

export default function AppWithNav() {
  return (
    <ThemeProvider theme={theme}>
      <ConfirmProvider>
        <Navbar />
        <Stack spacing={2} sx={{ mt: 2 }}>
          <Outlet />
        </Stack>
      </ConfirmProvider>
    </ThemeProvider>
  );
}
