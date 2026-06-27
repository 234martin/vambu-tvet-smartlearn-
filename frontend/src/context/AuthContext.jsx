import { createContext, useContext, useEffect, useState } from "react";
import * as endpoints from "../api/endpoints";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("vsl_token");
    const cachedUser = localStorage.getItem("vsl_user");
    if (token && cachedUser) {
      setUser(JSON.parse(cachedUser));
      // Verify token is still valid / refresh user data in the background
      endpoints
        .getMe()
        .then((res) => {
          setUser(res.data);
          localStorage.setItem("vsl_user", JSON.stringify(res.data));
        })
        .catch(() => {
          localStorage.removeItem("vsl_token");
          localStorage.removeItem("vsl_user");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = async (email, password) => {
    const res = await endpoints.login(email, password);
    localStorage.setItem("vsl_token", res.data.access_token);
    localStorage.setItem("vsl_user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const signUp = async (payload) => {
    const res = await endpoints.register(payload);
    localStorage.setItem("vsl_token", res.data.access_token);
    localStorage.setItem("vsl_user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const signOut = () => {
    localStorage.removeItem("vsl_token");
    localStorage.removeItem("vsl_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
