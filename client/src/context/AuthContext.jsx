import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  login as loginApi,
  register as registerApi,
  logout as logoutApi,
  getMe,
} from "../api/auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(() =>
    localStorage.getItem("accessToken"),
  );
  const [currentOrg, setCurrentOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // On every app load, call /api/auth/me to verify the stored token is
  // still valid and fetch the correct org for whoever is logged in.
  // This prevents stale org context from a previous session or a different
  // account — no manual sign out/in needed to fix mismatched state.
  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    if (!storedToken) {
      setLoading(false);
      return;
    }

    getMe()
      .then(({ data }) => {
        setUser(data.user);
        setAccessToken(storedToken);
        setCurrentOrg(data.organization);
        localStorage.setItem("user", JSON.stringify(data.user));
        if (data.organization) {
          localStorage.setItem("currentOrg", JSON.stringify(data.organization));
        }
      })
      .catch(() => {
        setUser(null);
        setAccessToken(null);
        setCurrentOrg(null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        localStorage.removeItem("currentOrg");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await loginApi({ email, password });
      setUser(data.user);
      setAccessToken(data.accessToken);
      setCurrentOrg(data.organization);
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.organization) {
        localStorage.setItem("currentOrg", JSON.stringify(data.organization));
      }
      return data;
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(
    async (name, email, password, organizationName) => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await registerApi({
          name,
          email,
          password,
          organizationName,
        });
        setUser(data.user);
        setAccessToken(data.accessToken);
        setCurrentOrg(data.organization);
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("currentOrg", JSON.stringify(data.organization));
        return data;
      } catch (err) {
        const message = err.response?.data?.message || "Registration failed";
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // Best-effort
    } finally {
      setUser(null);
      setAccessToken(null);
      setCurrentOrg(null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      localStorage.removeItem("currentOrg");
    }
  }, []);

  const selectOrg = useCallback((org) => {
    setCurrentOrg(org);
    localStorage.setItem("currentOrg", JSON.stringify(org));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        currentOrg,
        loading,
        error,
        login,
        register,
        logout,
        selectOrg,
        isAuthenticated: !!user && !!accessToken,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
