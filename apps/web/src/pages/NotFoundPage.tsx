import { Link } from "@tanstack/react-router";
import { Stack, Text } from "@opennihongo/ui";

export function NotFoundPage() {
  return (
    <section aria-labelledby="not-found-title" className="my-auto py-12">
      <Stack gap="4">
        <Text color="secondary" variant="label">
          Page not found
        </Text>
        <Text id="not-found-title" variant="display">
          This page doesn't exist.
        </Text>
        <Text color="secondary">
          The address may have changed, or there may be a typo in the URL.
        </Text>
        <Link className="font-bold text-brand-text underline" to="/">
          Back to Learn
        </Link>
      </Stack>
    </section>
  );
}
