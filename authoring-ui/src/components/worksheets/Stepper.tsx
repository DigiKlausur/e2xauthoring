import { Check } from "lucide-react";

interface Props {
  steps: string[];
  active: number;
}

export function Stepper({ steps, active }: Props) {
  return (
    <ol className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6">
      {steps.map((step, index) => {
        const done = index < active;
        const current = index === active;
        return (
          <li
            key={step}
            aria-current={current ? "step" : undefined}
            className="flex items-center gap-2 text-sm"
          >
            <span
              className={`flex size-7 items-center justify-center rounded-full text-xs font-semibold ${
                done
                  ? "bg-primary text-primary-foreground"
                  : current
                    ? "border-2 border-primary text-primary"
                    : "border border-gray-300 text-gray-400"
              }`}
            >
              {done ? <Check className="size-4" /> : index + 1}
            </span>
            <span
              className={
                current ? "font-semibold text-gray-900" : "text-gray-500"
              }
            >
              {step}
            </span>
            {index < steps.length - 1 && (
              <span className="hidden sm:block w-10 h-px bg-gray-300 ml-2" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
