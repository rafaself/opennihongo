import { Icon, type IconName, type IconSize } from "@opennihongo/ui/icons";
import { GalleryDocumentationPage } from "../../layouts/GalleryDocumentationPage";
import "./AssetsPage.css";

const functionalIcons = [
  { name: "check", purpose: "Confirmed status" },
  { name: "close", purpose: "Dismissal" },
  { name: "star", purpose: "Progression marker" },
] as const satisfies readonly { name: IconName; purpose: string }[];

const iconSizes = [
  {
    size: "small",
    label: "Small",
    dimension: "16px",
    token: "--ns-size-icon-box-small",
  },
  {
    size: "medium",
    label: "Medium",
    dimension: "20px",
    token: "--ns-size-icon-box-medium",
  },
  {
    size: "large",
    label: "Large",
    dimension: "24px",
    token: "--ns-size-icon-box-large",
  },
] as const satisfies readonly {
  size: IconSize;
  label: string;
  dimension: string;
  token: string;
}[];

const mascotStates = [
  { state: "idle", cue: "Neutral presence" },
  { state: "happy", cue: "Low-intensity positive moment" },
  { state: "excited", cue: "High-energy positive milestone" },
  { state: "encouraging", cue: "Support through a challenge or setback" },
  { state: "thinking", cue: "Reflection or consideration" },
  { state: "celebrating", cue: "Confirmed milestone or reward" },
  { state: "warning", cue: "Caution already explained in product text" },
  { state: "disappointed", cue: "Empathy without blaming the learner" },
] as const;

