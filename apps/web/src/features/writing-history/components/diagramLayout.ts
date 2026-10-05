import type { HistoryUnit } from "@opennihongo/content";

type Diagram = Extract<HistoryUnit, { kind: "diagram" }>;

/** Lay out relationships in parallel levels, without implying total replacement. */
export function layoutHistoryDiagram(unit: Diagram) {
  const pending = new Set(unit.nodes.map(({ id }) => id));
  for (const edge of unit.edges) {
    if (!pending.has(edge.from) || !pending.has(edge.to))
      throw new Error("Unknown history diagram endpoint.");
  }
  const levels = new Map<string, number>();
  while (pending.size > 0) {
    let placed = false;
    for (const id of pending) {
      const parents = unit.edges.filter((edge) => edge.to === id);
      if (parents.some(({ from }) => !levels.has(from))) continue;
      levels.set(
        id,
        Math.max(-1, ...parents.map(({ from }) => levels.get(from) ?? -1)) + 1,
      );
      pending.delete(id);
      placed = true;
    }
    if (!placed) throw new Error("History diagram relationships are cyclic.");
  }
  const rows = Array.from(
    { length: Math.max(0, ...levels.values()) + 1 },
    (_, level) => unit.nodes.filter(({ id }) => levels.get(id) === level),
  );
  const width = Math.max(2, ...rows.map((row) => row.length)) * 300;
  const nodes = rows.flatMap((row, level) =>
    row.map((node, column) => ({
      ...node,
      x: (width * (column + 0.5)) / row.length,
      y: level * 150 + 55,
    })),
  );
  function endpoint(id: string) {
    const node = nodes.find((entry) => entry.id === id);
    if (!node) throw new Error("Unknown history diagram endpoint.");
    return node;
  }
  const edges = unit.edges.map((edge) => {
    const from = endpoint(edge.from);
    const to = endpoint(edge.to);
    const detour = to.y - from.y > 150;
    const side = from.x <= width / 2 ? -1 : 1;
    return {
      ...edge,
      start: {
        x: detour ? from.x + side * 130 : from.x,
        y: detour ? from.y : from.y + 44,
      },
      end: {
        x: detour ? to.x + side * 130 : to.x,
        y: detour ? to.y : to.y - 44,
      },
      routeX: detour ? (side === -1 ? -14 : width + 14) : null,
    };
  });
  return { width, height: rows.length * 150 - 35, nodes, edges };
}

export function historyDiagramLabel(label: string): readonly string[] {
  const lines: string[] = [];
  for (const word of label.split(" ")) {
    const last = lines.at(-1);
    if (last !== undefined && last.length + word.length < 18)
      lines[lines.length - 1] = `${last} ${word}`;
    else lines.push(word);
  }
  return lines;
}
