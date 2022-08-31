import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./theme";
import { Stack } from "@mui/material";

export default function AppWithNav() {
  return (
    <ThemeProvider theme={theme}>
      <Navbar />
      <Stack spacing={2} sx={{ mt: 2 }}>
        <Outlet />
      </Stack>
    </ThemeProvider>
  );
}
