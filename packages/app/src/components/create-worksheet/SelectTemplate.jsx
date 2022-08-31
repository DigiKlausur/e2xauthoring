import React from "react";

import {
  Stack,
  Typography,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";

import { AuthoringAPI } from "@e2xauthoring/api";

function SetTemplateVariables({
  template,
  templateOptions,
  setTemplateOptions,
}) {
  const handleChange = (event) => {
    setTemplateOptions((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };
  const getReadableVariableStatus = () => {
    if (template === undefined || template === "No template") {
      return <Typography variant="subtitle1">No template selected</Typography>;
    } else if (Object.keys(templateOptions).length < 1) {
      return (
        <Typography variant="subtitle1">
          The template has no variables
        </Typography>
      );
    } else {
      return <></>;
    }
  };
  return (
    <Stack spacing={1}>
      <Typography variant="h6" sx={{ mt: 1 }}>
        Set variables of template
      </Typography>
      <Typography variant="body1">
        You can define variables in templates by enclosing them in double curly
        braces (e.g.{" "}
        <code>
          {"{{"} var {"}}"}
        </code>
        )
      </Typography>
      <Grid container spacing={2}>
        {getReadableVariableStatus()}
        {Object.keys(templateOptions).length > 0 ? (
          Object.entries(templateOptions).map(([name, value]) => (
            <Grid item>
              <TextField
                id={name}
                name={name}
                label={name}
                value={value}
                onChange={handleChange}
              />
            </Grid>
          ))
        ) : (
          <></>
        )}
      </Grid>
    </Stack>
  );
}

export default function SelectTemplate({
  template,
  setTemplate,
  templateOptions,
  setTemplateOptions,
}) {
  const api = new AuthoringAPI(window.base_url);
  const [templates, setTemplates] = React.useState([]);
  const handleChange = (event) => {
    setTemplate(event.target.value);
    if (event.target.value !== "No template") {
      api.templates.list_variables(event.target.value).then((variables) => {
        setTemplateOptions(
          Object.fromEntries(variables.map((variable) => [variable, ""]))
        );
      });
    } else {
      setTemplateOptions({});
    }
  };
  React.useEffect(() => {
    api.templates
      .list()
      .then((_templates) =>
        setTemplates([{ name: "No template" }, ..._templates])
      );
  }, []);

  return (
    <>
      <FormControl sx={{ mt: 1 }}>
        <InputLabel id="template-label">Template</InputLabel>
        <Select
          label="Template"
          onChange={handleChange}
          value={template}
          autoWidth
        >
          {templates.map((_template) => (
            <MenuItem value={_template.name}>{_template.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <SetTemplateVariables
        template={template}
        templateOptions={templateOptions}
        setTemplateOptions={setTemplateOptions}
      />
    </>
  );
}
