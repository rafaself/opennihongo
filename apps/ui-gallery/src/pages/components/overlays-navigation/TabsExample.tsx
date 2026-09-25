import { Tabs, TabsContent, TabsList, TabsTrigger } from "@opennihongo/ui";

export function TabsExample() {
  return (
    <article className="gallery-doc-example-card">
      <h3>Tabs</h3>
      <p>Focus a tab and use the arrow keys to switch panels.</p>
      <div className="gallery-doc-example-stage">
        <Tabs defaultValue="hiragana">
          <TabsList aria-label="Writing systems">
            <TabsTrigger value="hiragana">Hiragana</TabsTrigger>
            <TabsTrigger value="katakana">Katakana</TabsTrigger>
          </TabsList>
          <TabsContent value="hiragana">
            Review the basic hiragana syllabary.
          </TabsContent>
          <TabsContent value="katakana">
            Review the basic katakana syllabary.
          </TabsContent>
        </Tabs>
      </div>
    </article>
  );
}
