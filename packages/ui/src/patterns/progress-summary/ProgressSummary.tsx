import { useId, type ComponentPropsWithoutRef, type ReactNode } from "react";
import {
  Badge,
  type BadgeVariant,
} from "../../components/indicators/badge/Badge";
import { Progress } from "../../components/indicators/progress/Progress";
import { ProgressRing } from "../../components/indicators/progress/ProgressRing";
import { Grid } from "../../components/layout/grid/Grid";
import { Inline } from "../../components/layout/Inline";
import { Stack } from "../../components/layout/Stack";
import { Card } from "../../components/surface/Card";
import { Text } from "../../typography/Text";
import "./progress-summary.css";

export type ProgressSummaryDisplay = "bar" | "ring";

export type ProgressSummaryMetric = {
  /** Stable caller-provided identifier for this metric. */
  id: string;
  /** Caller-provided visible label and accessible name for the indicator. */
  label: string;
  /** Optional caller-provided supporting text. */
  description?: string;
  /** Optional caller-provided supplemental value label. */
  valueLabel?: string;
  /** Caller-supplied determinate range; no progress rules are inferred. */
  value: number;
  /** Optional upper end of the supplied range. */
  max?: number;
  /** Optional caller-provided semantic status badge. */
  badge?: { label: string; variant?: BadgeVariant };
};

export type ProgressSummaryProps = Omit<
  ComponentPropsWithoutRef<"section">,
  "aria-label" | "aria-labelledby" | "children" | "role"
> & {
  /** Optional caller-composed actions, such as Buttons or links. */
  actions?: ReactNode;
  /** Optional caller-provided supporting text. */
  description?: string;
  /** Indicator style used for all supplied metrics. */
  display?: ProgressSummaryDisplay;
  /** Caller-supplied progress metrics; the pattern applies no domain rules. */
  metrics: readonly ProgressSummaryMetric[];
  /** Heading that also names the summary region. */
  title: string;
};

type MetricItemProps = {
  display: ProgressSummaryDisplay;
  metric: ProgressSummaryMetric;
};

function MetricItem({ display, metric }: MetricItemProps) {
  const labelId = useId();
  const descriptionId = useId();
  const hasDescription = metric.description !== undefined;
  const hasValueLabel = metric.valueLabel !== undefined;

  return (
    <div
      aria-labelledby={labelId}
      className="ns-progress-summary__metric"
      role="group"
    >
      <Inline
        align="center"
        className="ns-progress-summary__metric-header"
        gap="2"
        justify="space-between"
      >
        <Text
          as="h3"
          className="ns-progress-summary__metric-label"
          id={labelId}
          variant="label"
        >
          {metric.label}
        </Text>
        <Inline
          align="center"
          className="ns-progress-summary__metric-badges"
          gap="2"
        >
          {display === "bar" && hasValueLabel ? (
            <Badge>{metric.valueLabel}</Badge>
          ) : null}
          {metric.badge === undefined ? null : (
            <Badge variant={metric.badge.variant ?? "neutral"}>
              {metric.badge.label}
            </Badge>
          )}
        </Inline>
      </Inline>
      {hasDescription ? (
        <Text
          as="p"
          className="ns-progress-summary__metric-description"
          color="secondary"
          id={descriptionId}
          variant="caption"
        >
          {metric.description}
        </Text>
      ) : null}
      {display === "ring" ? (
        <div className="ns-progress-summary__ring">
          <ProgressRing
            {...(hasDescription ? { "aria-describedby": descriptionId } : {})}
            aria-label={metric.label}
            size="medium"
            value={metric.value}
            {...(metric.max === undefined ? {} : { max: metric.max })}
          >
            {metric.valueLabel}
          </ProgressRing>
        </div>
      ) : (
        <Progress
          {...(hasDescription ? { "aria-describedby": descriptionId } : {})}
          aria-label={metric.label}
          className="ns-progress-summary__bar"
          value={metric.value}
          {...(metric.max === undefined ? {} : { max: metric.max })}
        />
      )}
    </div>
  );
}

/** Presents caller-supplied progress metrics without calculating domain data. */
export function ProgressSummary({
  actions,
  className,
  description,
  display = "bar",
  metrics,
  title,
  ...props
}: ProgressSummaryProps) {
  const titleId = useId();
  const descriptionId = useId();
  const classes = ["ns-progress-summary", className].filter(Boolean).join(" ");
  const hasDescription = description !== undefined;
  const describedBy = [
    props["aria-describedby"],
    hasDescription ? descriptionId : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  if (!title.trim()) {
    throw new Error("ProgressSummary requires a non-empty title.");
  }

  const metricIds = new Set<string>();
  for (const metric of metrics) {
    if (!metric.id.trim() || metricIds.has(metric.id)) {
      throw new Error(
        "ProgressSummary metric ids must be non-empty and unique.",
      );
    }
    if (!metric.label.trim()) {
      throw new Error("ProgressSummary metric labels must be non-empty.");
    }
    if (metric.badge !== undefined && !metric.badge.label.trim()) {
      throw new Error("ProgressSummary badge labels must be non-empty.");
    }
    metricIds.add(metric.id);
  }

  return (
    <Card
      {...props}
      aria-describedby={describedBy || undefined}
      aria-labelledby={titleId}
      as="section"
      className={classes}
    >
      <Stack className="ns-progress-summary__content" gap="5">
        <header className="ns-progress-summary__header">
          <Text
            as="h2"
            className="ns-progress-summary__title"
            id={titleId}
            variant="heading"
          >
            {title}
          </Text>
          {hasDescription ? (
            <Text
              as="p"
              className="ns-progress-summary__description"
              color="secondary"
              id={descriptionId}
              variant="body"
            >
              {description}
            </Text>
          ) : null}
        </header>
        <Grid className="ns-progress-summary__metrics" columns={3} gap="4">
          {metrics.map((metric) => (
            <MetricItem display={display} key={metric.id} metric={metric} />
          ))}
        </Grid>
        {actions === undefined || actions === null ? null : (
          <Inline
            align="center"
            className="ns-progress-summary__actions"
            gap="3"
            justify="end"
          >
            {actions}
          </Inline>
        )}
      </Stack>
    </Card>
  );
}
