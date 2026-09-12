export function FootballIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M12 8.2 14.4 10l-.9 2.8h-3L9.6 10 12 8.2Z"
        fill="currentColor"
      />
      <path
        d="m12 8.2 2.2-3.4M14.4 10l4.1-.4M13.5 12.8l1.8 3.8M10.5 12.8l-1.8 3.8M9.6 10l-4.1-.4M12 8.2 9.8 4.8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
