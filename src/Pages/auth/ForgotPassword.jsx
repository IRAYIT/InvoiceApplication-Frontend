import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AuthApi, errorKey } from "../../services/authClient";
import AuthLayout from "./AuthLayout";

export default function ForgotPassword({ onNavigate, initialEmail = "" }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await AuthApi.forgotPassword(email.trim());
      // the server answers the same whether or not the address has an account
      onNavigate("reset", { email: email.trim(), notice: "auth.resetCodeSent" });
    } catch (err) {
      setError(errorKey(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title={t("auth.forgotTitle")}
      subtitle={t("auth.forgotSubtitle")}
      footer={
        <button type="button" className="auth-link" onClick={() => onNavigate("login", { email })}>
          {t("auth.backToLogin")}
        </button>
      }
    >
      {error && (
        <div className="auth-error" role="alert">
          {t(error)}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="auth-field">
          <label htmlFor="forgot-email">{t("auth.email")}</label>
          <input
            id="forgot-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
            autoFocus
          />
        </div>

        <button type="submit" className="auth-primary" disabled={busy || !email}>
          {busy ? t("auth.working") : t("auth.sendCode")}
        </button>
      </form>
    </AuthLayout>
  );
}