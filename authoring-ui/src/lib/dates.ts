const hasOffset = /(Z|[+-]\d{2}:?\d{2})$/;

/**
 * Parses a timestamp from nbgrader. nbgrader stores due dates in UTC and
 * serialises them without an offset, which `Date` would read as local time.
 */
export function parseUtc(timestamp: string): Date {
  const iso = timestamp.replace(" ", "T");
  return new Date(hasOffset.test(iso) ? iso : `${iso}Z`);
}

export function formatDateTime(date: Date): string {
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/** Converts the value of a `datetime-local` input to `YYYY-MM-DDTHH:MM` in UTC. */
export function localInputToUtc(value: string): string {
  return new Date(value).toISOString().slice(0, 16);
}
