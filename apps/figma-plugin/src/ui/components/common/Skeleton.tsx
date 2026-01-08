import { h } from "preact";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  style?: h.JSX.CSSProperties;
  className?: string;
  borderRadius?: string;
}

export function Skeleton({
  width = "100%",
  height = "20px",
  style,
  className = "",
  borderRadius,
}: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
}

export function CollectionSkeleton() {
  return (
    <div
      style={{
        padding: "var(--space-3)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-md)",
        backgroundColor: "var(--surface-primary)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ flex: 1 }}>
          <Skeleton
            width="40%"
            height="16px"
            style={{ marginBottom: "var(--space-2)" }}
          />
          <Skeleton width="30%" height="12px" />
        </div>
        <Skeleton width="60px" height="24px" />
      </div>
    </div>
  );
}
