import { useId } from "react";
import type { Template } from "@api";
import { Alert } from "@components/ui/Alert";
import { Field, Select, TextInput } from "@components/ui/Input";
import { getErrorMessage } from "@/lib/errorMessage";

interface Props {
  templates: Template[] | undefined;
  templatesError: unknown;
  template: string | null;
  onTemplateChange: (template: Template | null) => void;
  values: Record<string, string>;
  onValuesChange: (values: Record<string, string>) => void;
}

export function SelectTemplateStep({
  templates,
  templatesError,
  template,
  onTemplateChange,
  values,
  onValuesChange,
}: Props) {
  const selectId = useId();
  const variables = Object.keys(values);

  return (
    <div>
      {templatesError != null && (
        <Alert title="Could not load the templates" className="mb-4">
          {getErrorMessage(templatesError)}
        </Alert>
      )}
      <Field
        label="Template"
        htmlFor={selectId}
        help="The template adds header and footer cells to the worksheet."
        className="max-w-md"
      >
        <Select
          id={selectId}
          value={template ?? ""}
          disabled={!templates}
          onChange={(event) =>
            onTemplateChange(
              templates?.find((t) => t.name === event.target.value) ?? null,
            )
          }
        >
          <option value="">No template</option>
          {templates?.map((t) => (
            <option key={t.name} value={t.name}>
              {t.name}
            </option>
          ))}
        </Select>
      </Field>

      {template !== null && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold mb-1">Template variables</h3>
          {variables.length === 0 ? (
            <p className="text-sm text-gray-500">
              This template has no variables.
            </p>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">
                These values replace the <code>{"{{ variable }}"}</code>{" "}
                placeholders in the template.
              </p>
              <div className="grid gap-x-6 sm:grid-cols-2 max-w-3xl">
                {variables.map((variable) => (
                  <VariableField
                    key={variable}
                    name={variable}
                    value={values[variable]}
                    onChange={(value) =>
                      onValuesChange({ ...values, [variable]: value })
                    }
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function VariableField({
  name,
  value,
  onChange,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = useId();
  return (
    <Field label={name} htmlFor={id}>
      <TextInput
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}
