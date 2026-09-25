import { Button, Stack, Surface, Text } from "@opennihongo/ui";

export function WelcomeView() {
  return (
    <section
      aria-labelledby="welcome-title"
      className="my-auto grid gap-8 py-12 md:grid-cols-[minmax(0,1fr)_18rem] md:items-center"
    >
      <Stack className="max-w-2xl" gap="4">
        <Text color="secondary" variant="label">
          Your Japanese learning space
        </Text>
        <Text className="text-balance" id="welcome-title" variant="display">
          Make steady progress, one step at a time.
        </Text>
        <Text className="max-w-xl" color="secondary">
          OpenNihongo is being prepared as a calm, local-first place to learn
          Japanese.
        </Text>
      </Stack>

      <aside aria-label="Getting started">
        <Surface className="p-6" elevation="card">
          <Stack gap="6">
            <Stack gap="2">
              <Text color="secondary" variant="label">
                Getting started
              </Text>
              <Text as="p" variant="heading">
                Your study space is on its way.
              </Text>
            </Stack>
            <Button className="w-full" disabled>
              Study content coming soon
            </Button>
          </Stack>
        </Surface>
      </aside>
    </section>
  );
}
