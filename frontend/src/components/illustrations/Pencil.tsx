export function Pencil({ className = "", size = 56 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none" className={className} aria-hidden="true">
      <path d="M8 48L12 36L36 12L44 20L20 44L8 48Z" fill="#1B1B1B" />
      <path d="M36 12L44 20L48 16C50 14 50 11 48 9C46 7 43 7 41 9L36 12Z" fill="#DCCDB8" />
      <path d="M12 36L20 44L8 48L12 36Z" fill="#1B1B1B" fillOpacity="0.7" />
    </svg>
  );
}
