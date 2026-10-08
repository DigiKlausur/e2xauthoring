export function getCookie(name: string): string | null {
  for (const cookie of document.cookie.split(";")) {
    const trimmed = cookie.trim();
    if (trimmed.startsWith(`${name}=`)) {
      return decodeURIComponent(trimmed.substring(name.length + 1));
    }
  }
  return null;
}

/** Joins URL parts with exactly one slash between them. */
export function urlJoin(...parts: string[]): string {
  return parts
    .map((part, index) => {
      let result = part;
      if (index > 0) result = result.replace(/^\/+/, "");
      if (index < parts.length - 1) result = result.replace(/\/+$/, "");
      return result;
    })
    .join("/");
}
