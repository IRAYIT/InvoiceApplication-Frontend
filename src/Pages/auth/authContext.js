import { createContext, useContext } from "react";

export const AuthContext = createContext(null);

/** Gives any component the logged-in user and the login / logout actions. */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}