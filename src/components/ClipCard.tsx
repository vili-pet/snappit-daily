import { useRef, useState } from "react";
import { useObjectUrl } from "../hooks/useObjectUrl";
import { formatTime } from "../lib/dates";
import type { Clip } from "../lib/types";

export function ClipCard({
  clip,
  onDelete,
}: {
  clip: Clip;
  onDelete?: (id: string) => void;
}) {
  const url = useObjectUrl(clip.blob);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  return (
    <article className={clip.isDemo ? "clip-card is-demo" : "clip-card"}>
      <div className="clip-media">
        {url && clip.blob.size > 0 ? (
          <video
            ref={videoRef}
            src={url}
            playsInline
            preload="metadata"
            onEnded={() => setPlaying(false)}
          />
        ) : (
          <div
            className="clip-placeholder"
            style={{ background: `hsl(${clip.placeholderHue ?? 24} 40% 32%)` }}
          >
            <span>Esikatselu</span>
          </div>
        )}
        <button
          type="button"
          className="play-btn"
          onClick={() => {
            const video = videoRef.current;
            if (!video) return;
            if (video.paused) {
              void video.play();
              setPlaying(true);
            } else {
              video.pause();
              setPlaying(false);
            }
          }}
        >
          {playing ? "Tauko" : "Toista"}
        </button>
      </div>
      <div className="clip-meta">
        <p className="clip-time">{formatTime(clip.createdAt)}</p>
        <p className="clip-place">{clip.placeLabel ?? "Ilman paikkaa"}</p>
        {clip.isDemo ? <p className="demo-pill">Demodata</p> : null}
        <p className="clip-source">
          {clip.source === "camera" ? "Kamera" : clip.source === "import" ? "Tuotu" : "Demo"}
        </p>
      </div>
      {onDelete ? (
        <button type="button" className="text-btn" onClick={() => onDelete(clip.id)}>
          Poista
        </button>
      ) : null}
    </article>
  );
}
