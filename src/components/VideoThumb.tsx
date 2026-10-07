import { useObjectUrl } from "../hooks/useObjectUrl";
import type { Clip } from "../lib/types";

/**
 * Compact video preview: renders the first frame of the clip blob when one
 * exists, otherwise an honest colored placeholder.
 */
export function VideoThumb({ clip, className }: { clip?: Clip; className?: string }) {
  const url = useObjectUrl(clip?.blob);
  if (clip && url && clip.blob.size > 0) {
    return <video className={className} src={url} muted playsInline preload="metadata" />;
  }
  return (
    <div
      className={className ? `thumb-fallback ${className}` : "thumb-fallback"}
      style={clip ? { background: `hsl(${clip.placeholderHue ?? 205} 42% 44%)` } : undefined}
      aria-hidden
    />
  );
}
