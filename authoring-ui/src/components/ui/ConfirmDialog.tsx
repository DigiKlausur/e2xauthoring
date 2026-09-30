import { useId, useState, type ReactNode } from "react";
import { Alert } from "./Alert";
import { Button } from "./Button";
import { TextInput } from "./Input";
import { Modal } from "./Modal";

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  /** Label while the request is in flight, e.g. "Deleting…". */
  pendingLabel?: string;
  variant?: "default" | "destructive";
  /** The user has to type this text before the confirm button is enabled. */
  requireConfirmationText?: string;
  isConfirming?: boolean;
  errorTitle?: string;
  errorMessage?: string | null;
}

export function ConfirmDialog(props: ConfirmDialogProps) {
  // Unmounting the panel on close resets the typed confirmation text.
  if (!props.open) return null;
  return <ConfirmDialogPanel {...props} />;
}

function ConfirmDialogPanel({
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  pendingLabel,
  variant = "default",
  requireConfirmationText,
  isConfirming = false,
  errorTitle,
  errorMessage,
}: ConfirmDialogProps) {
  const inputId = useId();
  const [typed, setTyped] = useState("");

  const confirmed =
    requireConfirmationText === undefined || typed === requireConfirmationText;

  return (
    <Modal
      open
      onClose={onClose}
      title={title}
      dismissible={!isConfirming}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isConfirming}>
            Cancel
          </Button>
          <Button
            variant={variant === "destructive" ? "danger" : "primary"}
            onClick={onConfirm}
            disabled={!confirmed || isConfirming}
          >
            {isConfirming ? (pendingLabel ?? `${confirmLabel}…`) : confirmLabel}
          </Button>
        </>
      }
    >
      {errorMessage && (
        <Alert title={errorTitle} className="mb-4">
          {errorMessage}
        </Alert>
      )}
      <div className="text-sm text-gray-700">{description}</div>
      {requireConfirmationText !== undefined && (
        <form
          className="mt-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (confirmed && !isConfirming) onConfirm();
          }}
        >
          <label htmlFor={inputId} className="block text-sm font-semibold mb-2">
            Type <span className="font-mono">{requireConfirmationText}</span> to
            confirm
          </label>
          <TextInput
            id={inputId}
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            disabled={isConfirming}
            autoComplete="off"
            autoFocus
          />
        </form>
      )}
    </Modal>
  );
}
