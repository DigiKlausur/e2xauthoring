import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import AppWithNav from "./AppWithNav";

import Assignments from "./pages/Assignments";
import TaskPools from "./pages/TaskPools";
import TaskPool from "./pages/TaskPool";
import Task from "./pages/Task";
import Templates from "./pages/Templates";
import Template from "./pages/Template";
import FileDiff from "./pages/FileDiff";
import AppWithoutNav from "./AppWithoutNav";
import Worksheets from "./pages/Worksheets";
import NewExercise from "./pages/NewExercise";

import { urlJoin } from "@e2xauthoring/api";

ReactDOM.createRoot(document.querySelector("#root")).render(
  <BrowserRouter>
    <Routes>
      <Route
        path={urlJoin(window.base_url, "/e2x/authoring/app/nonav")}
        element={<AppWithoutNav />}
      >
        <Route path="diff/:pool/:task" element={<FileDiff />} />
      </Route>
      <Route
        path={urlJoin(window.base_url, "/e2x/authoring/app")}
        element={<AppWithNav />}
      >
        <Route path="assignments" element={<Assignments />} />
        <Route path="assignments/:assignment" element={<Worksheets />} />
        <Route
          path="assignments/:assignment/new/:name"
          element={<NewExercise />}
        />
        <Route path="templates" element={<Templates />} />
        <Route path="templates/:template" element={<Template />} />
        <Route path="pools" element={<TaskPools />} />
        <Route path="pools/:pool" element={<TaskPool />} />
        <Route path="pools/:pool/:task" element={<Task />} />
        <Route path="diff/:pool/:task" element={<FileDiff />} />
        <Route index element={<Navigate to="assignments" replace />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
