import React from "react";
import { Helmet } from "react-helmet";
import Typography from "@mui/material/Typography";
import { Breadcrumbs } from "@mui/material";
import { useParams } from "react-router-dom";
import { getNotebookUrl, poolUrl, getPoolUrl } from "../utils/urls";
import NavLink from "../components/nav/NavLink";

export default function Task() {
  const params = useParams();
  const pool = params.pool;
  const task = params.task;

  return (
    <>
      <Helmet>
        <title>
          Task Pools/{pool}/{task} - e²xauthoring
        </title>
      </Helmet>
      <Breadcrumbs separator=">">
        <NavLink to={poolUrl}>Task Pools</NavLink>
        <NavLink to={getPoolUrl(pool)}>{pool}</NavLink>
        <Typography color="text.primary">{task}</Typography>
      </Breadcrumbs>
      <iframe
        seamless
        title={task}
        src={getNotebookUrl(`pools/${pool}/${task}/${task}.ipynb`)}
        style={{ border: "1px solid #ccc", height: "80vh" }}
      />
    </>
  );
}
