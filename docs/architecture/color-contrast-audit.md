# Semantic color contrast audit

This audit measures the shared semantic color pairs in
`packages/ui/src/tokens.css` for the default light theme and the explicit dark
theme. The tables report ratios rounded to two decimals; the regression test
uses the unrounded values.

Text pairs are checked against the WCAG 2.2 AA SC 1.4.3 normal-text threshold
of 4.5:1. That also exceeds the 3:1 threshold for large text. Focus indicators
and meaningful control boundaries are checked against the SC 1.4.11 non-text
threshold of 3:1. Ratios use the WCAG relative-luminance formula and sRGB
values. The dark `surface` and `surface-subtle` mixes are evaluated at their
defined 82% and 65% weights.

## Text on neutral surfaces

Each cell is the contrast ratio between its row's foreground token and the
column's surface token. The inline brand text roles are included because they
are used for links and labels. The light and dark brand text aliases preserve a
red brand while selecting a legible red step for each theme.

### Light theme

| Foreground token              | Canvas | Surface | Surface subtle | Surface raised |
| ----------------------------- | -----: | ------: | -------------: | -------------: |
| `--ns-color-text-primary`     |  17.01 |   17.77 |          15.85 |          17.77 |
| `--ns-color-text-secondary`   |  10.60 |   11.07 |           9.87 |          11.07 |
| `--ns-color-text-tertiary`    |   6.73 |    7.03 |           6.27 |           7.03 |
| `--ns-color-brand-text`       |   6.33 |    6.61 |           5.90 |           6.61 |
| `--ns-color-brand-text-hover` |   8.44 |    8.81 |           7.86 |           8.81 |

### Dark theme

| Foreground token              | Canvas | Surface | Surface subtle | Surface raised |
| ----------------------------- | -----: | ------: | -------------: | -------------: |
| `--ns-color-text-primary`     |  17.01 |   15.89 |          14.77 |          10.60 |
| `--ns-color-text-secondary`   |  15.85 |   14.81 |          13.77 |           9.87 |
| `--ns-color-text-tertiary`    |  10.70 |    9.99 |           9.29 |           6.66 |
| `--ns-color-brand-text`       |   7.62 |    7.12 |           6.62 |           4.75 |
| `--ns-color-brand-text-hover` |  14.42 |   13.47 |          12.52 |           8.98 |

`--ns-color-ink` and `--ns-color-muted` alias primary and secondary text, so
their pairs have the same ratios. `--ns-color-brand` and
`--ns-color-brand-hover` alias the action fills; their white foreground alias
is covered by the action pairs below.

Inverse text is paired with the primary text color, as in the Text component's
inverse-color example. Its ratios are 17.77:1 in light mode and 17.01:1 in dark
mode.

## Primary action text and feedback/reward pairs

The action foreground is white in both themes. These pairs cover the default
and hover action backgrounds, including the white check or indicator used by
selected controls:

| Theme | Action background token           | Foreground token                       | Ratio |
| ----- | --------------------------------- | -------------------------------------- | ----: |
| Light | `--ns-color-action-primary`       | `--ns-color-action-primary-foreground` |  6.61 |
| Light | `--ns-color-action-primary-hover` | `--ns-color-action-primary-foreground` |  8.81 |
| Dark  | `--ns-color-action-primary`       | `--ns-color-action-primary-foreground` |  4.91 |
| Dark  | `--ns-color-action-primary-hover` | `--ns-color-action-primary-foreground` |  6.61 |

Every feedback and reward foreground is also checked on all four neutral
surfaces and on its matching tinted surface. This covers inline status text as
well as the paired Badge, QuestCard, reward, achievement, and streak treatments.

### Light theme accents

| Foreground token                | Canvas | Surface | Surface subtle | Surface raised | Matching tinted surface |
| ------------------------------- | -----: | ------: | -------------: | -------------: | ----------------------: |
| `--ns-color-feedback-success`   |   7.22 |    7.54 |           6.73 |           7.54 |                    6.97 |
| `--ns-color-feedback-warning`   |   5.67 |    5.92 |           5.29 |           5.92 |                    5.60 |
| `--ns-color-feedback-info`      |   6.66 |    6.95 |           6.20 |           6.95 |                    6.43 |
| `--ns-color-feedback-danger`    |   8.44 |    8.81 |           7.86 |           8.81 |                    8.03 |
| `--ns-color-reward-xp`          |   5.67 |    5.92 |           5.29 |           5.92 |                    5.60 |
| `--ns-color-reward-streak`      |   6.04 |    6.31 |           5.63 |           6.31 |                    5.79 |
| `--ns-color-reward-achievement` |   8.18 |    8.54 |           7.62 |           8.54 |                    7.66 |

