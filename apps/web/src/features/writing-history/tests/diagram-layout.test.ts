import { describe, expect, it } from "vitest";
import {
  getWritingHistoryChapter,
  type HistoryUnit,
} from "@opennihongo/content";
import { layoutHistoryDiagram } from "../components/diagramLayout";

type Diagram = Extract<HistoryUnit, { kind: "diagram" }>;
function finalDiagram(): Diagram {
  const unit = getWritingHistoryChapter("modern-writing")?.units.find(
    (entry) => entry.kind === "diagram",
  );
  if (!unit) throw new Error("Missing final diagram");
  return unit;
}

describe("history diagram layout", () => {
  it("places parallel kana paths together and connects continuing kanji to mixed writing", () => {
    const layout = layoutHistoryDiagram(finalDiagram());
    const position = (id: string) => {
      const node = layout.nodes.find((entry) => entry.id === id);
      if (!node) throw new Error(`Missing ${id}`);
      return node;
    };
    expect(position("hiragana").y).toBe(position("katakana").y);
    expect(position("hiragana").x).not.toBe(position("katakana").x);
    expect(position("kanji").y).toBeLessThan(position("mixed").y);
    expect(
      layout.edges.find(({ from, to }) => from === "kanji" && to === "mixed"),
    ).toBeDefined();
    expect(
      layout.edges.find(({ from, to }) => from === "kanji" && to === "mixed")
        ?.routeX,
    ).toBeLessThan(0);
    for (const edge of layout.edges)
      expect(edge.start.y).toBeLessThan(edge.end.y);
  });

  it("derives the same chronological levels regardless of authored node order", () => {
    const diagram = finalDiagram();
    const original = layoutHistoryDiagram(diagram);
    const reordered = layoutHistoryDiagram({
      ...diagram,
      nodes: [...diagram.nodes].reverse(),
    });
    for (const node of original.nodes)
      expect(reordered.nodes.find(({ id }) => id === node.id)?.y).toBe(node.y);
  });

  it("rejects diagrams with cycles or missing endpoints", () => {
    const diagram = finalDiagram();
    expect(() => {
      layoutHistoryDiagram({
        ...diagram,
        edges: [
          ...diagram.edges,
          { from: "modern", to: "chinese", label: "Cycle" },
        ],
      });
    }).toThrow("cyclic");
    expect(() => {
      layoutHistoryDiagram({
        ...diagram,
        edges: [{ from: "missing", to: "chinese", label: "Broken" }],
      });
    }).toThrow("Unknown");
  });
});
