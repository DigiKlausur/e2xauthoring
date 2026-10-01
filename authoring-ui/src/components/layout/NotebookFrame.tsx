interface Props {
  src: string;
  title: string;
}

/** Embeds a notebook opened in Jupyter, filling the rest of the page. */
export function NotebookFrame({ src, title }: Props) {
  return (
    <div className="flex-1 flex flex-col px-10 py-8 min-h-[60vh]">
      <iframe
        src={src}
        title={title}
        className="flex-1 w-full bg-white border border-gray-200 rounded-xl"
      />
    </div>
  );
}
