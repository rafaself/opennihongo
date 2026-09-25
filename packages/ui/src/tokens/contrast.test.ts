import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

type Theme = "light" | "dark";
type Color = readonly [number, number, number];

interface ContrastPair {
  readonly theme: Theme;
  readonly foreground: string;
  readonly background: string;
  readonly minimum: number;
}

const stylesheet = readFileSync(
  resolve(process.cwd(), "src/tokens.css"),
  "utf8",
);
const lightStart = stylesheet.indexOf(':root,\n[data-theme="light"] {');
const darkStart = stylesheet.indexOf('[data-theme="dark"] {', lightStart);

if (lightStart < 0 || darkStart < 0) {
  throw new Error("Could not find the light and dark color theme token maps.");
}

const themeStyles: Record<Theme, string> = {
  light: stylesheet.slice(lightStart, darkStart),
  dark: stylesheet.slice(darkStart),
};
const surfaceTokens = [
  "--ns-color-canvas",
  "--ns-color-surface",
  "--ns-color-surface-subtle",
  "--ns-color-surface-raised",
] as const;
const textTokens = [
  "--ns-color-text-primary",
  "--ns-color-ink",
  "--ns-color-text-secondary",
  "--ns-color-muted",
  "--ns-color-text-tertiary",
] as const;
const accents = [
  ["--ns-color-feedback-success", "--ns-color-feedback-success-surface"],
  ["--ns-color-feedback-warning", "--ns-color-feedback-warning-surface"],
  ["--ns-color-feedback-info", "--ns-color-feedback-info-surface"],
  ["--ns-color-feedback-danger", "--ns-color-feedback-danger-surface"],
  ["--ns-color-reward-xp", "--ns-color-reward-xp-surface"],
  ["--ns-color-reward-streak", "--ns-color-reward-streak-surface"],
  ["--ns-color-reward-achievement", "--ns-color-reward-achievement-surface"],
] as const;

function declarationValue(source: string, token: string): string {
  const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const declaration = new RegExp(`${escapedToken}:\\s*([^;]+);`).exec(source);
  const value = declaration?.[1]?.trim();

  if (!value) {
    throw new Error(`Missing CSS custom property ${token}.`);
  }

  return value;
}

function resolveColor(
  token: string,
  theme: Theme,
  resolving: ReadonlySet<string> = new Set(),
): Color {
  if (resolving.has(token)) {
    throw new Error(`Circular CSS custom property reference: ${token}.`);
  }

  const declarationSource = token.startsWith("--ns-primitive-color-")
    ? stylesheet
    : themeStyles[theme];
  const value = declarationValue(declarationSource, token);
  const nextResolving = new Set(resolving).add(token);
  const alias = value.match(/^var\((--[\w-]+)\)$/);

  if (alias?.[1]) {
    return resolveColor(alias[1], theme, nextResolving);
  }

  const hex = value.match(/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);

  if (hex?.[1] && hex[2] && hex[3]) {
    return [
      Number.parseInt(hex[1], 16) / 255,
      Number.parseInt(hex[2], 16) / 255,
      Number.parseInt(hex[3], 16) / 255,
    ];
  }

  const mix = value.match(
    /^color-mix\(\s*in srgb,\s*var\((--[\w-]+)\)\s*([\d.]+)%\s*,\s*var\((--[\w-]+)\)\s*\)$/,
  );

  if (mix?.[1] && mix[2] && mix[3]) {
    const first = resolveColor(mix[1], theme, nextResolving);
    const second = resolveColor(mix[3], theme, nextResolving);
    const firstWeight = Number(mix[2]) / 100;

    return [
      first[0] * firstWeight + second[0] * (1 - firstWeight),
      first[1] * firstWeight + second[1] * (1 - firstWeight),
      first[2] * firstWeight + second[2] * (1 - firstWeight),
    ];
  }

  throw new Error(`Unsupported color value for ${token}: ${value}.`);
}

function relativeLuminance(color: Color): number {
  const linear = color.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );

  return (
    (linear[0] ?? 0) * 0.2126 +
    (linear[1] ?? 0) * 0.7152 +
    (linear[2] ?? 0) * 0.0722
  );
}

function contrastRatio(
  foreground: string,
  background: string,
  theme: Theme,
): number {
  const foregroundLuminance = relativeLuminance(
    resolveColor(foreground, theme),
  );
  const backgroundLuminance = relativeLuminance(
    resolveColor(background, theme),
  );
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

const contrastPairs: ContrastPair[] = [];

for (const theme of ["light", "dark"] as const) {
  for (const foreground of textTokens) {
    for (const background of surfaceTokens) {
      contrastPairs.push({ theme, foreground, background, minimum: 4.5 });
    }
  }

  for (const foreground of [
    "--ns-color-brand-text",
    "--ns-color-brand-text-hover",
  ]) {
    for (const background of surfaceTokens) {
      contrastPairs.push({ theme, foreground, background, minimum: 4.5 });
    }
  }

  contrastPairs.push(
    {
      theme,
      foreground: "--ns-color-text-inverse",
      background: "--ns-color-text-primary",
      minimum: 4.5,
    },
    {
      theme,
      foreground: "--ns-color-selection-foreground",
      background: "--ns-color-selection",
      minimum: 4.5,
    },
  );

  for (const foreground of [
    "--ns-color-action-primary-foreground",
    "--ns-color-brand-foreground",
  ]) {
    for (const background of [
      "--ns-color-action-primary",
      "--ns-color-action-primary-hover",
      "--ns-color-brand",
      "--ns-color-brand-hover",
    ]) {
      contrastPairs.push({ theme, foreground, background, minimum: 4.5 });
    }
  }

  for (const foreground of ["--ns-color-focus", "--ns-color-border"] as const) {
    for (const background of surfaceTokens) {
      contrastPairs.push({ theme, foreground, background, minimum: 3 });
    }
  }

  for (const background of surfaceTokens) {
    contrastPairs.push({
      theme,
      foreground: "--ns-color-border-strong",
      background,
      minimum: 3,
    });
  }

  for (const [foreground, pairedSurface] of accents) {
    contrastPairs.push({
      theme,
      foreground,
      background: pairedSurface,
      minimum: 4.5,
    });

    for (const background of surfaceTokens) {
      contrastPairs.push({ theme, foreground, background, minimum: 4.5 });
    }
  }
}

describe("semantic color contrast", () => {
  it("uses the WCAG relative-luminance contrast formula", () => {
    expect(
      contrastRatio(
        "--ns-primitive-color-neutral-0",
        "--ns-primitive-color-sumi-900",
        "light",
      ),
    ).toBeCloseTo(17.77, 2);
  });

  for (const pair of contrastPairs) {
    it(`${pair.theme}: ${pair.foreground} on ${pair.background} meets ${String(pair.minimum)}:1`, () => {
      expect(
        contrastRatio(pair.foreground, pair.background, pair.theme),
      ).toBeGreaterThanOrEqual(pair.minimum);
    });
  }
});
