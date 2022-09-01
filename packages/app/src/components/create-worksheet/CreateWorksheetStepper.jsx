import {
  Box,
  Button,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { Stack } from "@mui/system";
import React from "react";
import SelectTasks from "./SelectTasks";
import SelectTemplate from "./SelectTemplate";
import WorksheetOptions from "./WorksheetOptions";

import { AuthoringAPI } from "@e2xauthoring/api";
import { getNotebookUrl } from "../../utils/urls";

const stepLabels = [
  "Name Worksheet",
  "Select Template",
  "Choose Tasks",
  "Finalize",
];
const empty = <></>;

const steps = [
  {
    name: "Select Template",
    component: SelectTemplate,
  },
  {
    name: "Choose Tasks",
    component: SelectTasks,
  },
  {
    name: "Finalize",
    component: empty,
  },
];

export default function CreateWorksheetStepper({ assignment, name }) {
  const api = new AuthoringAPI(window.base_url);
  const [activeStep, setActiveStep] = React.useState(0);
  const [template, setTemplate] = React.useState("No template");
  const [templateOptions, setTemplateOptions] = React.useState({});
  const [tasks, setTasks] = React.useState([]);
  const [worksheetOptions, setWorksheetOptions] = React.useState({});

  const handleSubmit = () => {
    api.worksheets
      .new(assignment, name, tasks, template, templateOptions, worksheetOptions)
      .then((res) => {
        if (res["success"]) {
          setTimeout(
            () =>
              (window.location.href = getNotebookUrl(
                `source/${assignment}/${name}.ipynb`
              )),
            500
          );
        }
      });
  };

  const getTemplateButtonText = () => {
    if (template === "No template") {
      return "Continue without template";
    } else {
      return "Next";
    }
  };

  return (
    <>
      <Stepper activeStep={activeStep}>
        {steps.map((step) => (
          <Step key={step.name}>
            <StepLabel>{step.name}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Stack>
        <Stack direction="row">
          <Button
            disabled={activeStep === 0}
            onClick={() => setActiveStep(activeStep - 1)}
          >
            Previous
          </Button>
          <Box sx={{ flex: "1 1 auto" }} />
          {activeStep === steps.length - 1 ? (
            <Button onClick={handleSubmit}>Create Worksheet</Button>
          ) : (
            <></>
          )}
          {activeStep === 0 ? (
            <Button onClick={() => setActiveStep(activeStep + 1)}>
              {getTemplateButtonText()}
            </Button>
          ) : (
            <></>
          )}
          {activeStep === 1 ? (
            <Button
              disabled={tasks.length < 1}
              onClick={() => setActiveStep(activeStep + 1)}
            >
              Next
            </Button>
          ) : (
            <></>
          )}
        </Stack>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6">{steps[activeStep].name}</Typography>
          {activeStep === 0 ? (
            <SelectTemplate
              template={template}
              setTemplate={setTemplate}
              templateOptions={templateOptions}
              setTemplateOptions={setTemplateOptions}
            />
          ) : (
            <></>
          )}
          {activeStep === 1 ? (
            <SelectTasks selectedTasks={tasks} setSelectedTasks={setTasks} />
          ) : (
            <></>
          )}
          {activeStep === 2 ? (
            <WorksheetOptions
              worksheetOptions={worksheetOptions}
              setWorksheetOptions={setWorksheetOptions}
            />
          ) : (
            <></>
          )}
        </Box>
      </Stack>
    </>
  );
}
