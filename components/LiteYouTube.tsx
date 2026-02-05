import React from 'react';
interface LiteYouTubeProps {
  videoId: string;
  title: string;
  className?: string;
  autoPlay?: boolean;
  posterQuality?: 'default' | 'mqdefault' | 'hqdefault' | 'sddefault' | 'maxresdefault';
  posterFormat?: 'jpg' | 'webp';
  priority?: boolean;
}

const POSTER_WIDTHS: Record<NonNullable<LiteYouTubeProps['posterQuality']>, number> = {
  default: 120,
  mqdefault: 320,
  hqdefault: 480,
  sddefault: 640,
  maxresdefault: 1280
};

const POSTER_QUALITIES: Array<NonNullable<LiteYouTubeProps['posterQuality']>> = [
  'default',
  'mqdefault',
  'hqdefault',
  'sddefault',
  'maxresdefault'
];

/**
 * Lightweight YouTube embed that defers loading the heavy iframe
 * until the user interacts (or until autoPlay is explicitly enabled).
 */
export const LiteYouTube: React.FC<LiteYouTubeProps> = ({
  videoId,
  title,
  className = '',
  autoPlay = false,
  posterQuality = 'mqdefault',
  posterFormat = 'webp',
  priority = false
}) => {
  const [isActive, setIsActive] = React.useState(autoPlay);
  const [useFallbackPoster, setUseFallbackPoster] = React.useState(false);

  const buildPosterUrl = React.useCallback(
    (quality: NonNullable<LiteYouTubeProps['posterQuality']>) => {
      const format = useFallbackPoster ? 'jpg' : posterFormat;
      const folder = format === 'webp' ? 'vi_webp' : 'vi';
      const extension = format === 'webp' ? 'webp' : 'jpg';
      return `https://i.ytimg.com/${folder}/${videoId}/${quality}.${extension}`;
    },
    [posterFormat, useFallbackPoster, videoId]
  );

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

  const posterUrl = React.useMemo(
    () => buildPosterUrl(posterQuality),
    [buildPosterUrl, posterQuality]
  );

  const posterSrcSet = React.useMemo(
    () =>
      POSTER_QUALITIES
        .map((quality) => `${buildPosterUrl(quality)} ${POSTER_WIDTHS[quality]}w`)
        .join(', '),
    [buildPosterUrl]
  );

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
            srcSet={posterSrcSet}
            alt={`${title} preview frame`}
            loading="lazy"
            decoding="async"
            width={960}
            height={540}
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 80vw, 960px"
            fetchPriority={priority ? 'high' : 'auto'}
            onError={() => setUseFallbackPoster(true)}
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
