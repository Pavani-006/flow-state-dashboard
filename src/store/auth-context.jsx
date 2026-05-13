import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage for an existing session
    const storedUser = localStorage.getItem("flowdesk_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (email, password) => {
    // Simulate API call and login logic
    const nameFromEmail = email.split("@")[0];
    const mockUser = {
      id: "1",
      name: nameFromEmail || "User",
      email: email,
    };
    setUser(mockUser);
    localStorage.setItem("flowdesk_user", JSON.stringify(mockUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("flowdesk_user");
  };

  const updateUser = (patch) => {
    if (user) {
      const updatedUser = { ...user, ...patch };
      setUser(updatedUser);
      localStorage.setItem("flowdesk_user", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
