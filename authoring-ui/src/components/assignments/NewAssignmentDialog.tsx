import { useId, useState } from "react";
import { Alert } from "@components/ui/Alert";
import { Button } from "@components/ui/Button";
import { Field, TextInput } from "@components/ui/Input";
import { Modal } from "@components/ui/Modal";
import { validateName } from "@domain/names";
import { localInputToUtc } from "@/lib/dates";
import { getErrorMessage } from "@/lib/errorMessage";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (assignment: { name: string; duedate: string | null }) => void;
  isSubmitting: boolean;
  error: unknown;
  takenNames: string[];
}

export function NewAssignmentDialog(props: Props) {
  if (!props.open) return null;
  return <NewAssignmentDialogPanel {...props} />;
}

function NewAssignmentDialogPanel({
  onClose,
  onSubmit,
  isSubmitting,
  error,
  takenNames,
}: Props) {
  const formId = useId();
  const nameId = useId();
  const dueId = useId();
  const [name, setName] = useState("");
  const [due, setDue] = useState("");
  const [touched, setTouched] = useState({ name: false, due: false });

  const nameError =
    validateName(name) ??
    (takenNames.includes(name) ? "This name is already taken." : null);
  const dueError =
    due !== "" && new Date(due) < new Date()
      ? "The due date cannot be in the past."
      : null;

  return (
    <Modal
      open
      onClose={onClose}
      title="New assignment"
      description="The assignment is created in nbgrader as a draft."
      dismissible={!isSubmitting}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form={formId} disabled={isSubmitting}>
            {isSubmitting ? "Creating…" : "Create Assignment"}
          </Button>
        </>
      }
    >
      {error != null && (
        <Alert title="Could not create the assignment" className="mb-4">
          {getErrorMessage(error)}
        </Alert>
      )}
      <form
        id={formId}
        onSubmit={(event) => {
          event.preventDefault();
          setTouched({ name: true, due: true });
          if (nameError === null && dueError === null && !isSubmitting) {
            onSubmit({
              name,
              duedate: due === "" ? null : localInputToUtc(due),
            });
          }
        }}
      >
        <Field
          label="Assignment name"
          htmlFor={nameId}
          error={touched.name ? nameError : null}
          help="Letters, digits, “-” and “_”."
        >
          <TextInput
            id={nameId}
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setTouched({ ...touched, name: true });
            }}
            invalid={touched.name && nameError !== null}
            disabled={isSubmitting}
            autoComplete="off"
            autoFocus
          />
        </Field>
        <Field
          label="Due date (optional)"
          htmlFor={dueId}
          error={touched.due ? dueError : null}
          help="In your local time zone."
        >
          <TextInput
            id={dueId}
            type="datetime-local"
            value={due}
            onChange={(event) => {
              setDue(event.target.value);
              setTouched({ ...touched, due: true });
            }}
            invalid={touched.due && dueError !== null}
            disabled={isSubmitting}
          />
        </Field>
      </form>
    </Modal>
  );
}
