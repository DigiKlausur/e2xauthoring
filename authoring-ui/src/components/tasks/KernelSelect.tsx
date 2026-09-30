import { useId } from "react";
import type { KernelOption } from "@hooks/kernels";
import { Field, Select } from "@components/ui/Input";

interface Props {
  kernels: KernelOption[] | undefined;
  value: string;
  onChange: (kernel: string) => void;
  disabled?: boolean;
  help?: string;
}

export function KernelSelect({
  kernels,
  value,
  onChange,
  disabled = false,
  help,
}: Props) {
  const id = useId();
  return (
    <Field label="Kernel" htmlFor={id} help={help}>
      <Select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled || !kernels}
      >
        {!kernels && <option value="">Loading…</option>}
        {kernels?.map((kernel) => (
          <option key={kernel.name} value={kernel.name}>
            {kernel.displayName}
          </option>
        ))}
      </Select>
    </Field>
  );
}
