import { useEffect } from "react";
import { appName } from "@domain/texts";

/** Sets the browser tab title to `<parts joined by " / "> – e²xauthoring`. */
export function useDocumentTitle(...parts: string[]) {
  const title = parts.join(" / ");
  useEffect(() => {
    document.title = title ? `${title} – ${appName}` : appName;
  }, [title]);
}
