// `git diff --color` output. The UI colours diff lines itself, so the escape
// codes are removed rather than rendered as HTML.
// eslint-disable-next-line no-control-regex
const ansiEscape = /\x1b\[[0-9;]*[A-Za-z]/g;

export function stripAnsi(text: string): string {
  return text.replace(ansiEscape, "");
}
