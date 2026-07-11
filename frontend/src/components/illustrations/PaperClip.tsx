export function PaperClip({ className = "", size = 48 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 64" fill="none" className={className} aria-hidden="true">
      <path
        d="M14 18V44a10 10 0 0020 0V14a6 6 0 00-12 0v26a2 2 0 004 0V18"
        stroke="#1B1B1B"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
