import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "./authContext";
import { errorKey } from "../../services/authClient";
import PasswordField from "./PasswordField";
import { MIN_PASSWORD_LENGTH, passwordProblem } from "./passwordRules";
import "./auth.css";

/** Inside the app: a logged-in user changes their own password (current + new + confirm). */
export default function ChangePassword() {
  const { t } = useTranslation();
  const { user, changePassword } = useAuth();
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setDone(false);

    const problem = passwordProblem(password, confirm);
    if (problem) {
      setError(problem);
      return;
    }
    if (password === current) {
      setError("auth.errors.SAME_PASSWORD");
      return;
    }

    setBusy(true);
    try {
      await changePassword(current, password, confirm);
      setCurrent("");
      setPassword("");
      setConfirm("");
      setDone(true);
    } catch (err) {
      setError(errorKey(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="account-page">
      <h1 className="account-title">{t("auth.changeTitle")}</h1>

      <div className="account-card">
        {user?.email && <p className="account-email">{user.email}</p>}
        <p className="auth-subtitle">{t("auth.changeSubtitle")}</p>

        {done && (
          <div className="auth-notice" role="status">
            {t("auth.passwordChanged")}
          </div>
        )}
        {error && (
          <div className="auth-error" role="alert">
            {t(error)}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <PasswordField
            id="cp-current"
            label={t("auth.currentPassword")}
            value={current}
            onChange={setCurrent}
            autoComplete="current-password"
          />
          <PasswordField
            id="cp-new"
            label={t("auth.newPassword")}
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            hint={t("auth.passwordHint", { min: MIN_PASSWORD_LENGTH })}
          />
          <PasswordField
            id="cp-confirm"
            label={t("auth.confirmNewPassword")}
            value={confirm}
            onChange={setConfirm}
            autoComplete="new-password"
          />

          <button type="submit" className="auth-primary" disabled={busy}>
            {busy ? t("auth.working") : t("auth.changePassword")}
          </button>
        </form>
      </div>
    </div>
  );
}