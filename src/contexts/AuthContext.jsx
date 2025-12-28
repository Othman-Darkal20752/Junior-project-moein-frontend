import { createContext, useContext, useState, useEffect } from 'react';
import { getToken, setToken, removeToken, getUser, setUser, removeUser, isTokenExpired } from '../utils/tokenUtils';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [token, setTokenState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = getToken();
    const storedUser = getUser();

    if (storedToken && !isTokenExpired(storedToken)) {
      setTokenState(storedToken);
      setUserState(storedUser);
    } else {
      removeToken();
      removeUser();
    }
    setLoading(false);
  }, []);

  const login = (tokenData, userData) => {
    setToken(tokenData);
    setUser(userData);
    setTokenState(tokenData);
    setUserState(userData);
  };

  const logout = () => {
    removeToken();
    removeUser();
    setTokenState(null);
    setUserState(null);
  };

  const isAuthenticated = () => {
    return token && !isTokenExpired(token);
  };

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: isAuthenticated(),
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


