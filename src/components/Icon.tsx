type IconName = "capture" | "memories" | "montages" | "settings" | "close";

const PATHS: Record<IconName, string> = {
  capture: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-6 2.2 2H18a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3.8L12 2Z",
  memories: "M4 5h16v14H4V5Zm2 2v10h12V7H6Zm2 2h8v2H8V9Z",
  montages: "M4 6h10v12H4V6Zm12 2h4v10h-4V8ZM7 9h4v2H7V9Z",
  settings:
    "M10.1 2.5h3.8l.5 2.2a6.8 6.8 0 0 1 1.8 1l2.1-.8 1.9 3.3-1.6 1.5c.1.5.2 1 .2 1.5s-.1 1-.2 1.5l1.6 1.5-1.9 3.3-2.1-.8a6.8 6.8 0 0 1-1.8 1l-.5 2.2h-3.8l-.5-2.2a6.8 6.8 0 0 1-1.8-1l-2.1.8-1.9-3.3 1.6-1.5a7 7 0 0 1-.2-1.5c0-.5.1-1 .2-1.5L3.8 8.2 5.7 4.9l2.1.8a6.8 6.8 0 0 1 1.8-1l.5-2.2ZM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z",
  close: "M6 6l12 12M18 6 6 18",
};

export function Icon({ name, label }: { name: IconName; label?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden={label ? undefined : true} aria-label={label} className="icon">
      <path
        d={PATHS[name]}
        fill={name === "close" ? "none" : "currentColor"}
        stroke={name === "close" ? "currentColor" : "none"}
        strokeWidth={name === "close" ? 1.8 : undefined}
        strokeLinecap="round"
      />
    </svg>
  );
}
