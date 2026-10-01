import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import type { Task } from "@api";
import { Alert } from "@components/ui/Alert";
import { Button } from "@components/ui/Button";
import { Field, Textarea } from "@components/ui/Input";
import { Modal } from "@components/ui/Modal";
import { changedFiles, FileChange, fileChangeLabels } from "@domain/gitStatus";
import { getErrorMessage } from "@/lib/errorMessage";
import { routes } from "@/lib/routes";

interface Props {
  task: Task | null;
  onClose: () => void;
  onSubmit: (message: string) => void;
  isSubmitting: boolean;
  error: unknown;
}

const minMessageLength = 3;

export function CommitTaskDialog(props: Props) {
  if (!props.task) return null;
  return <CommitTaskDialogPanel {...props} task={props.task} />;
}

function CommitTaskDialogPanel({
  task,
  onClose,
  onSubmit,
  isSubmitting,
  error,
}: Props & { task: Task }) {
  const formId = useId();
  const messageId = useId();
  const [message, setMessage] = useState("");
  const [touched, setTouched] = useState(false);

  const files = changedFiles(task.git_status);
  const validationError =
    message.trim().length < minMessageLength
      ? `Describe the change in at least ${minMessageLength} characters.`
      : null;

  return (
    <Modal
      open
      onClose={onClose}
      title={`Commit ${task.name}`}
      size="wide"
      dismissible={!isSubmitting}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            form={formId}
            disabled={isSubmitting || (touched && validationError !== null)}
          >
            {isSubmitting ? "Committing…" : "Commit Changes"}
          </Button>
        </>
      }
    >
      {error != null && (
        <Alert title="Could not commit the task" className="mb-4">
          {getErrorMessage(error)}
        </Alert>
      )}

      <h3 className="text-sm font-semibold mb-2">Changed files</h3>
      {files.length === 0 ? (
        <p className="text-sm text-gray-500 mb-5">No changed files.</p>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden mb-5">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-3 py-2.5 font-semibold">File</th>
                <th className="px-3 py-2.5 font-semibold">Change</th>
                <th className="px-3 py-2.5 font-semibold text-right">Diff</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={`${file.change}-${file.path}`}>
                  <td className="border-t border-gray-200 px-3 py-2.5 text-sm font-mono break-all">
                    {file.path}
                  </td>
                  <td className="border-t border-gray-200 px-3 py-2.5 text-sm">
                    {fileChangeLabels[file.change]}
                  </td>
                  <td className="border-t border-gray-200 px-3 py-2.5 text-sm text-right">
                    {file.change === FileChange.Modified && (
                      <Link
                        to={routes.diff(task.pool, task.name, file.path)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        Show changes
                        <ExternalLink className="size-3.5" />
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <form
        id={formId}
        onSubmit={(event) => {
          event.preventDefault();
          setTouched(true);
          if (validationError === null && !isSubmitting) {
            onSubmit(message.trim());
          }
        }}
      >
        <Field
          label="Commit message"
          htmlFor={messageId}
          error={touched ? validationError : null}
          help="What has changed, and why?"
        >
          <Textarea
            id={messageId}
            rows={3}
            value={message}
            onChange={(event) => {
              setMessage(event.target.value);
              setTouched(true);
            }}
            invalid={touched && validationError !== null}
            disabled={isSubmitting}
            autoFocus
          />
        </Field>
      </form>
    </Modal>
  );
}
