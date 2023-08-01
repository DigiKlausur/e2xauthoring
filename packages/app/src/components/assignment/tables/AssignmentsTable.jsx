import React from "react";

import DataTable from "../../tables/DataTable";

import format from "date-fns/format";

import API from "@e2xauthoring/api";
import { Checkbox, Chip, FormControlLabel } from "@mui/material";
import { getAssignmentUrl } from "../../../utils/urls";
import NavLink from "../../nav/NavLink";

function AssignmentStatus({ status, numberOfSubmissions }) {
  const colors = {
    draft: "primary",
    released: "warning",
  };
  if (status === "draft" && numberOfSubmissions > 0) {
    return (
      <Chip size="small" label="returned" color="success" variant="outlined" />
    );
  } else {
    return (
      <Chip
        size="small"
        label={status}
        color={colors[status]}
        variant="outlined"
      />
    );
  }
}

export default function AssignmentsTable(props) {
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [showOnlyDraftAssignments, setShowOnlyDraftAssignments] =
    React.useState(true);
  const filterAssignments = (_assignments) => {
    if (showOnlyDraftAssignments) {
      return _assignments.filter(
        (assignment) =>
          assignment.status === "draft" && assignment.num_submissions === 0
      );
    } else {
      return _assignments;
    }
  };

  const load = () => {
    setLoading(true);
    API.assignments.list(false).then((assignments) => {
      setRows(assignments);
      setLoading(false);
    });
  };

  React.useEffect(() => {
    load();
  }, []);

  const columns = React.useMemo(
    () => [
      {
        field: "name",
        headerName: "Name",
        flex: 2,
        renderCell: (params) => (
          <NavLink to={getAssignmentUrl(params.row.name)}>
            {params.row.name}
          </NavLink>
        ),
      },
      {
        field: "duedate",
        headerName: "Due Date",
        flex: 1,
        valueGetter: (params) =>
          `${
            params.row.duedate !== null
              ? format(new Date(params.row.duedate), "yyyy-MM-dd HH:mm:ss OOOO")
              : "None"
          }`,
      },
      {
        field: "status",
        headerName: "Status",
        flex: 1,
        valueGetter: (params) =>
          `${
            params.row.status === "draft" && params.row.num_submissions > 0
              ? "returned"
              : params.row.status
          }`,
        renderCell: (params) => (
          <AssignmentStatus
            status={params.row.status}
            numberOfSubmissions={params.row.num_submissions}
          />
        ),
      },
      {
        field: "num_submissions",
        headerName: "Number of Submissions",
        flex: 1,
      },
    ],
    []
  );

  return (
    <>
      <FormControlLabel
        control={
          <Checkbox
            checked={showOnlyDraftAssignments}
            onChange={(event) =>
              setShowOnlyDraftAssignments(event.target.checked)
            }
          />
        }
        label="Only show assignments with draft status and no submissions"
      />
      <DataTable
        rows={filterAssignments(rows)}
        {...props}
        columns={columns}
        loading={loading}
        getRowId={(row) => row.name}
      />
    </>
  );
}
