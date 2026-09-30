import { useState } from "react";
import { useGitAuthor, useUpdateGitAuthor } from "@hooks/git";
import { Alert } from "@components/ui/Alert";
import { Button } from "@components/ui/Button";
import { GitAuthorDialog } from "./GitAuthorDialog";

/** Warns that commits will fail until a global git author is configured. */
export function GitAuthorAlert({ className = "" }: { className?: string }) {
  const { data: author, isSuccess } = useGitAuthor();
  const update = useUpdateGitAuthor();
  const [open, setOpen] = useState(false);

  // Stay quiet while loading and on errors; only a known missing author counts.
  if (!isSuccess || author !== null) return null;

  const close = () => {
    setOpen(false);
    update.reset();
  };

  return (
    <>
      <Alert
        variant="warning"
        title="Git author is not set"
        className={className}
        action={
          <Button size="toolbar" onClick={() => setOpen(true)}>
            Set Git Author
          </Button>
        }
      >
        Tasks in version-controlled pools cannot be committed until you set a
        git author.
      </Alert>
      <GitAuthorDialog
        open={open}
        onClose={close}
        onSubmit={(value) => update.mutate(value, { onSuccess: close })}
        isSubmitting={update.isPending}
        error={update.error}
      />
    </>
  );
}
