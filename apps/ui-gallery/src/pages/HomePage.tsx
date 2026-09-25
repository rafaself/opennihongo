import { Button } from "@opennihongo/ui";

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
    </>
  );
}
