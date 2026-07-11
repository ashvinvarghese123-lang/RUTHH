export function StickyNote({ className = "", size = 56 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" className={className} aria-hidden="true">
      <path d="M8 8H48V38L38 48H8V8Z" fill="#DCCDB8" />
      <path d="M38 38H48L38 48V38Z" fill="#C9B79E" />
      <line x1="16" y1="20" x2="40" y2="20" stroke="#1B1B1B" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.6" />
      <line x1="16" y1="28" x2="34" y2="28" stroke="#1B1B1B" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.6" />
    </svg>
  );
}