function FunctionalIconCatalog() {
  return (
    <section
      aria-labelledby="gallery-assets-icons-title"
      className="gallery-assets-section"
    >
      <div className="gallery-assets-section-heading">
        <h3 id="gallery-assets-icons-title">Functional icon registry</h3>
        <p>
          These are the approved shared icons. Nearby names and purposes keep
          the previews decorative to assistive technology.
        </p>
      </div>
      <div className="gallery-assets-table-scroll">
        <table className="gallery-assets-icon-table">
          <caption>Canonical icon names and semantic sizes</caption>
          <thead>
            <tr>
              <th scope="col">Canonical name</th>
              {iconSizes.map(({ dimension, label, token }) => (
                <th key={label} scope="col">
                  <span>
                    {label} · {dimension}
                  </span>
                  <code>{token}</code>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {functionalIcons.map(({ name, purpose }) => (
              <tr key={name}>
                <th scope="row">
                  <code>{name}</code>
                  <span>{purpose}</span>
                </th>
                {iconSizes.map(({ size }) => (
                  <td key={size}>
                    <span className="gallery-assets-icon-preview">
                      <Icon name={name} size={size} />
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function IconAccessibilityExamples() {
  return (
    <section
      aria-labelledby="gallery-assets-accessibility-title"
      className="gallery-assets-section"
    >
      <div className="gallery-assets-section-heading">
        <h3 id="gallery-assets-accessibility-title">Accessible use</h3>
        <p>
          Icons are decorative by default. Give a standalone meaningful icon an
          accessible name, and put an icon-only action’s name on its control.
        </p>
      </div>
      <div className="gallery-assets-accessibility-grid">
        <article className="gallery-assets-example-card">
          <span aria-hidden="true" className="gallery-assets-example-icon">
            <Icon name="check" size="large" />
          </span>
          <div>
            <h4>Decorative beside text</h4>
            <p>The visible “Lesson complete” label conveys the status.</p>
          </div>
        </article>
        <article className="gallery-assets-example-card">
          <Icon aria-label="Progression star" name="star" size="large" />
          <div>
            <h4>Meaningful on its own</h4>
            <p>An accessible name exposes this standalone icon as an image.</p>
          </div>
        </article>
        <article className="gallery-assets-example-card">
          <code className="gallery-assets-code-sample">
            {'<IconButton aria-label="Dismiss notification" icon="close" />'}
          </code>
          <div>
            <h4>Icon-only action</h4>
            <p>The button owns the action name; its icon stays decorative.</p>
          </div>
        </article>
      </div>
    </section>
  );
}

function MascotStateCatalog() {
  return (
    <section
      aria-labelledby="gallery-assets-mascot-title"
      className="gallery-assets-section"
    >
      <div className="gallery-assets-section-heading">
        <h3 id="gallery-assets-mascot-title">Mascot state vocabulary</h3>
        <p>
          These language-independent keys describe optional presentation cues;
          they are not learning, validation, reward, or workflow states.
        </p>
      </div>
      <dl className="gallery-assets-state-grid">
        {mascotStates.map(({ cue, state }) => (
          <div className="gallery-assets-state-card" key={state}>
            <dt>
              <code>{state}</code>
            </dt>
            <dd>{cue}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function AssetsPage() {
  return (
    <GalleryDocumentationPage
      examples={
        <div className="gallery-assets-examples">
          <FunctionalIconCatalog />
          <IconAccessibilityExamples />
          <aside
            aria-label="Artwork availability"
            className="gallery-assets-availability"
          >
            <strong>
              No approved illustration or mascot artwork is published yet.
            </strong>
            <span>
              This catalog documents the shared conventions and state contract;
              it does not imply that artwork or a mascot component is available.
            </span>
          </aside>
          <MascotStateCatalog />
        </div>
      }
      eyebrow="Assets / Iconography and illustration"
      guidance={[
        {
          title: "Choose an icon or an illustration by purpose",
          content: (
            <p>
              Use a functional icon for a concise action, status, or control
              affordance. Use an illustration for a scene or narrative context,
              such as onboarding, empty states, achievements, or rewards. Art
              must not replace a control name or explanatory text.
            </p>
          ),
        },
        {
          title: "Keep shared artwork reviewed and traceable",
          content: (
            <p>
              Design System maintainers own shared art direction and approve
              catalog assets. Feature owners may request or contribute art;
              approved first-party source belongs under
              <code>packages/ui/src/illustrations/</code>. Record source and
              license details, and add it only when an approved owner, purpose,
              and real consumer exist.
            </p>
          ),
        },
        {
          title: "Keep mascot cues optional and truthful",
          content: (
            <p>
              A future consumer requests a language-independent state such as
              <code>celebrating</code>; the shared asset layer maps it to
              artwork. Product text and status semantics stay with the feature.
              A mascot may be omitted at any size without hiding content or
              blocking an interaction.
            </p>
          ),
        },
      ]}
      id="assets-catalog"
      notes={[
        {
          title: "Public icon APIs and sizing",
          content: (
            <>
              <p>
                Import the name-based <code>Icon</code> and
                <code>IconName</code> from <code>@opennihongo/ui/icons</code>.
                The same entry exports the fixed-purpose
                <code>CheckIcon</code>, <code>CloseIcon</code>, and
                <code>StarIcon</code> components. Use a named component when the
                icon is fixed in the composition:
              </p>
              <pre className="gallery-code-example">
                <code>{`import { CheckIcon, CloseIcon, StarIcon } from "@opennihongo/ui/icons";

<CheckIcon aria-label="Completed" size="small" />
<CloseIcon aria-label="Dismiss" />
<StarIcon aria-label="Progression" size="large" />`}</code>
              </pre>
              <p>
                The <code>small</code>, <code>medium</code>, and
                <code>large</code> sizes use 16px, 20px, and 24px semantic
                icon-box tokens. Icons use a 24 × 24 viewBox, inherit
                <code>currentColor</code>, and do not shrink inline.
              </p>
            </>
          ),
        },
        {
          title: "Mascot fallback and status ownership",
          content: (
            <p>
              When approved mascot artwork exists, use the approved
              <code>idle</code> asset if a requested state has no matching art.
              If idle artwork is unavailable or fails to load, omit the mascot
              instead of showing a broken image. A cue such as
              <code>warning</code> is not an alert; visible messages, live
              regions, and localized status text remain the feature’s
              responsibility.
            </p>
          ),
        },
      ]}
      summary="Discover the shared functional icon registry and review the ownership, accessibility, and optional mascot conventions for visual assets."
      title="Icons and illustrations"
    />
  );
}
