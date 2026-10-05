export type AppNavIconName =
  | "learn"
  | "kana"
  | "words"
  | "practice"
  | "progress"
  | "quests"
  | "library"
  | "settings";

/** Product navigation artwork. Each icon is decorative beside its text label. */
export function AppNavIcon({ name }: { name: AppNavIconName }) {
  return (
    <svg
      aria-hidden="true"
      className="app-navigation__icon"
      fill="none"
      viewBox="0 0 32 32"
    >
      {name === "learn" && (
        <>
          <path d="M3 13.5 16 3l13 10.5-2.5 3L16 8 5.5 16.5z" fill="#f58a9e" />
          <path
            d="M7 14.5 16 7l9 7.5V27a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z"
            fill="#f2c46f"
          />
          <path d="M13 29v-9h6v9" fill="#925522" />
          <circle cx="16" cy="14" r="2" fill="#bc002d" />
        </>
      )}
      {name === "kana" && (
        <>
          <rect x="3" y="4" width="26" height="24" rx="9" fill="#f58a9e" />
          <path d="m9 27 1 4 6-4" fill="#f58a9e" />
          <text
            fill="#5f0018"
            fontFamily="sans-serif"
            fontSize="18"
            fontWeight="700"
            textAnchor="middle"
            x="16"
            y="22"
          >
            あ
          </text>
        </>
      )}
      {name === "words" && (
        <>
          <rect x="4" y="4" width="24" height="24" rx="4" fill="#f2c46f" />
          <path
            d="M9 10h14M9 16h14M9 22h9"
            stroke="#57330f"
            strokeLinecap="round"
            strokeWidth="2"
          />
          <circle cx="6" cy="10" r="1" fill="#bc002d" />
          <circle cx="6" cy="16" r="1" fill="#bc002d" />
          <circle cx="6" cy="22" r="1" fill="#bc002d" />
        </>
      )}
      {name === "practice" && (
        <>
          <path d="m7 21 14-14 4 4-14 14z" fill="#8cbef2" />
          <path d="M4 18 18 4l4 4L8 22z" fill="#478ad4" />
          <path d="m10 25 15-15 4 4-15 15z" fill="#3472b7" />
          <path d="M3 15 7 11l14 14-4 4z" fill="#8cbef2" />
        </>
      )}
      {name === "progress" && (
        <>
          <path d="M4 5h24v11c0 7-5 11-12 14C9 27 4 23 4 16z" fill="#f2c46f" />
          <path d="M16 5h12v11c0 7-5 11-12 14z" fill="#d58e3f" />
          <path
            d="m11 16 3.5 3.5L22 12"
            stroke="#57330f"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
          />
        </>
      )}
      {name === "quests" && (
        <>
          <path d="M4 11h24v18H4z" fill="#f2c46f" />
          <path d="M4 11V5h6v6h12V5h6v6" fill="#d58e3f" />
          <path d="M7 15h18v11H7z" fill="#925522" />
          <path d="M11 15h10v6H11z" fill="#ffedc7" />
          <path d="M14 19h4v7h-4z" fill="#f2c46f" />
        </>
      )}
      {name === "library" && (
        <>
          <path d="M3 6a3 3 0 0 1 3-3h7v26H6a3 3 0 0 1-3-3z" fill="#e4753e" />
          <path d="M13 3h7v26h-7z" fill="#8cbef2" />
          <path d="M20 3h6a3 3 0 0 1 3 3v20a3 3 0 0 1-3 3h-6z" fill="#7bcf96" />
          <path d="M6 22h20" stroke="#fff" strokeWidth="2" />
        </>
      )}
      {name === "settings" && (
        <>
          <path
            d="m13.4 3-.7 3.2a10 10 0 0 0-2.1.9L7.8 5.5 5.1 8.2l1.6 2.8a10 10 0 0 0-.9 2.1L2.5 13.8v3.8l3.2.7a10 10 0 0 0 .9 2.1L5 23.2l2.7 2.7 2.8-1.6a10 10 0 0 0 2.1.9l.7 3.3h3.8l.7-3.3a10 10 0 0 0 2.1-.9l2.8 1.6 2.7-2.7-1.6-2.8a10 10 0 0 0 .9-2.1l3.2-.7v-3.8l-3.2-.7a10 10 0 0 0-.9-2.1l1.6-2.8-2.7-2.7-2.8 1.6a10 10 0 0 0-2.1-.9L17.2 3z"
            fill="#b8a1ed"
          />
          <circle cx="15.3" cy="15.7" r="4.2" fill="var(--ns-color-surface)" />
        </>
      )}
    </svg>
  );
}
