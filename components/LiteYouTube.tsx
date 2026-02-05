import React from 'react';
interface LiteYouTubeProps {
  videoId: string;
  title: string;
  className?: string;
  autoPlay?: boolean;
  posterQuality?: 'default' | 'mqdefault' | 'hqdefault' | 'sddefault' | 'maxresdefault';
}

/**
 * Lightweight YouTube embed that defers loading the heavy iframe
 * until the user interacts (or until autoPlay is explicitly enabled).
 */
export const LiteYouTube: React.FC<LiteYouTubeProps> = ({
  videoId,
  title,
  className = '',
  autoPlay = false,
  posterQuality = 'hqdefault'
}) => {
  const [isActive, setIsActive] = React.useState(autoPlay);

  const videoSrc = React.useMemo(() => {
    const base = `https://www.youtube.com/embed/${videoId}`;
    if (!isActive) {
      return base;
    }
    const params = new URLSearchParams({
      autoplay: '1',
      rel: '0',
      modestbranding: '1',
      playsinline: '1'
    });
    return `${base}?${params.toString()}`;
  }, [isActive, videoId]);

  const posterUrl = `https://i.ytimg.com/vi/${videoId}/${posterQuality}.jpg`;

  return (
    <div className={`lite-youtube relative w-full h-full overflow-hidden ${className}`}>
      {!isActive && (
        <button
          type="button"
          className="lite-youtube__poster"
          onClick={() => setIsActive(true)}
          aria-label={`Play ${title}`}
        >
          <img
            src={posterUrl}
            alt={`${title} preview frame`}
            loading="lazy"
            decoding="async"
            width={1280}
            height={720}
          />
          <span className="lite-youtube__scrim" aria-hidden="true" />
          <span className="lite-youtube__play" aria-hidden="true">
            <span className="lite-youtube__play-btn">
              <span className="lite-youtube__play-icon" />
            </span>
          </span>
        </button>
      )}
      {isActive && (
        <iframe
          src={videoSrc}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 h-full w-full border-0"
        />
      )}
    </div>
  );
};
