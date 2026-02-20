import type { InputHTMLAttributes } from "react";
import { Icon } from "./Icon";
import type { IconName } from "./Icon";

type IconInputProps = InputHTMLAttributes<HTMLInputElement> & { icon: IconName };

export function IconInput({ icon, ...props }: IconInputProps) {
  return (
    <div className="input-wrapper">
      <Icon name={icon} size={20} className="input-icon" />
      <input {...props} />
    </div>
  );
}
