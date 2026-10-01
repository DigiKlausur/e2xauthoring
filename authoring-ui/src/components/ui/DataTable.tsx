import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown, Search } from "lucide-react";
import type { Selection } from "@hooks/ui";
import { Button } from "./Button";
import { Select, TextInput } from "./Input";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  /** Makes the column sortable. */
  sortValue?: (row: T) => string | number;
  /** Text the filter box matches against. */
  filterValue?: (row: T) => string;
  align?: "left" | "right";
  className?: string;
}

export interface DataTableSort {
  key: string;
  direction: "asc" | "desc";
}

export interface DataTableProps<T> {
  rows: T[] | undefined;
  columns: DataTableColumn<T>[];
  getRowId: (row: T) => string;
  isLoading?: boolean;
  /** Shown when there are no rows at all, e.g. "No task pools yet." */
  emptyMessage: string;
  /** Shown when the filter matches nothing, e.g. "No matching task pools." */
  noMatchMessage: string;
  filterPlaceholder?: string;
  initialSort?: DataTableSort;
  pageSizeOptions?: number[];
  /** localStorage key under which the chosen page size is remembered. */
  pageSizeStorageKey?: string;
  /** Extra controls in the toolbar, next to the filter box. */
  toolbar?: ReactNode;
  selection?: Selection & { isRowSelectable?: (row: T) => boolean };
  /** Used for the row checkbox label: "Select row <rowLabel>". */
  rowLabel?: (row: T) => string;
  /** Shown above the table while rows are selected. */
  bulkBar?: (selectedCount: number) => ReactNode;
}

const defaultPageSizes = [10, 25, 50, 100];

function readPageSize(key: string, options: number[]): number {
  try {
    const stored = Number(localStorage.getItem(key));
    if (options.includes(stored)) return stored;
  } catch {
    // Storage can be unavailable (private mode, blocked cookies).
  }
  return options[Math.min(1, options.length - 1)];
}

function writePageSize(key: string, size: number) {
  try {
    localStorage.setItem(key, String(size));
  } catch {
    // See readPageSize.
  }
}

