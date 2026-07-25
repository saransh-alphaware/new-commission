import { useContext, useEffect, useState } from "react";
import { AuthContext } from "./context/AuthContext";
import { decryptId } from "./utils/cryptoHelper";
import Layout from "./pages/Layout";
import Login from "./pages/Login";

const App = () => {
  const {
    isAuthenticated,
    setIsAuthenticated,
    setToken,
    setRefreshToken,
    setAgentId,
    setUserDetails,
    setIsCustomer,
  } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const applyTheme = () => {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark' || (!savedTheme && mediaQuery.matches)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme();

    const handleSystemThemeChange = (e) => {
      if (!localStorage.getItem('theme')) {
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  useEffect(() => {
    const encryptedToken = sessionStorage?.getItem("token");
    const encryptedRefreshToken = sessionStorage?.getItem("refreshToken");
    const encryptedAgentId = sessionStorage?.getItem("agentId");
    const encryptedAgentDetails = sessionStorage?.getItem("agentDetails");
    const encryptedIsCustomer = sessionStorage?.getItem("customerDetails");

    if (encryptedToken && encryptedAgentId && encryptedAgentDetails) {
      const token = decryptId(encryptedToken);
      const refresh_token = decryptId(encryptedRefreshToken);
      const agentId = decryptId(encryptedAgentId);
      const agentDetails = decryptId(encryptedAgentDetails);
      const isCustomer = decryptId(encryptedIsCustomer);
      setLoading(false);
      setIsAuthenticated(true);
      setToken(token);
      setRefreshToken(refresh_token);
      setAgentId(agentId);
      setIsCustomer(isCustomer === "true" ? true : false);
      setUserDetails({ ...JSON.parse(agentDetails) }); // Store the token in your AuthContext
    } else {
      setIsAuthenticated(false);
      setLoading(false);
    }
  }, [setIsAuthenticated, setToken, setRefreshToken, setAgentId, setIsCustomer, setUserDetails]);

  return (
    <div className="w-full dark:bg-gray-900 ">
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : isAuthenticated ? (
        <Layout />
      ) : (
        <Login />
      )}
    </div>
  );
};

export default App;
