import type { RiskLevel } from "@/analytics/portfolio-stats";

interface RiskBadgeProps {
  level: RiskLevel | "DELAYED" | "ON_TRACK";
  customLabel?: string;
  size?: "sm" | "md";
}

export function RiskBadge({ level, customLabel, size = "md" }: RiskBadgeProps) {
  let text = customLabel;
  let bg = "var(--risk-low-bg)";
  let color = "var(--risk-low-text)";
  let border = "var(--risk-low-border)";
  let dot = "var(--risk-low-dot)";

  if (level === "HIGH" || level === "DELAYED") {
    text = customLabel ?? (level === "DELAYED" ? "Delayed" : "High Risk");
    bg = "var(--risk-high-bg)";
    color = "var(--risk-high-text)";
    border = "var(--risk-high-border)";
    dot = "var(--risk-high-dot)";
  } else if (level === "MEDIUM") {
    text = customLabel ?? "At Risk";
    bg = "var(--risk-med-bg)";
    color = "var(--risk-med-text)";
    border = "var(--risk-med-border)";
    dot = "var(--risk-med-dot)";
  } else {
    text = customLabel ?? (level === "ON_TRACK" ? "On Track" : "Low Risk");
  }

  const isSmall = size === "sm";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: isSmall ? "2px 8px" : "4px 10px",
        borderRadius: "var(--radius-pill)",
        backgroundColor: bg,
        color: color,
        border: `1px solid ${border}`,
        fontSize: isSmall ? "0.68rem" : "0.75rem",
        fontWeight: 600,
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: isSmall ? "5px" : "6px",
          height: isSmall ? "5px" : "6px",
          borderRadius: "50%",
          backgroundColor: dot,
        }}
      />
      {text}
    </span>
  );
}
