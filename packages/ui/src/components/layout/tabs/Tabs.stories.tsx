import type { Meta, StoryObj } from "@storybook/react-vite";
// eslint-disable-next-line @nx/enforce-module-boundaries -- Storybook exercises the package API as a consumer.
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@opennihongo/ui";
import { expect, userEvent, within } from "storybook/test";

const meta = {
  title: "Components/Tabs",
  component: Tabs,
  parameters: {
    docs: {
      description: {
        component:
          "Use tabs to switch between peer panels in the current view, not for route navigation. Focus a tab and use Left/Right Arrow keys for horizontal tabs or Up/Down Arrow keys for vertical tabs. On narrow containers, the horizontal tab strip scrolls inline without wrapping.",
      },
    },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StudyMaterials: Story = {
  render: () => (
    <Tabs defaultValue="kana">
      <TabsList aria-label="Study materials">
        <TabsTrigger value="kana">Kana</TabsTrigger>
        <TabsTrigger value="kanji">Kanji</TabsTrigger>
        <TabsTrigger value="grammar">Grammar</TabsTrigger>
      </TabsList>
      <TabsContent value="kana">Review the kana writing systems.</TabsContent>
      <TabsContent value="kanji">
        Explore kanji readings and meanings.
      </TabsContent>
      <TabsContent value="grammar">Study grammar patterns.</TabsContent>
    </Tabs>
  ),
};

export const Vertical: Story = {
  render: () => (
    <Tabs defaultValue="kana" orientation="vertical">
      <TabsList aria-label="Study materials">
        <TabsTrigger value="kana">Kana</TabsTrigger>
        <TabsTrigger value="kanji">Kanji</TabsTrigger>
        <TabsTrigger value="grammar">Grammar</TabsTrigger>
      </TabsList>
      <TabsContent value="kana">Review the kana writing systems.</TabsContent>
      <TabsContent value="kanji">
        Explore kanji readings and meanings.
      </TabsContent>
      <TabsContent value="grammar">Study grammar patterns.</TabsContent>
    </Tabs>
  ),
};

export const DisabledTab: Story = {
  render: () => (
    <Tabs defaultValue="kana">
      <TabsList aria-label="Study materials">
        <TabsTrigger value="kana">Kana</TabsTrigger>
        <TabsTrigger disabled value="kanji">
          Kanji (coming soon)
        </TabsTrigger>
        <TabsTrigger value="grammar">Grammar</TabsTrigger>
      </TabsList>
      <TabsContent value="kana">Review the kana writing systems.</TabsContent>
      <TabsContent value="kanji">
        Explore kanji readings and meanings.
      </TabsContent>
      <TabsContent value="grammar">Study grammar patterns.</TabsContent>
    </Tabs>
  ),
};

export const KeyboardNavigation: Story = {
  ...StudyMaterials,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const kanaTab = canvas.getByRole("tab", { name: "Kana" });
    const kanjiTab = canvas.getByRole("tab", { name: "Kanji" });

    await userEvent.tab();
    await expect(kanaTab).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");

    await expect(kanjiTab).toHaveAttribute("aria-selected", "true");
    await expect(
      canvas.getByRole("tabpanel", { name: "Kanji" }),
    ).toHaveTextContent("Explore kanji readings and meanings.");
  },
};
