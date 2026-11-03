import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AuthApi, errorKey } from "../../services/authClient";
import AuthLayout from "./AuthLayout";
import PasswordField from "./PasswordField";
import { passwordProblem } from "./passwordRules";
import useCooldown from "./useCooldown";

export default function ResetPassword({ onNavigate, email, notice = "" }) {
  const { t } = useTranslation();
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState(notice);
  const [busy, setBusy] = useState(false);
  const [cooldown, startCooldown] = useCooldown(60);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");

    if (code.length !== 6) {
      setError("auth.codeFormat");
      return;
    }
    const problem = passwordProblem(password, confirm);
    if (problem) {
      setError(problem);
      return;
    }

    setBusy(true);
    try {
      await AuthApi.resetPassword({
        email,
        code,
        newPassword: password,
        confirmPassword: confirm,
      });
      onNavigate("login", { email, notice: "auth.passwordResetDone" });
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
      await AuthApi.forgotPassword(email);
      setInfo("auth.newCodeSent");
      startCooldown(60);
    } catch (err) {
      setError(errorKey(err));
    }
  }

  return (
    <AuthLayout
      title={t("auth.resetTitle")}
      subtitle={t("auth.resetSubtitle", { email })}
      footer={
        <button type="button" className="auth-link" onClick={() => onNavigate("login", { email })}>
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
          <label htmlFor="reset-code">{t("auth.code")}</label>
          <input
            id="reset-code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
            autoFocus
          />
        </div>

        <PasswordField
          id="reset-password"
          label={t("auth.newPassword")}
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          hint={t("auth.passwordHint")}
        />
        <PasswordField
          id="reset-confirm"
          label={t("auth.confirmNewPassword")}
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
        />

        <button type="submit" className="auth-primary" disabled={busy}>
          {busy ? t("auth.working") : t("auth.resetPassword")}
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