function compare(a: string | number, b: string | number): number {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

export function DataTable<T>({
  rows,
  columns,
  getRowId,
  isLoading = false,
  emptyMessage,
  noMatchMessage,
  filterPlaceholder = "Filter…",
  initialSort,
  pageSizeOptions = defaultPageSizes,
  pageSizeStorageKey = "e2xauthoring.pageSize",
  toolbar,
  selection,
  rowLabel,
  bulkBar,
}: DataTableProps<T>) {
  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState<DataTableSort | undefined>(initialSort);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(() =>
    readPageSize(pageSizeStorageKey, pageSizeOptions),
  );

  const filterable = columns.some((column) => column.filterValue);

  const visibleRows = useMemo(() => {
    let result = rows ?? [];
    const needle = filter.trim().toLowerCase();
    if (needle) {
      result = result.filter((row) =>
        columns.some((column) =>
          column.filterValue?.(row).toLowerCase().includes(needle),
        ),
      );
    }
    const sortColumn = columns.find((column) => column.key === sort?.key);
    if (sort && sortColumn?.sortValue) {
      const value = sortColumn.sortValue;
      const sign = sort.direction === "asc" ? 1 : -1;
      result = [...result].sort((a, b) => sign * compare(value(a), value(b)));
    }
    return result;
  }, [rows, columns, filter, sort]);

  const pageCount = Math.max(1, Math.ceil(visibleRows.length / pageSize));
  // Rows can disappear (deleted, filtered) while the user is on a later page.
  const currentPage = Math.min(page, pageCount - 1);
  const pageRows = visibleRows.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize,
  );
  const firstShown = visibleRows.length === 0 ? 0 : currentPage * pageSize + 1;
  const lastShown = currentPage * pageSize + pageRows.length;

  const toggleSort = (key: string) => {
    setSort((prev) =>
      prev?.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" },
    );
  };

  const selectableIds = selection
    ? pageRows
        .filter((row) => selection.isRowSelectable?.(row) ?? true)
        .map(getRowId)
    : [];
  const selectedOnPage = selectableIds.filter((id) =>
    selection?.selected.has(id),
  ).length;
  const allSelected =
    selectableIds.length > 0 && selectedOnPage === selectableIds.length;

  const headerCheckbox = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (headerCheckbox.current) {
      headerCheckbox.current.indeterminate = selectedOnPage > 0 && !allSelected;
    }
  }, [selectedOnPage, allSelected]);

  const columnCount = columns.length + (selection ? 1 : 0);

  let placeholder: string | null = null;
  if (isLoading) placeholder = "Loading…";
  else if ((rows ?? []).length === 0) placeholder = emptyMessage;
  else if (visibleRows.length === 0) placeholder = noMatchMessage;

  return (
    <div>
      {(filterable || toolbar) && (
        <div className="flex flex-wrap items-center gap-4 mb-4">
          {filterable && (
            <div className="relative w-full max-w-xs">
              <Search className="size-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <TextInput
                type="search"
                aria-label="Filter rows"
                placeholder={filterPlaceholder}
                value={filter}
                onChange={(event) => {
                  setFilter(event.target.value);
                  setPage(0);
                }}
                className="pl-9"
              />
            </div>
          )}
          {toolbar}
        </div>
      )}

      {selection && bulkBar && selection.selected.size > 0 && (
        <div className="flex items-center gap-3 mb-3 px-3 py-2 rounded-lg bg-blue-50 text-sm">
          {bulkBar(selection.selected.size)}
        </div>
      )}

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              {selection && (
                <th className="w-10 px-3 py-2.5">
                  <input
                    ref={headerCheckbox}
                    type="checkbox"
                    aria-label="Select all visible rows"
                    className="accent-primary size-4 align-middle"
                    checked={allSelected}
                    disabled={selectableIds.length === 0}
                    onChange={(event) =>
                      selection.toggleRows(selectableIds, event.target.checked)
                    }
                  />
                </th>
              )}
              {columns.map((column) => {
                const sorted = sort?.key === column.key ? sort : undefined;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={
                      sorted
                        ? sorted.direction === "asc"
                          ? "ascending"
                          : "descending"
                        : undefined
                    }
                    className={`px-3 py-2.5 font-semibold ${column.align === "right" ? "text-right" : ""} ${column.className ?? ""}`}
                  >
                    {column.sortValue ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(column.key)}
                        className="inline-flex items-center gap-1 uppercase tracking-wide hover:text-gray-900"
                      >
                        {column.header}
                        {sorted?.direction === "asc" ? (
                          <ArrowUp className="size-3.5" />
                        ) : sorted?.direction === "desc" ? (
                          <ArrowDown className="size-3.5" />
                        ) : (
                          <ChevronsUpDown className="size-3.5 opacity-40" />
                        )}
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {placeholder !== null ? (
              <tr>
                <td
                  colSpan={columnCount}
                  className="border-t border-gray-200 px-3 py-6 text-sm text-gray-500 text-center"
                >
                  {placeholder}
                </td>
              </tr>
            ) : (
              pageRows.map((row) => {
                const id = getRowId(row);
                const isSelected = selection?.selected.has(id) ?? false;
                const selectable = selection?.isRowSelectable?.(row) ?? true;
                return (
                  <tr
                    key={id}
                    className={isSelected ? "bg-blue-50" : "hover:bg-gray-50"}
                  >
                    {selection && (
                      <td className="border-t border-gray-200 px-3 py-2.5">
                        <input
                          type="checkbox"
                          aria-label={`Select row ${rowLabel?.(row) ?? id}`}
                          className="accent-primary size-4 align-middle"
                          checked={isSelected}
                          disabled={!selectable}
                          onChange={() => selection.toggle(id)}
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`border-t border-gray-200 px-3 py-2.5 text-sm ${column.align === "right" ? "text-right" : ""} ${column.className ?? ""}`}
                      >
                        {column.cell(row)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && visibleRows.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 mt-3 text-sm text-gray-500">
          <span>
            Showing {firstShown}–{lastShown} of {visibleRows.length}
          </span>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2">
              Rows per page
              <Select
                value={pageSize}
                onChange={(event) => {
                  const size = Number(event.target.value);
                  setPageSize(size);
                  setPage(0);
                  writePageSize(pageSizeStorageKey, size);
                }}
                className="w-auto py-1.5"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </Select>
            </label>
            <Button
              variant="secondary"
              size="pagination"
              disabled={currentPage === 0}
              onClick={() => setPage(currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="pagination"
              disabled={currentPage >= pageCount - 1}
              onClick={() => setPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
