export function matchingBoardSizes(
  count: number,
  maximum: number,
): readonly number[] {
  const boards: number[] = [];
  for (let remaining = count; remaining > 0;) {
    const size = Math.min(maximum, remaining);
    boards.push(size);
    remaining -= size;
  }
  if (boards.length > 1 && boards[boards.length - 1] === 1) {
    boards[boards.length - 2] = (boards[boards.length - 2] ?? 0) - 1;
    boards[boards.length - 1] = 2;
  }
  return boards;
}
