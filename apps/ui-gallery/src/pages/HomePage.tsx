import { Button } from "@opennihongo/ui";

const colorTokens = [
  { name: "Canvas", token: "--ns-color-canvas", value: "#fafaf9" },
  { name: "Surface", token: "--ns-color-surface", value: "#ffffff" },
  { name: "Ink", token: "--ns-color-ink", value: "#181817" },
  { name: "Muted", token: "--ns-color-muted", value: "#3c3c39" },
  { name: "Border", token: "--ns-color-border", value: "#c9c9c5" },
  { name: "Brand", token: "--ns-color-brand", value: "#bc002d" },
  { name: "Brand hover", token: "--ns-color-brand-hover", value: "#990026" },
  {
    name: "Brand foreground",
    token: "--ns-color-brand-foreground",
    value: "#ffffff",
  },
  { name: "Focus", token: "--ns-color-focus", value: "#bb702b" },
];

export function HomePage() {
  return (
    <>
      <section aria-labelledby="gallery-title" className="gallery-intro">
        <p className="gallery-eyebrow">UI Gallery / 01</p>
        <h1 id="gallery-title">A considered foundation for learning.</h1>
        <p className="gallery-intro-copy">
          A living catalog of the shared interface components and visual
          foundations used across OpenNihongo.
        </p>
        <a className="gallery-text-link" href="#components">
          Explore the components <span aria-hidden="true">↓</span>
        </a>
        <div aria-hidden="true" className="gallery-intro-stamp">
          <span>学</span>
          <span>ぶ</span>
          <span>毎</span>
          <span>日</span>
        </div>
      </section>

      <section
        aria-labelledby="components-title"
        className="gallery-section"
        id="components"
      >
        <div className="gallery-section-heading">
          <div>
            <p className="gallery-eyebrow">01 / Interface</p>
            <h2 id="components-title">Buttons</h2>
            <p>
              Clear actions with comfortable targets and a visible keyboard
              focus state.
            </p>
          </div>
          <code className="gallery-package-path">@opennihongo/ui</code>
        </div>

        <div className="gallery-component-grid">
          <article className="gallery-demo-card">
            <div className="gallery-demo-heading">
              <h3>Primary</h3>
              <p>For the main action in a view.</p>
            </div>
            <div className="gallery-demo-stage">
              <Button>Continue lesson</Button>
            </div>
          </article>
          <article className="gallery-demo-card">
            <div className="gallery-demo-heading">
              <h3>Secondary</h3>
              <p>For supporting or alternative actions.</p>
            </div>
            <div className="gallery-demo-stage">
              <Button variant="secondary">View details</Button>
            </div>
          </article>
          <article className="gallery-demo-card">
            <div className="gallery-demo-heading">
              <h3>Disabled</h3>
              <p>When an action is not currently available.</p>
            </div>
            <div className="gallery-demo-stage">
              <Button disabled>Complete previous step</Button>
            </div>
          </article>
        </div>

        <pre className="gallery-code-example">
          <code>{`import { Button } from "@opennihongo/ui";

<Button>Continue lesson</Button>
<Button variant="secondary">View details</Button>`}</code>
        </pre>
      </section>

      <section
        aria-labelledby="foundations-title"
        className="gallery-section gallery-foundations"
        id="foundations"
      >
        <div className="gallery-section-heading">
          <div>
            <p className="gallery-eyebrow">02 / Foundations</p>
            <h2 id="foundations-title">Color tokens</h2>
            <p>
              Semantic colors keep the interface calm, readable, and consistent.
            </p>
          </div>
          <code className="gallery-package-path">
            @opennihongo/ui/styles.css
          </code>
        </div>

        <ul className="gallery-token-grid" aria-label="Design system colors">
          {colorTokens.map(({ name, token, value }) => (
            <li className="gallery-token" key={token}>
              <span
                aria-hidden="true"
                className="gallery-token-swatch"
                style={{ backgroundColor: `var(${token})` }}
              />
              <span className="gallery-token-details">
                <strong>{name}</strong>
                <code>{token}</code>
                <code>{value}</code>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
