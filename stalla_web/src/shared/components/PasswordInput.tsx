import { useState } from "react";
import type { InputHTMLAttributes } from "react";
import { Icon } from "./Icon";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { withIcon?: boolean };

export function PasswordInput({ withIcon = true, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="input-wrapper">
      {withIcon && <Icon name="lock" size={20} className="input-icon" />}
      <input {...props} type={visible ? "text" : "password"} />
      <button
        type="button"
        className="password-toggle-btn"
        onClick={() => setVisible((prev) => !prev)}
        aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
      >
        <Icon name={visible ? "eyeOff" : "eye"} />
      </button>
    </div>
  );
}
