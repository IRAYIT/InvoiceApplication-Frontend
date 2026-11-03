import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AuthApi, errorKey } from "../../services/authClient";
import AuthLayout from "./AuthLayout";
import PasswordField from "./PasswordField";
import { passwordProblem } from "./passwordRules";

export default function Register({ onNavigate }) {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const problem = passwordProblem(password, confirm);
    if (problem) {
      setError(problem);
      return;
    }
    if (!terms) {
      setError("auth.termsRequired");
      return;
    }

    setBusy(true);
    try {
      await AuthApi.register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        termsAccepted: true,
      });
      onNavigate("verify", { email: email.trim(), notice: "auth.codeSentGeneric" });
    } catch (err) {
      setError(errorKey(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title={t("auth.registerTitle")}
      subtitle={t("auth.registerSubtitle")}
      footer={
        <>
          {t("auth.haveAccount")}{" "}
          <button type="button" className="auth-link" onClick={() => onNavigate("login")}>
            {t("auth.logInLink")}
          </button>
        </>
      }
    >
      {error && (
        <div className="auth-error" role="alert">
          {t(error)}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="auth-name-row">
          <div className="auth-field">
            <label htmlFor="reg-first">{t("auth.firstName")}</label>
            <input
              id="reg-first"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
              maxLength={100}
              required
              autoFocus
            />
          </div>
          <div className="auth-field">
            <label htmlFor="reg-last">{t("auth.lastName")}</label>
            <input
              id="reg-last"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
              maxLength={100}
              required
            />
          </div>
        </div>

        <div className="auth-field">
          <label htmlFor="reg-email">{t("auth.email")}</label>
          <input
            id="reg-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <PasswordField
          id="reg-password"
          label={t("auth.password")}
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          hint={t("auth.passwordHint")}
        />
        <PasswordField
          id="reg-confirm"
          label={t("auth.confirmPassword")}
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
        />

        <label className="auth-terms">
          <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
          <span>{t("auth.acceptTerms")}</span>
        </label>

        <button type="submit" className="auth-primary" disabled={busy}>
          {busy ? t("auth.working") : t("auth.createAccount")}
        </button>
      </form>
    </AuthLayout>
  );
}