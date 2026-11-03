import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function PasswordField({ id, label, value, onChange, autoComplete, hint }) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <div className="auth-password">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          required
        />
        <button
          type="button"
          className="auth-eye"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? t("auth.hidePassword") : t("auth.showPassword")}
          tabIndex={-1}
        >
          {visible ? <FiEyeOff /> : <FiEye />}
        </button>
      </div>
      {hint && <small className="auth-hint">{hint}</small>}
    </div>
  );
}