import { ExternalLink } from "lucide-react";

/** Header action that opens the embedded notebook in its own tab. */
export function OpenInJupyterLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors bg-white text-primary border border-primary hover:bg-primary-subtle"
    >
      <ExternalLink className="size-4" />
      Open in Jupyter
    </a>
  );
}
