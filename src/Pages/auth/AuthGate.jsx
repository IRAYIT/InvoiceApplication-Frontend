import { useState } from "react";
import ForgotPassword from "./ForgotPassword";
import Login from "./Login";
import Register from "./Register";
import ResetPassword from "./ResetPassword";
import VerifyEmail from "./VerifyEmail";

/**
 * Everything a logged-out visitor can see. The app shows this instead of the
 * normal pages until the user is logged in. `go(screen, params)` switches screens.
 */
export default function AuthGate() {
  const [view, setView] = useState({ screen: "login" });
  const go = (screen, params = {}) => setView({ screen, ...params });

  switch (view.screen) {
    case "register":
      return <Register onNavigate={go} />;
    case "verify":
      return (
        <VerifyEmail onNavigate={go} email={view.email} autoSend={view.autoSend} notice={view.notice} />
      );
    case "forgot":
      return <ForgotPassword onNavigate={go} initialEmail={view.email} />;
    case "reset":
      return <ResetPassword onNavigate={go} email={view.email} notice={view.notice} />;
    default:
      return <Login onNavigate={go} initialEmail={view.email} notice={view.notice} />;
  }
}