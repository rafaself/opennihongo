import { useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import "./avatar.css";

export type AvatarSize = "small" | "medium" | "large";

export type AvatarProps = Omit<
  HTMLAttributes<HTMLSpanElement>,
  "aria-hidden" | "aria-label" | "aria-labelledby" | "children" | "role"
> & {
  /** Accessible identity, or an empty string when nearby text names the person. */
  alt: string;
  /** Optional visible initials or other static fallback content. */
  fallback?: ReactNode;
  /** Shared semantic avatar dimension. */
  size?: AvatarSize;
  /** Image URL. When absent or if loading fails, the fallback is shown. */
  src?: string;
};

type AvatarFallbackProps = {
  content?: ReactNode;
};

function AvatarFallback({ content }: AvatarFallbackProps) {
  return (
    <span aria-hidden="true" className="ns-avatar__fallback">
      {content ?? (
        <svg fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="8" r="4" />
          <path d="M4.5 21a7.5 7.5 0 0 1 15 0z" />
        </svg>
      )}
    </span>
  );
}

type AvatarImageProps = {
  fallback?: ReactNode;
  src: string;
};

function AvatarImage({ fallback, src }: AvatarImageProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "failed">(
    "loading",
  );

  return (
    <>
      {status !== "loaded" && <AvatarFallback content={fallback} />}
      {status !== "failed" && (
        <img
          alt=""
          aria-hidden="true"
          className="ns-avatar__image"
          data-loaded={status === "loaded" || undefined}
          decoding="async"
          onError={() => {
            setStatus("failed");
          }}
          onLoad={() => {
            setStatus("loaded");
          }}
          src={src}
        />
      )}
    </>
  );
}

/** Displays a person image or fallback with explicit identity semantics. */
export function Avatar({
  alt,
  className,
  fallback,
  size = "medium",
  src,
  ...props
}: AvatarProps) {
  const accessibleName = alt.trim();
  const hasSource = Boolean(src?.trim());
  const classes = ["ns-avatar", className].filter(Boolean).join(" ");

  return (
    <span
      {...props}
      aria-hidden={accessibleName ? undefined : true}
      aria-label={accessibleName || undefined}
      className={classes}
      data-size={size}
      role={accessibleName ? "img" : undefined}
    >
      {hasSource && src ? (
        <AvatarImage fallback={fallback} key={src} src={src} />
      ) : (
        <AvatarFallback content={fallback} />
      )}
    </span>
  );
}
