import { Link } from "@tanstack/react-router";
import { Stack, Surface, Text } from "@opennihongo/ui";

export function UpcomingSectionPage({
  label,
  description,
}: {
  label: string;
  description: string;
}) {
  return (
    <section
      aria-labelledby="section-title"
      className="my-auto max-w-2xl py-12"
    >
      <Stack gap="6">
        <Stack gap="3">
          <Text color="secondary" variant="label">
            Coming soon
          </Text>
          <Text id="section-title" variant="display">
            {label}
          </Text>
          <Text color="secondary">{description}</Text>
        </Stack>
        <Surface className="p-6" elevation="card">
          <Stack gap="3">
            <Text as="p" variant="heading">
              This section is on its way.
            </Text>
            <Text color="secondary">
              OpenNihongo is taking shape. You can return to the learning space
              while this section is being prepared.
            </Text>
            <Link className="font-bold text-brand-text underline" to="/">
              Back to Learn
            </Link>
          </Stack>
        </Surface>
      </Stack>
    </section>
  );
}
