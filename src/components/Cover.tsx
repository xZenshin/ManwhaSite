import { useState } from 'react';

interface Props {
  title: string;
  url: string | null;
}

/** Stable hue per title so placeholder covers are distinguishable. */
function hueFor(title: string): number {
  let hash = 0;
  for (const ch of title) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return Math.abs(hash) % 360;
}

function initials(title: string): string {
  const words = title.split(/\s+/).filter((w) => /^[\p{L}\p{N}]/u.test(w));
  return words.slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?';
}

export function Cover({ title, url }: Props) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  if (url && url !== failedUrl) {
    return (
      <img
        className="cover"
        src={url}
        alt=""
        loading="lazy"
        // Many manhwa sites block hotlinking when a referrer is sent
        referrerPolicy="no-referrer"
        onError={() => setFailedUrl(url)}
      />
    );
  }

  return (
    <div className="cover cover-placeholder" style={{ '--hue': hueFor(title) } as React.CSSProperties} aria-hidden>
      {initials(title)}
    </div>
  );
}
