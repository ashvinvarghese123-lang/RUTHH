export function PaperAirplane({ className = "", size = 64 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <path d="M4 34L58 8L38 58L30 40L4 34Z" fill="#1B1B1B" />
      <path d="M30 40L44 24L38 58L30 40Z" fill="#1B1B1B" fillOpacity="0.6" />
    </svg>
  );
}
