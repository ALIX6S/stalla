import type { ReactNode } from "react";

interface PanelProps {
  title: string;
  description?: string;
  pill?: string;
  variant?: "form" | "table";
  className?: string;
  children: ReactNode;
}

export function Panel({ title, description, pill, variant = "table", className = "", children }: PanelProps) {
  return (
    <article className={`panel-card ${variant}-panel ${className}`.trim()}>
      <div className={`panel-title ${pill ? "row" : ""}`.trim()}>
        <h3>{title}</h3>
        {description && <p>{description}</p>}
        {pill && <span className="panel-pill">{pill}</span>}
      </div>
      {children}
    </article>
  );
}
