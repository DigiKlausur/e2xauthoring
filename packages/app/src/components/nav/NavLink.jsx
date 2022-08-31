import { Link as RouterLink } from "react-router-dom";
import Link from "@mui/material/Link";

export default function NavLink({ to, ...props }) {
  return (
    <Link component={RouterLink} to={to} underline="hover">
      {props.children}
    </Link>
  );
}
