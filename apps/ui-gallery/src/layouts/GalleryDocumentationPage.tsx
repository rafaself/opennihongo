import type { ReactNode } from "react";
import "./GalleryDocumentationPage.css";

export interface GalleryDocumentationSection {
  readonly title: string;
  readonly content: ReactNode;
}

export interface GalleryDocumentationPractices {
  readonly doItems: readonly ReactNode[];
  readonly dontItems: readonly ReactNode[];
}

export interface GalleryDocumentationPageProps {
  /** Unique page prefix used to associate sections with their headings. */
  readonly id: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly summary: string;
  readonly examples?: ReactNode;
  readonly examplesTitle?: string;
  readonly guidance?: readonly GalleryDocumentationSection[];
  readonly notes?: readonly GalleryDocumentationSection[];
  readonly practices?: GalleryDocumentationPractices;
}

/** Composes a catalog page from caller-owned examples and reference content. */
export function GalleryDocumentationPage({
  id,
  eyebrow,
  title,
  summary,
  examples,
  examplesTitle = "Examples",
  guidance = [],
  notes = [],
  practices,
}: GalleryDocumentationPageProps) {
  return (
    <article aria-labelledby={id + "-title"} className="gallery-doc-page">
      <header className="gallery-doc-heading">
        <p className="gallery-eyebrow">{eyebrow}</p>
        <h1 id={id + "-title"}>{title}</h1>
        <p className="gallery-doc-summary">{summary}</p>
        <nav aria-label="Page sections" className="gallery-doc-contents">
          {examples !== undefined && (
            <a href={`#${id}-examples-title`}>{examplesTitle}</a>
          )}
          {guidance.length > 0 && (
            <a href={`#${id}-guidance-title`}>Guidance</a>
          )}
          {notes.length > 0 && (
            <a href={`#${id}-notes-title`}>Tokens and API</a>
          )}
          {practices !== undefined && (
            <a href={`#${id}-practices-title`}>Do and don’t</a>
          )}
        </nav>
      </header>

      {examples !== undefined && (
        <section
          aria-labelledby={id + "-examples-title"}
          className="gallery-doc-section"
        >
          <div className="gallery-doc-section-heading">
            <h2 id={id + "-examples-title"}>{examplesTitle}</h2>
          </div>
          <div className="gallery-doc-examples">{examples}</div>
        </section>
      )}

      {guidance.length > 0 && (
        <section
          aria-labelledby={id + "-guidance-title"}
          className="gallery-doc-section"
        >
          <div className="gallery-doc-section-heading">
            <h2 id={id + "-guidance-title"}>Guidance</h2>
          </div>
          <div className="gallery-doc-guidance-grid">
            {guidance.map(({ title: sectionTitle, content }, index) => (
              <section
                aria-labelledby={id + "-guidance-" + index.toString()}
                className="gallery-doc-guidance-card"
                key={index.toString() + "-" + sectionTitle}
              >
                <h3 id={id + "-guidance-" + index.toString()}>
                  {sectionTitle}
                </h3>
                {content}
              </section>
            ))}
          </div>
        </section>
      )}

      {notes.length > 0 && (
        <section
          aria-labelledby={id + "-notes-title"}
          className="gallery-doc-section"
        >
          <div className="gallery-doc-section-heading">
            <h2 id={id + "-notes-title"}>Tokens and API</h2>
          </div>
          <div className="gallery-doc-notes-grid">
            {notes.map(({ title: sectionTitle, content }, index) => (
              <section
                aria-labelledby={id + "-note-" + index.toString()}
                className="gallery-doc-note"
                key={index.toString() + "-" + sectionTitle}
              >
                <h3 id={id + "-note-" + index.toString()}>{sectionTitle}</h3>
                {content}
              </section>
            ))}
          </div>
        </section>
      )}

      {practices !== undefined && (
        <section
          aria-labelledby={id + "-practices-title"}
          className="gallery-doc-section"
        >
          <div className="gallery-doc-section-heading">
            <h2 id={id + "-practices-title"}>Do and don’t</h2>
          </div>
          <div className="gallery-doc-practices-grid">
            <section aria-labelledby={id + "-do-title"}>
              <h3 id={id + "-do-title"}>Do</h3>
              <ul>
                {practices.doItems.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>
            <section aria-labelledby={id + "-dont-title"}>
              <h3 id={id + "-dont-title"}>Don’t</h3>
              <ul>
                {practices.dontItems.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>
          </div>
        </section>
      )}
    </article>
  );
}
