import { useState } from "react";
import { Button, IconButton } from "@opennihongo/ui";

export function ActionsExamples() {
  const [announcement, setAnnouncement] = useState("");

  return (
    <>
      <article className="gallery-doc-example-card">
        <h3>Button priority and availability</h3>
        <p>
          Use a primary action for the next step, a secondary action for an
          alternative, and disabled when the action is unavailable.
        </p>
        <div className="gallery-doc-example-stage">
          <div>
            <Button
              onClick={() => {
                setAnnouncement("Continue lesson selected.");
              }}
            >
              Continue lesson
            </Button>
            <Button variant="secondary">Review vocabulary</Button>
            <Button disabled>Complete previous step</Button>
          </div>
        </div>
        {announcement && (
          <p aria-label="Action feedback" role="status">
            {announcement}
          </p>
        )}
      </article>

      <article className="gallery-doc-example-card">
        <h3>Icon-only action</h3>
        <p>The required accessible name describes the action without text.</p>
        <div className="gallery-doc-example-stage">
          <IconButton
            aria-label="Bookmark lesson"
            icon="star"
            onClick={() => {
              setAnnouncement("Lesson bookmarked.");
            }}
          />
        </div>
      </article>
    </>
  );
}
