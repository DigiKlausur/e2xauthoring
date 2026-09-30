import { useId, useState, type ReactNode } from "react";
import { Alert } from "@components/ui/Alert";
import { Button } from "@components/ui/Button";
import { Field, TextInput } from "@components/ui/Input";
import { Modal } from "@components/ui/Modal";
import { validateName } from "@domain/names";
import { getErrorMessage } from "@/lib/errorMessage";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  title: string;
  description?: ReactNode;
  label: string;
  submitLabel: string;
  /** Label while the request is in flight, e.g. "Creating…". */
  pendingLabel: string;
  isSubmitting: boolean;
  errorTitle: string;
  error: unknown;
  /** Names that are already taken, e.g. the other pools. */
  takenNames?: string[];
  /** Extra controls below the name field. Their state belongs to the caller. */
  children?: ReactNode;
}

/** A dialog that asks for one valid resource name. */
export function NameDialog(props: Props) {
  // Unmounting the panel on close resets the typed name.
  if (!props.open) return null;
  return <NameDialogPanel {...props} />;
}

function NameDialogPanel({
  onClose,
  onSubmit,
  title,
  description,
  label,
  submitLabel,
  pendingLabel,
  isSubmitting,
  errorTitle,
  error,
  takenNames = [],
  children,
}: Props) {
  const inputId = useId();
  const formId = useId();
  const [name, setName] = useState("");
  const [touched, setTouched] = useState(false);

  const validationError =
    validateName(name) ??
    (takenNames.includes(name) ? "This name is already taken." : null);

  const submit = () => {
    setTouched(true);
    if (validationError === null && !isSubmitting) onSubmit(name);
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={title}
      description={description}
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
            {isSubmitting ? pendingLabel : submitLabel}
          </Button>
        </>
      }
    >
      {error != null && (
        <Alert title={errorTitle} className="mb-4">
          {getErrorMessage(error)}
        </Alert>
      )}
      <form
        id={formId}
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <Field
          label={label}
          htmlFor={inputId}
          error={touched ? validationError : null}
          help="Letters, digits, “-” and “_”."
        >
          <TextInput
            id={inputId}
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setTouched(true);
            }}
            invalid={touched && validationError !== null}
            disabled={isSubmitting}
            autoComplete="off"
            autoFocus
          />
        </Field>
        {children}
      </form>
    </Modal>
  );
}
