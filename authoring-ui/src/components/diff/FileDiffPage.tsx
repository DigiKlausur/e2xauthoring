import { useParams, useSearchParams } from "react-router-dom";
import { useTaskDiff } from "@hooks/tasks";
import { useDocumentTitle } from "@hooks/ui";
import { PageHeader } from "@components/layout/PageHeader";
import { Alert } from "@components/ui/Alert";
import { stripAnsi } from "@/lib/ansi";
import { getErrorMessage } from "@/lib/errorMessage";

function lineClass(line: string): string {
  if (/^(diff |index |--- |\+\+\+ )/.test(line))
    return "text-gray-500 font-semibold";
  if (line.startsWith("@@")) return "text-sky-700 bg-sky-50";
  if (line.startsWith("+")) return "text-green-800 bg-green-50";
  if (line.startsWith("-")) return "text-red-800 bg-red-50";
  return "text-gray-800";
}

/** Uncommitted changes of one task file. Opened in its own tab, without nav. */
export function FileDiffPage() {
  const { pool = "", task = "" } = useParams<{ pool: string; task: string }>();
  const [searchParams] = useSearchParams();
  const file = searchParams.get("file") ?? "";
  useDocumentTitle("Changes", pool, task, file);
  const diff = useTaskDiff(pool, task, file);

  const lines = diff.data ? stripAnsi(diff.data).split("\n") : [];

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: pool }, { label: task }]}
        title={file || "No file selected"}
        subtitle="Uncommitted changes to this file"
      />
      <div className="px-10 py-8">
        {!file ? (
          <p className="text-gray-500">No file was given to compare.</p>
        ) : diff.isPending ? (
          <p className="text-gray-500">Loading…</p>
        ) : diff.isError ? (
          <Alert title="Could not load the changes">
            {getErrorMessage(diff.error)}
          </Alert>
        ) : lines.join("").trim() === "" ? (
          <p className="text-gray-500">This file has no uncommitted changes.</p>
        ) : (
          <pre className="bg-white border border-gray-200 rounded-xl py-4 text-xs font-mono overflow-x-auto">
            {lines.map((line, index) => (
              <div key={index} className={`px-4 ${lineClass(line)}`}>
                {line || " "}
              </div>
            ))}
          </pre>
        )}
      </div>
    </div>
  );
}
