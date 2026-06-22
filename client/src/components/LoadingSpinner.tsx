interface LoadingSpinnerProps {
  text?: string;
  size?: 'small' | 'medium';
}

export function LoadingSpinner({ text, size = 'medium' }: LoadingSpinnerProps) {
  return (
    <div className={`spinner ${size === 'small' ? 'spinner--inline' : ''}`}>
      <div className="spinner__circle spinner__circle--gradient" />
      {text && <span className="spinner__text">{text}</span>}
    </div>
  );
}
