export const appName = "e²xauthoring";

export const pageTexts = {
  pools: {
    title: "Task Pools",
    description:
      "Task pools are collections of tasks about the same topic. A task is a Jupyter notebook with several related questions.",
  },
  pool: {
    description:
      "A task is a single Jupyter notebook with several questions (e.g. Task 1.1, Task 1.2, Task 1.3).",
  },
  templates: {
    title: "Templates",
    description:
      "Templates hold the header and footer cells of a worksheet, and special cells such as student info. Variables in double curly braces (e.g. {{ var }}) are filled in when a worksheet is created.",
  },
  assignments: {
    title: "Assignments",
    description:
      "Choose the assignment you want to create a worksheet for. A worksheet is a single Jupyter notebook made of tasks.",
  },
  worksheets: {
    description: "Worksheets are the notebooks students work on.",
  },
} as const;
