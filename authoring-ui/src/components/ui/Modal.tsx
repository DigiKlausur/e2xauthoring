import { useEffect, useId, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useBodyScrollLock } from "@hooks/ui";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  /** Keeps the panel at a fixed height, e.g. while its content is filtered. */
  fixedHeight?: boolean;
  size?: "default" | "wide";
  /** False while a request is in flight: backdrop, ✕ and Escape do nothing. */
  dismissible?: boolean;
}

const sizeClasses: Record<NonNullable<ModalProps["size"]>, string> = {
  default: "max-w-lg",
  wide: "max-w-4xl",
};

export function Modal({
  open,
  onClose,
  title,
  description,
  footer,
  children,
  fixedHeight = false,
  size = "default",
  dismissible = true,
}: ModalProps) {
  const titleId = useId();
  useBodyScrollLock(open);

  useEffect(() => {
    if (!open || !dismissible) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, dismissible, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && dismissible) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`bg-white rounded-2xl shadow-xl w-full ${sizeClasses[size]} flex flex-col max-h-[90vh] ${fixedHeight ? "h-[80vh]" : ""}`}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold text-gray-900">
              {title}
            </h2>
            {description && (
              <div className="mt-1 text-sm text-gray-500">{description}</div>
            )}
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            disabled={!dismissible}
            className="text-gray-400 hover:text-gray-700 rounded-lg p-1 -m-1 disabled:opacity-40"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="px-6 pb-6 overflow-y-auto flex-1 min-h-0">
          {children}
        </div>
        {footer && (
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
