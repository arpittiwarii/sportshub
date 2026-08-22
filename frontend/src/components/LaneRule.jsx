// Signature element: running-track "lane lines" as a divider/accent.
// Horizontal gold hairlines evoking track lanes.
export default function LaneRule({ className = '', lanes = 4 }) {
  return (
    <div
      className={`flex flex-col gap-[3px] ${className}`}
      aria-hidden="true"
    >
      {Array.from({ length: lanes }).map((_, i) => (
        <span
          key={i}
          className="block h-px w-full bg-primary"
          style={{ opacity: 0.15 + (i / Math.max(1, lanes - 1)) * 0.45 }}
        />
      ))}
    </div>
  );
}
