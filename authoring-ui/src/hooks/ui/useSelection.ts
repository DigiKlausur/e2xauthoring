import { useCallback, useState } from "react";

export interface Selection {
  selected: Set<string>;
  toggle: (id: string) => void;
  /** Selects all `ids` when `checked`, otherwise deselects them. */
  toggleRows: (ids: string[], checked: boolean) => void;
  remove: (ids: string[]) => void;
  clear: () => void;
}

export function useSelection(): Selection {
  const [selected, setSelected] = useState<Set<string>>(() => new Set());

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleRows = useCallback((ids: string[], checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (checked) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }, []);

  const remove = useCallback((ids: string[]) => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const id of ids) next.delete(id);
      return next;
    });
  }, []);

  const clear = useCallback(() => setSelected(new Set()), []);

  return { selected, toggle, toggleRows, remove, clear };
}