### Dark theme accents

| Foreground token                | Canvas | Surface | Surface subtle | Surface raised | Matching tinted surface |
| ------------------------------- | -----: | ------: | -------------: | -------------: | ----------------------: |
| `--ns-color-feedback-success`   |   9.48 |    8.86 |           8.23 |           5.91 |                    6.59 |
| `--ns-color-feedback-warning`   |  10.92 |   10.20 |           9.48 |           6.80 |                    6.84 |
| `--ns-color-feedback-info`      |   9.11 |    8.51 |           7.91 |           5.67 |                    6.19 |
| `--ns-color-feedback-danger`    |   7.62 |    7.12 |           6.62 |           4.75 |                    6.01 |
| `--ns-color-reward-xp`          |  10.92 |   10.20 |           9.48 |           6.80 |                    6.84 |
| `--ns-color-reward-streak`      |   9.23 |    8.62 |           8.01 |           5.75 |                    6.16 |
| `--ns-color-reward-achievement` |   8.24 |    7.70 |           7.16 |           5.13 |                    6.14 |

## Focus, selection, and control boundaries

The focus ring is offset outside the focused control, so the relevant adjacent
color is the surrounding surface. Standard and strong border colors are
checked on each surface because they can identify input, selection, or other
control boundaries.

### Light theme

| Foreground token           | Canvas | Surface | Surface subtle | Surface raised |
| -------------------------- | -----: | ------: | -------------: | -------------: |
| `--ns-color-focus`         |   3.68 |    3.84 |           3.43 |           3.84 |
| `--ns-color-border`        |   4.31 |    4.50 |           4.02 |           4.50 |
| `--ns-color-border-strong` |  10.60 |   11.07 |           9.87 |          11.07 |

### Dark theme

| Foreground token           | Canvas | Surface | Surface subtle | Surface raised |
| -------------------------- | -----: | ------: | -------------: | -------------: |
| `--ns-color-focus`         |  10.92 |   10.20 |           9.48 |           6.80 |
| `--ns-color-border`        |  10.70 |    9.99 |           9.29 |           6.66 |
| `--ns-color-border-strong` |  15.85 |   14.81 |          13.77 |           9.87 |

The text-selection pairs (`--ns-color-selection-foreground` on
`--ns-color-selection`) measure 16.18:1 in light mode and 13.41:1 in dark mode.

## Scope and criterion-based exceptions

- The white action foreground passes 4.5:1 against both red action fills in
  both themes. In dark mode, a red fill by itself can be below 3:1 against a
  raised neutral surface. WCAG 2.2 SC 1.4.11 does not require a control boundary
  when other visible information identifies the control; these buttons retain
  their passing text or icon. The separate, offset focus ring passes 3:1 on all
  neutral surfaces. Hover and default fills are sequential states and are not
  compared to one another.
- `--ns-color-border-subtle` is used for decorative separators and surfaces
  whose text, icon, or structure already communicates their purpose. It is not
  used as the sole cue identifying an interactive control. Standard and strong
  borders, which are used on controls, meet at least 3:1 in both themes.
- Inactive controls are exempt from SC 1.4.11. No disabled-state color is used
  to claim that those controls pass a threshold.
- The translucent overlay backdrop is not listed as a fixed text pair because
  its rendered value depends on the underlying content. Evaluating that
  composition belongs to a page-level audit.
- These are checks of defined semantic token pairs, not rendered page content.
  They do not establish WCAG conformance for the product or any complete page.

The [WCAG 2.2 text contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
and [non-text contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)
define the thresholds and criteria used here. Automated pair checks live in
`packages/ui/src/tokens/contrast.test.ts` and fail when a measured value falls
below its applicable threshold.
