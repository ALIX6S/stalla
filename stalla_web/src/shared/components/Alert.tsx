import type { ReactNode } from "react";
import { Icon } from "./Icon";

interface AlertProps {
  type?: "success" | "error";
  icon?: boolean;
  children: ReactNode;
}

export function Alert({ type = "error", icon = false, children }: AlertProps) {
  return (
    <div className={`alert ${type === "success" ? "success" : ""}`} role={type === "error" ? "alert" : "status"}>
      {icon && <Icon name="info" size={20} />}
      {children}
    </div>
  );
}
