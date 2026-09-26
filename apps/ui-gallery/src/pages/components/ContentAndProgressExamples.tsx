import {
  Avatar,
  Badge,
  Card,
  Divider,
  Progress,
  ProgressRing,
  Skeleton,
  Spinner,
} from "@opennihongo/ui";

export function ContentAndProgressExamples() {
  return (
    <div
      style={{
        backgroundColor: "var(--ns-color-canvas)",
        borderRadius: "var(--ns-radius-lg)",
        color: "var(--ns-color-text-primary)",
        padding: "var(--ns-space-4)",
      }}
    >
      <div className="gallery-doc-example-grid">
        <section
          aria-labelledby="content-progress-card-title"
          className="gallery-doc-example-card"
        >
          <h3 id="content-progress-card-title">Card</h3>
          <p>Use a static card to group one self-contained piece of content.</p>
          <div className="gallery-doc-example-stage">
            <Card
              aria-labelledby="lesson-summary-title"
              as="article"
              style={{ maxWidth: "22rem" }}
            >
              <h4 id="lesson-summary-title">Lesson summary</h4>
              <p>Review hiragana before starting the next lesson.</p>
              <Badge variant="success">Ready</Badge>
            </Card>
          </div>
        </section>

        <section
          aria-labelledby="content-progress-badge-title"
          className="gallery-doc-example-card"
        >
          <h3 id="content-progress-badge-title">Badge</h3>
          <p>
            Use concise semantic labels for non-interactive status or category.
          </p>
          <div className="gallery-doc-example-stage">
            <div
              style={{
                alignItems: "center",
                display: "flex",
                flexWrap: "wrap",
                gap: "var(--ns-space-2)",
                justifyContent: "center",
              }}
            >
              <Badge variant="neutral">Draft</Badge>
              <Badge variant="success">Complete</Badge>
              <Badge variant="warning">Needs review</Badge>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="content-progress-avatar-title"
          className="gallery-doc-example-card"
        >
          <h3 id="content-progress-avatar-title">Avatar</h3>
          <p>
            Name the person with <code>alt</code>; use an empty value when
            nearby text names them.
          </p>
          <div className="gallery-doc-example-stage">
            <div
              style={{
                alignItems: "center",
                display: "flex",
                gap: "var(--ns-space-3)",
              }}
            >
              <Avatar alt="Yuki Tanaka" fallback="YT" size="large" />
              <div>
                <Avatar alt="" fallback="YT" size="small" />
                <span> Yuki Tanaka</span>
              </div>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="content-progress-divider-title"
          className="gallery-doc-example-card"
        >
          <h3 id="content-progress-divider-title">Divider</h3>
          <p>Keep the semantic separator between related content groups.</p>
          <div className="gallery-doc-example-stage">
            <div style={{ maxWidth: "18rem", width: "100%" }}>
              <p>Study plan</p>
              <Divider />
              <p>12 sections · about 20 minutes</p>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="content-progress-bar-title"
          className="gallery-doc-example-card"
        >
          <h3 id="content-progress-bar-title">Progress</h3>
          <p>
            Show a determinate value when the amount of completed work is known.
          </p>
          <div className="gallery-doc-example-stage">
            <div
              style={{
                display: "grid",
                gap: "var(--ns-space-2)",
                width: "100%",
              }}
            >
              <Progress aria-label="Course completion" max={12} value={8} />
              <span>8 of 12 sections complete</span>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="content-progress-ring-title"
          className="gallery-doc-example-card"
        >
          <h3 id="content-progress-ring-title">ProgressRing</h3>
          <p>
            Use a compact determinate indicator with the same accessible value
            contract.
          </p>
          <div className="gallery-doc-example-stage">
            <ProgressRing
              aria-label="Vocabulary set completion"
              max={30}
              value={21}
            >
              70%
            </ProgressRing>
          </div>
        </section>

        <section
          aria-labelledby="content-progress-skeleton-title"
          className="gallery-doc-example-card"
        >
          <h3 id="content-progress-skeleton-title">Skeleton</h3>
          <p>Preserve the expected content shape while a region is loading.</p>
          <div className="gallery-doc-example-stage">
            <section
              aria-busy="true"
              aria-label="Loading lesson preview"
              style={{
                display: "grid",
                gap: "var(--ns-space-3)",
                width: "100%",
              }}
            >
              <p role="status">Loading lesson preview</p>
              <Skeleton shape="rectangular" style={{ blockSize: "5rem" }} />
              <Skeleton shape="text" style={{ inlineSize: "76%" }} />
            </section>
          </div>
        </section>

        <section
          aria-labelledby="content-progress-spinner-title"
          className="gallery-doc-example-card"
        >
          <h3 id="content-progress-spinner-title">Spinner</h3>
          <p>
            Announce a short indeterminate operation with visible status text.
          </p>
          <div className="gallery-doc-example-stage">
            <div
              style={{
                alignItems: "center",
                display: "flex",
                gap: "var(--ns-space-2)",
              }}
            >
              <Spinner aria-label="Saving lesson" />
              <span>Saving lesson…</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
