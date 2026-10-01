import { useState } from "react";
import { useParams } from "react-router-dom";
import { Plus } from "lucide-react";
import type { Task, Template } from "@api";
import { useKernels } from "@hooks/kernels";
import { useAllTasks } from "@hooks/tasks";
import { useTemplates } from "@hooks/templates";
import { useDocumentTitle } from "@hooks/ui";
import { useCreateWorksheet } from "@hooks/worksheets";
import { PageHeader } from "@components/layout/PageHeader";
import { KernelSelect } from "@components/tasks/KernelSelect";
import { Alert } from "@components/ui/Alert";
import { Button } from "@components/ui/Button";
import { Card, CardTitle } from "@components/ui/Card";
import { Switch } from "@components/ui/Switch";
import { pageTexts } from "@domain/texts";
import { getErrorMessage } from "@/lib/errorMessage";
import { notebookUrls, routes } from "@/lib/routes";
import { AddTasksDialog } from "./AddTasksDialog";
import { SelectedTasksTable } from "./SelectedTasksTable";
import { SelectTemplateStep } from "./SelectTemplateStep";
import { Stepper } from "./Stepper";

const steps = ["Choose template", "Choose tasks", "Finish"];

export function NewWorksheetPage() {
  const { assignment = "", name = "" } = useParams<{
    assignment: string;
    name: string;
  }>();
  useDocumentTitle(pageTexts.assignments.title, assignment, "New worksheet");

  const templates = useTemplates();
  const allTasks = useAllTasks();
  const kernels = useKernels();
  const create = useCreateWorksheet(assignment, name);

  const [step, setStep] = useState(0);
  const [template, setTemplate] = useState<string | null>(null);
  const [templateValues, setTemplateValues] = useState<Record<string, string>>(
    {},
  );
  const [tasks, setTasks] = useState<Task[]>([]);
  const [addingTasks, setAddingTasks] = useState(false);
  const [taskHeaders, setTaskHeaders] = useState(false);
  // null = follow the first installed kernel.
  const [kernel, setKernel] = useState<string | null>(null);
  const currentKernel = kernel ?? kernels.data?.[0]?.name ?? "";

  const chooseTemplate = (chosen: Template | null) => {
    setTemplate(chosen?.name ?? null);
    setTemplateValues(
      Object.fromEntries(
        (chosen?.variables ?? []).map((variable) => [variable, ""]),
      ),
    );
  };

  const submit = () =>
    create.mutate(
      {
        template,
        "template-options": templateValues,
        exercise_options: {
          "task-headers": taskHeaders,
          ...(currentKernel ? { kernel: currentKernel } : {}),
        },
        tasks: tasks.map((task) => ({ ...task, task: task.name })),
      },
      {
        // The worksheet is edited in Jupyter, outside this app.
        onSuccess: () =>
          window.location.assign(notebookUrls.worksheet(assignment, name)),
      },
    );

  const canContinue = step !== 1 || tasks.length > 0;

  return (
    <div>
      <PageHeader
        breadcrumbs={[
          { label: pageTexts.assignments.title, to: routes.assignments },
          { label: assignment, to: routes.assignment(assignment) },
          { label: "New worksheet" },
        ]}
        title={name}
        subtitle={`New worksheet in ${assignment}`}
      />

      <div className="px-10 py-8 max-w-5xl">
        <Stepper steps={steps} active={step} />

        {create.isError && (
          <Alert title="Could not create the worksheet" className="mb-6">
            {getErrorMessage(create.error)}
          </Alert>
        )}

        <Card>
          <CardTitle>{steps[step]}</CardTitle>

          {step === 0 && (
            <SelectTemplateStep
              templates={templates.data}
              templatesError={templates.error}
              template={template}
              onTemplateChange={chooseTemplate}
              values={templateValues}
              onValuesChange={setTemplateValues}
            />
          )}

          {step === 1 && (
            <>
              <SelectedTasksTable tasks={tasks} setTasks={setTasks} />
              <Button
                variant="secondary"
                className="mt-4"
                onClick={() => setAddingTasks(true)}
              >
                <Plus className="size-4" />
                Add Tasks
              </Button>
            </>
          )}

          {step === 2 && (
            <div className="max-w-md">
              <div className="mb-5">
                <Switch
                  checked={taskHeaders}
                  onChange={setTaskHeaders}
                  disabled={create.isPending}
                  label="Add task headers"
                  description="Insert a header with the task number and points before each task."
                />
              </div>
              <KernelSelect
                kernels={kernels.data}
                value={currentKernel}
                onChange={setKernel}
                disabled={create.isPending}
                help="The kernel students run the worksheet with."
              />
              <p className="text-sm text-gray-500 mt-5">
                {tasks.length} {tasks.length === 1 ? "task" : "tasks"},{" "}
                {tasks.reduce((sum, task) => sum + task.points, 0)} points,{" "}
                {template === null ? "no template" : `template ${template}`}.
              </p>
            </div>
          )}
        </Card>

        <div className="flex justify-between">
          <Button
            variant="secondary"
            disabled={step === 0 || create.isPending}
            onClick={() => setStep(step - 1)}
          >
            Previous
          </Button>
          {step < steps.length - 1 ? (
            <Button disabled={!canContinue} onClick={() => setStep(step + 1)}>
              {step === 0 && template === null
                ? "Continue without Template"
                : "Next"}
            </Button>
          ) : (
            <Button
              onClick={submit}
              disabled={create.isPending || tasks.length === 0}
            >
              {create.isPending ? "Creating…" : "Create Worksheet"}
            </Button>
          )}
        </div>
      </div>

      <AddTasksDialog
        open={addingTasks}
        onClose={() => setAddingTasks(false)}
        tasks={allTasks.data}
        isLoading={allTasks.isPending}
        error={allTasks.error}
        selectedTasks={tasks}
        onAdd={(added) => {
          setTasks((current) => [...current, ...added]);
          setAddingTasks(false);
        }}
      />
    </div>
  );
}
