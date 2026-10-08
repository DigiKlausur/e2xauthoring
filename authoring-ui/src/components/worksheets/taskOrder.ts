import type { Task } from "@api";

export const taskKey = (task: Task) => `${task.pool}/${task.name}`;

/**
 * Moves the element at index `from` so that it ends up in front of the
 * element that is currently at index `before` (0 <= before <= length).
 */
export function moveBefore<T>(array: T[], from: number, before: number): T[] {
  const to = before > from ? before - 1 : before;
  if (from === to || from < 0 || to < 0 || to >= array.length) {
    return array;
  }
  const result = [...array];
  result.splice(to, 0, result.splice(from, 1)[0]);
  return result;
}
