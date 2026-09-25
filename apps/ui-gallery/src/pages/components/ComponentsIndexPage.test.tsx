import * as sharedIcons from "@opennihongo/ui/icons";
import * as sharedUi from "@opennihongo/ui";
import { describe, expect, it } from "vitest";
import {
  componentCatalogCategories,
  componentCatalogResources,
} from "../../catalog/components";
import { galleryNavigation } from "../../catalog/navigation";

describe("component catalog metadata", () => {
  it("lists every implemented public component and icon exactly once", () => {
    const catalogApiNames = [
      ...componentCatalogCategories.flatMap(({ items }) => items),
      ...componentCatalogResources.flatMap(({ items }) =>
        items.map(({ name }) => name),
      ),
    ];
    const publicApiNames = [
      ...Object.keys(sharedUi),
      ...Object.keys(sharedIcons),
    ];

    expect(new Set(catalogApiNames).size).toBe(catalogApiNames.length);
    expect([...catalogApiNames].sort()).toEqual([...publicApiNames].sort());
  });

  it("adds the index and all three focused pages to component navigation", () => {
    const componentsSection = galleryNavigation.sections.find(
      ({ id }) => id === "components",
    );

    expect(componentsSection?.links.map(({ to }) => to)).toEqual([
      "/components",
      ...componentCatalogCategories.map(({ to }) => to),
    ]);
  });
});
