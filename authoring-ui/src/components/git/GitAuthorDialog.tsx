import { useId, useState } from "react";
import type { GitAuthorUpdate } from "@api";
import { Alert } from "@components/ui/Alert";
import { Button } from "@components/ui/Button";
import { Field, TextInput } from "@components/ui/Input";
import { Modal } from "@components/ui/Modal";
import { getErrorMessage } from "@/lib/errorMessage";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (author: GitAuthorUpdate) => void;
  isSubmitting: boolean;
  error: unknown;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(author: GitAuthorUpdate) {
  return {
    name:
      author.name.trim().length < 3
        ? "The name needs at least 3 characters."
        : null,
    email: emailPattern.test(author.email.trim())
      ? null
      : "Enter a valid e-mail address.",
  };
}

export function GitAuthorDialog(props: Props) {
  if (!props.open) return null;
  return <GitAuthorDialogPanel {...props} />;
}

function GitAuthorDialogPanel({
  onClose,
  onSubmit,
  isSubmitting,
  error,
}: Props) {
  const formId = useId();
  const nameId = useId();
  const emailId = useId();
  const [author, setAuthor] = useState<GitAuthorUpdate>({
    name: "",
    email: "",
  });
  const [touched, setTouched] = useState({ name: false, email: false });

  const errors = validate(author);
  const isValid = errors.name === null && errors.email === null;

  return (
    <Modal
      open
      onClose={onClose}
      title="Set git author"
      description="Commits of your tasks are recorded under this name and e-mail address."
      dismissible={!isSubmitting}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form={formId} disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Set Git Author"}
          </Button>
        </>
      }
    >
      {error != null && (
        <Alert title="Could not set the git author" className="mb-4">
          {getErrorMessage(error)}
        </Alert>
      )}
      <form
        id={formId}
        onSubmit={(event) => {
          event.preventDefault();
          setTouched({ name: true, email: true });
          if (isValid && !isSubmitting) {
            onSubmit({ name: author.name.trim(), email: author.email.trim() });
          }
        }}
      >
        <Field
          label="Name"
          htmlFor={nameId}
          error={touched.name ? errors.name : null}
        >
          <TextInput
            id={nameId}
            value={author.name}
            onChange={(event) => {
              setAuthor({ ...author, name: event.target.value });
              setTouched({ ...touched, name: true });
            }}
            invalid={touched.name && errors.name !== null}
            disabled={isSubmitting}
            autoComplete="name"
            autoFocus
          />
        </Field>
        <Field
          label="E-mail"
          htmlFor={emailId}
          error={touched.email ? errors.email : null}
        >
          <TextInput
            id={emailId}
            type="email"
            value={author.email}
            onChange={(event) => {
              setAuthor({ ...author, email: event.target.value });
              setTouched({ ...touched, email: true });
            }}
            invalid={touched.email && errors.email !== null}
            disabled={isSubmitting}
            autoComplete="email"
          />
        </Field>
      </form>
    </Modal>
  );
}
