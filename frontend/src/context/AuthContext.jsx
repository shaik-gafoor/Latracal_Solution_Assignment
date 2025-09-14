import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem("currentUser");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const user = {
        id: response.data.user.id,
        name: response.data.user.name,
        email: response.data.user.email,
        token: response.data.token,
      };
      setCurrentUser(user);
      localStorage.setItem("currentUser", JSON.stringify(user));
      return user;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
  };

  const signup = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const user = {
        id: response.data.user.id,
        name: response.data.user.name,
        email: response.data.user.email,
        token: response.data.token,
      };
      setCurrentUser(user);
      localStorage.setItem("currentUser", JSON.stringify(user));
      return user;
    } catch (error) {
      throw error;
    }
  };

  const isAuthenticated = () => {
    return currentUser !== null;
  };

  const value = {
    currentUser,
    isLoading,
    login,
    logout,
    signup,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
