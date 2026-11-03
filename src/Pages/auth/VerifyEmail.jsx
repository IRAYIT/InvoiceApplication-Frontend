import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AuthApi, errorKey } from "../../services/authClient";
import AuthLayout from "./AuthLayout";
import useCooldown from "./useCooldown";

export default function VerifyEmail({ onNavigate, email, autoSend = false, notice = "" }) {
  const { t } = useTranslation();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState(notice);
  const [busy, setBusy] = useState(false);
  const [cooldown, startCooldown] = useCooldown(60);
  const autoSentRef = useRef(false);

  // Arriving from a login attempt with an unverified account: send a fresh code once.
  useEffect(() => {
    if (!autoSend || autoSentRef.current) return;
    autoSentRef.current = true;
    AuthApi.resendVerification(email).catch(() => {});
  }, [autoSend, email]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    if (code.length !== 6) {
      setError("auth.codeFormat");
      return;
    }
    setBusy(true);
    try {
      await AuthApi.verifyEmail(email, code);
      onNavigate("login", { email, notice: "auth.verified" });
    } catch (err) {
      setError(errorKey(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleResend() {
    setError("");
    setInfo("");
    try {
      await AuthApi.resendVerification(email);
      setInfo("auth.newCodeSent");
      startCooldown(60);
    } catch (err) {
      setError(errorKey(err));
    }
  }

  return (
    <AuthLayout
      title={t("auth.verifyTitle")}
      subtitle={t("auth.verifySubtitle", { email })}
      footer={
        <button type="button" className="auth-link" onClick={() => onNavigate("login")}>
          {t("auth.backToLogin")}
        </button>
      }
    >
      {info && (
        <div className="auth-notice" role="status">
          {t(info)}
        </div>
      )}
      {error && (
        <div className="auth-error" role="alert">
          {t(error)}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="auth-field auth-code">
          <label htmlFor="verify-code">{t("auth.code")}</label>
          <input
            id="verify-code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
            autoFocus
          />
        </div>

        <button type="submit" className="auth-primary" disabled={busy || code.length !== 6}>
          {busy ? t("auth.working") : t("auth.verify")}
        </button>
      </form>

      <div className="auth-row auth-row-center">
        <button type="button" className="auth-link" onClick={handleResend} disabled={cooldown > 0}>
          {cooldown > 0 ? t("auth.resendIn", { seconds: cooldown }) : t("auth.resendCode")}
        </button>
      </div>
    </AuthLayout>
  );
}