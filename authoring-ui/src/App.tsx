import { Navigate, Route, Routes } from "react-router-dom";
import { AssignmentPage } from "@components/assignments/AssignmentPage";
import { AssignmentsPage } from "@components/assignments/AssignmentsPage";
import { FileDiffPage } from "@components/diff/FileDiffPage";
import { AppLayout } from "@components/layout/AppLayout";
import { TaskPoolPage } from "@components/pools/TaskPoolPage";
import { TaskPoolsPage } from "@components/pools/TaskPoolsPage";
import { TaskPage } from "@components/tasks/TaskPage";
import { TemplatePage } from "@components/templates/TemplatePage";
import { TemplatesPage } from "@components/templates/TemplatesPage";
import { NewWorksheetPage } from "@components/worksheets/NewWorksheetPage";
import { routes } from "@/lib/routes";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-page">
      <Routes>
        {/* Opened in a separate tab from the commit dialog, so no nav. */}
        <Route path="/diff/:pool/:task" element={<FileDiffPage />} />
        <Route element={<AppLayout />}>
          <Route path="/pools" element={<TaskPoolsPage />} />
          <Route path="/pools/:pool" element={<TaskPoolPage />} />
          <Route path="/pools/:pool/:task" element={<TaskPage />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/templates/:template" element={<TemplatePage />} />
          <Route path="/assignments" element={<AssignmentsPage />} />
          <Route path="/assignments/:assignment" element={<AssignmentPage />} />
          <Route
            path="/assignments/:assignment/new/:name"
            element={<NewWorksheetPage />}
          />
          <Route path="*" element={<Navigate to={routes.pools} replace />} />
        </Route>
      </Routes>
    </div>
  );
}
