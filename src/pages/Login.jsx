import { useState } from "react";
import LoginPage from "./Auth/LoginPage";
import ForgotPassword from "./Auth/ForgotPassword";
import OtpVerification from "./Auth/OtpVerification";
import ResetPassword from "./Auth/ResetPassword";

function Login() {
  const [currentPage, setCurrentPage] = useState("login");
  const [userData, setUserData] = useState("");

  const handleForgotPassword = () => {
    setCurrentPage("forgot-password");
  };

  const handleBackToLogin = () => {
    setCurrentPage("login");
    setUserData("");
  };

  const handleOtpSent = (userData) => {
    setUserData(userData);
    setCurrentPage("otp-verification");
  };

  const handleOtpVerified = (userData) => {
    setUserData(userData);
    setCurrentPage("reset-password");
  };

  const handlePasswordReset = () => {
    setUserData("");
    setCurrentPage("login");
  };

  const handleOnExpired = () => {
    setUserData("");
    setCurrentPage("forgot-password");
  };

  switch (currentPage) {
    case "login":
      return <LoginPage onForgotPassword={handleForgotPassword} />;

    case "forgot-password":
      return (
        <ForgotPassword onBack={handleBackToLogin} onOtpSent={handleOtpSent} />
      );

    case "otp-verification":
      return (
        <OtpVerification
          userData={userData}
          onBack={handleBackToLogin}
          onVerified={handleOtpVerified}
          module="forgot-password"
        />
      );

    case "reset-password":
      return (
        <ResetPassword
          userData={userData}
          onSuccess={handlePasswordReset}
          onExpired={handleOnExpired}
          module="forgot-password"
        />
      );

    default:
      return <LoginPage onForgotPassword={handleForgotPassword} />;
  }
}

export default Login;
