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
} from "../api/auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(() =>
    localStorage.getItem("accessToken"),
  );
  const [currentOrg, setCurrentOrg] = useState(() => {
    const stored = localStorage.getItem("currentOrg");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Restore user from localStorage on page refresh
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await loginApi({ email, password });
      setUser(data.user);
      setAccessToken(data.accessToken);
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));
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
      // Logout server-side best-effort — clear client state regardless
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
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
