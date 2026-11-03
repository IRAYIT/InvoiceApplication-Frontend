import { useTranslation } from "react-i18next";
import logo from "../../assets/images/i-ray-logo.png";
import LanguageSwitcher from "../../Components/LanguageSwitcher";
import "./auth.css";

/** The frame around every logged-out screen: brand panel on the left, the form card on the right. */
export default function AuthLayout({ title, subtitle, children, footer }) {
  const { t } = useTranslation();

  return (
    <div className="auth-page">
      <aside className="auth-brand">
        <img src={logo} alt="i-ray IT Solutions" className="auth-logo" />
        <div className="auth-brand-accent" />
        <h2>{t("auth.welcomeTitle")}</h2>
        <p>{t("auth.welcomeText")}</p>
        <div className="auth-lang">
          <LanguageSwitcher />
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          <h1>{title}</h1>
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}
          {children}
          {footer && <div className="auth-footer">{footer}</div>}
        </div>
      </main>
    </div>
  );
}