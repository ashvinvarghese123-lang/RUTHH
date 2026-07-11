export function FoldedPaper({ className = "", size = 56 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" className={className} aria-hidden="true">
      <path d="M10 6H36L46 16V50H10V6Z" fill="#F9F7F3" stroke="#1B1B1B" strokeWidth="2.5" />
      <path d="M36 6L46 16H36V6Z" fill="#DCCDB8" stroke="#1B1B1B" strokeWidth="2.5" strokeLinejoin="round" />
      <line x1="17" y1="26" x2="39" y2="26" stroke="#1B1B1B" strokeWidth="2" strokeLinecap="round" />
      <line x1="17" y1="34" x2="39" y2="34" stroke="#1B1B1B" strokeWidth="2" strokeLinecap="round" />
      <line x1="17" y1="42" x2="30" y2="42" stroke="#1B1B1B" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
