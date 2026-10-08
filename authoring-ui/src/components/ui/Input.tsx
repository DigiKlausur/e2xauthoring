import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

const controlClasses =
  "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50 disabled:text-gray-500";

const invalidClasses = "border-red-400";

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export function TextInput({
  invalid = false,
  className = "",
  ...props
}: TextInputProps) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={`${controlClasses} ${invalid ? invalidClasses : ""} ${className}`}
      {...props}
    />
  );
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export function Textarea({
  invalid = false,
  className = "",
  ...props
}: TextareaProps) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={`${controlClasses} ${invalid ? invalidClasses : ""} ${className}`}
      {...props}
    />
  );
}

export function Select({
  className = "",
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${controlClasses} ${className}`} {...props} />;
}

export interface FieldProps {
  label: string;
  htmlFor: string;
  /** Shown under the control while there is no error. */
  help?: ReactNode;
  error?: string | null;
  children: ReactNode;
  className?: string;
}

export function Field({
  label,
  htmlFor,
  help,
  error,
  children,
  className = "",
}: FieldProps) {
  return (
    <div className={`mb-4 last:mb-0 ${className}`}>
      <label htmlFor={htmlFor} className="block text-sm font-semibold mb-2">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      ) : (
        help && <p className="text-xs text-gray-500 mt-1">{help}</p>
      )}
    </div>
  );
}
