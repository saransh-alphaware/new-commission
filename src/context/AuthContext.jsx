import React, { useState, useMemo } from "react";

export const AuthContext = React.createContext();

export function AuthContextProvider({ children }) {
  const [userRole, setUserRole] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [agentId, setAgentId] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCustomer, setIsCustomer] = useState(false);

  const contextValue = useMemo(
    () => ({
      userRole,
      setUserRole,
      userDetails,
      setUserDetails,
      agentId,
      setAgentId,
      token,
      setToken,
      refreshToken,
      setRefreshToken,
      loading,
      setLoading,
      isAuthenticated,
      setIsAuthenticated,
      isCustomer,
      setIsCustomer,
    }),
    [
      userRole,
      userDetails,
      agentId,
      token,
      refreshToken,
      loading,
      isAuthenticated,
      isCustomer,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
