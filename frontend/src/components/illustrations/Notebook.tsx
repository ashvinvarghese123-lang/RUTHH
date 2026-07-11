export function Notebook({ className = "", size = 72 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" fill="none" className={className} aria-hidden="true">
      <rect x="14" y="8" width="44" height="56" rx="4" fill="#1B1B1B" />
      <rect x="18" y="14" width="36" height="44" rx="2" fill="#F9F7F3" />
      <line x1="24" y1="24" x2="48" y2="24" stroke="#1B1B1B" strokeWidth="2" strokeLinecap="round" />
      <line x1="24" y1="32" x2="48" y2="32" stroke="#1B1B1B" strokeWidth="2" strokeLinecap="round" />
      <line x1="24" y1="40" x2="40" y2="40" stroke="#1B1B1B" strokeWidth="2" strokeLinecap="round" />
      <circle cx="10" cy="18" r="2" fill="#1B1B1B" />
      <circle cx="10" cy="36" r="2" fill="#1B1B1B" />
      <circle cx="10" cy="54" r="2" fill="#1B1B1B" />
    </svg>
  );
}
