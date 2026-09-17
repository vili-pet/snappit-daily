import { useEffect, useState } from "react";
import { useObjectUrl } from "../hooks/useObjectUrl";
import type { Clip } from "../lib/types";

export function SequencePlayer({ clips, title }: { clips: Clip[]; title: string }) {
  const [index, setIndex] = useState(0);
  const current = clips[index];
  const url = useObjectUrl(current?.blob);

  useEffect(() => {
    setIndex(0);
  }, [clips]);

  if (!current) {
    return <p className="muted">Ei klippejä toistettavaksi.</p>;
  }

  return (
    <div className="sequence-player">
      <p className="sequence-title">{title}</p>
      {url && current.blob.size > 0 ? (
        <video
          key={current.id}
          src={url}
          controls
          autoPlay
          playsInline
          onEnded={() => setIndex((value) => (value + 1) % clips.length)}
        />
      ) : (
        <div
          className="clip-placeholder tall"
          style={{ background: `hsl(${current.placeholderHue ?? 24} 40% 32%)` }}
        >
          {current.placeLabel ?? "Esikatselu"}
        </div>
      )}
      <p className="muted">
        {index + 1} / {clips.length} · peräkkäinen esikatselu
      </p>
    </div>
  );
}
