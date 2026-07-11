export function Bookmark({ className = "", size = 48 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 64" fill="none" className={className} aria-hidden="true">
      <path d="M10 4H38V60L24 48L10 60V4Z" fill="#1B1B1B" />
    </svg>
  );
}
