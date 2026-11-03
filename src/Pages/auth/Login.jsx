import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "./authContext";
import { errorCode, errorKey } from "../../services/authClient";
import AuthLayout from "./AuthLayout";
import PasswordField from "./PasswordField";

export default function Login({ onNavigate, initialEmail = "", notice = "" }) {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email.trim(), password);
      // success: the app replaces this screen by itself
    } catch (err) {
      if (errorCode(err) === "EMAIL_NOT_VERIFIED") {
        onNavigate("verify", { email: email.trim(), autoSend: true });
        return;
      }
      setError(errorKey(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title={t("auth.loginTitle")}
      subtitle={t("auth.loginSubtitle")}
      footer={
        <>
          {t("auth.noAccount")}{" "}
          <button type="button" className="auth-link" onClick={() => onNavigate("register")}>
            {t("auth.signUpLink")}
          </button>
        </>
      }
    >
      {notice && (
        <div className="auth-notice" role="status">
          {t(notice)}
        </div>
      )}
      {error && (
        <div className="auth-error" role="alert">
          {t(error)}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="auth-field">
          <label htmlFor="login-email">{t("auth.email")}</label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
            autoFocus
          />
        </div>

        <PasswordField
          id="login-password"
          label={t("auth.password")}
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />

        <div className="auth-row">
          <button type="button" className="auth-link" onClick={() => onNavigate("forgot", { email })}>
            {t("auth.forgotLink")}
          </button>
        </div>

        <button type="submit" className="auth-primary" disabled={busy || !email || !password}>
          {busy ? t("auth.working") : t("auth.logIn")}
        </button>
      </form>
    </AuthLayout>
  );
}