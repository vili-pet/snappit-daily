type IconName = "capture" | "memories" | "montages" | "settings" | "close";

const PATHS: Record<IconName, string> = {
  capture:
    "M8 7.5 9.2 5.8A1.5 1.5 0 0 1 10.4 5h3.2a1.5 1.5 0 0 1 1.2.8L16 7.5h2.2A1.8 1.8 0 0 1 20 9.3v8A1.8 1.8 0 0 1 18.2 19H5.8A1.8 1.8 0 0 1 4 17.3v-8A1.8 1.8 0 0 1 5.8 7.5H8Zm4 8.2a2.7 2.7 0 1 0 0-5.4 2.7 2.7 0 0 0 0 5.4Z",
  memories:
    "M6 5.5h12A1.5 1.5 0 0 1 19.5 7v12L12 15.5 4.5 19V7A1.5 1.5 0 0 1 6 5.5Z",
  montages:
    "M5 6.5h9.5v11H5v-11Zm11 2.5h3v8.5h-3V9Z",
  settings:
    "M12 8.4a3.6 3.6 0 1 1 0 7.2 3.6 3.6 0 0 1 0-7.2Zm0-4.9.8 2.1 2.1-.7 1.6 1.6-.7 2.1 2.1.8v2.2l-2.1.8.7 2.1-1.6 1.6-2.1-.7L12 20.5l-.8-2.1-2.1.7-1.6-1.6.7-2.1-2.1-.8V12l2.1-.8-.7-2.1 1.6-1.6 2.1.7Z",
  close: "M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5",
};

export function Icon({ name, label }: { name: IconName; label?: string }) {
  const stroke = name === "close";
  return (
    <svg viewBox="0 0 24 24" aria-hidden={label ? undefined : true} aria-label={label} className="icon">
      <path
        d={PATHS[name]}
        fill={stroke ? "none" : "currentColor"}
        stroke={stroke ? "currentColor" : "none"}
        strokeWidth={stroke ? 1.8 : undefined}
        strokeLinecap="round"
      />
    </svg>
  );
}
