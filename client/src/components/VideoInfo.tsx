interface VideoInfoProps {
  title: string;
  thumbnail: string;
  videoUrl: string;
  transcriptLength: number;
}

export function VideoInfo({ title, thumbnail, videoUrl, transcriptLength }: VideoInfoProps) {
  const wordCount = transcriptLength
    ? Math.round(transcriptLength / 5) // rough word estimate from char count
    : 0;

  return (
    <div className="video-info">
      <div className="video-info__card">
        <a href={videoUrl} target="_blank" rel="noopener noreferrer">
          <img
            className="video-info__thumbnail"
            src={thumbnail}
            alt={title}
            loading="lazy"
          />
        </a>
        <div className="video-info__details">
          <h3 className="video-info__title">{title}</h3>
          <div className="video-info__meta">
            <span className="video-info__badge">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              {wordCount.toLocaleString()} words
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
