import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthApi, AccountApi, refreshSession } from "../../services/authClient";
import { AuthContext } from "./authContext";

const toUser = (data) => ({
  accountId: data.accountId,
  email: data.email,
  firstName: data.firstName,
  lastName: data.lastName,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On page load: if the refresh cookie is still valid, the user is logged in again.
  useEffect(() => {
    let active = true;
    refreshSession()
      .then((data) => {
        if (active) setUser(toUser(data));
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // The token could not be renewed (expired session, logged out elsewhere): show the login page.
  useEffect(() => {
    const onLogout = () => setUser(null);
    window.addEventListener("auth:logout", onLogout);
    return () => window.removeEventListener("auth:logout", onLogout);
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await AuthApi.login(email, password);
    setUser(toUser(data));
  }, []);

  const logout = useCallback(async () => {
    try {
      await AuthApi.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const logoutAll = useCallback(async () => {
    try {
      await AccountApi.logoutAll();
    } finally {
      setUser(null);
    }
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword, confirmPassword) => {
    const data = await AccountApi.changePassword({ currentPassword, newPassword, confirmPassword });
    setUser(toUser(data));
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout, logoutAll, changePassword }),
    [user, loading, login, logout, logoutAll, changePassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}