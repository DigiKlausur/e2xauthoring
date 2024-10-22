import React from "react";
import { Helmet } from "react-helmet";
import Typography from "@mui/material/Typography";
import { Breadcrumbs } from "@mui/material";
import { useParams } from "react-router-dom";
import { templateUrl, getNotebookUrl } from "../utils/urls";
import NavLink from "../components/nav/NavLink";

export default function Template() {
  const params = useParams();
  const template = params.template;

  return (
    <>
      <Helmet>
        <title>Templates/{template} - e²xauthoring</title>
      </Helmet>
      <Breadcrumbs aria-label="breadcrumb" separator=">">
        <NavLink to={templateUrl}>Templates</NavLink>
        <Typography color="text.primary">{template}</Typography>
      </Breadcrumbs>
      <iframe
        seamless
        title={template}
        src={getNotebookUrl(`templates/${template}/${template}.ipynb`)}
        style={{ border: "1px solid #ccc", height: "80vh" }}
      />
    </>
  );
}
