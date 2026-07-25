import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CurrentPassword from "./Auth/CurrentPassword";
import OtpVerification from "./Auth/OtpVerification";
import ResetPassword from "./Auth/ResetPassword";

function ChangePassword() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState("current-password");
  const [userData, setUserData] = useState("");

  const handleBackToLogin = () => {
    setCurrentPage("current-password");
    setUserData("");
  };

  const handleOtpSent = (userData) => {
    setUserData(userData);
    setCurrentPage("otp-verification");
  };

  const handleOtpVerified = (userData) => {
    setUserData(userData);
    setCurrentPage("update-password");
  };

  const handlePasswordReset = () => {
    setUserData("");
    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
  };

  const handleOnExpired = () => {
    setUserData("");
    setCurrentPage("current-password");
  };

  switch (currentPage) {
    case "current-password":
      return <CurrentPassword onOtpSent={handleOtpSent} />;

    case "otp-verification":
      return (
        <OtpVerification
          userData={userData}
          onBack={handleBackToLogin}
          onVerified={handleOtpVerified}
          module="change-password"
        />
      );

    case "update-password":
      return (
        <ResetPassword
          userData={userData}
          onSuccess={handlePasswordReset}
          onExpired={handleOnExpired}
          module="change-password"    
        />
      );

    default:
      return <CurrentPassword onOtpSent={handleOtpSent} />;
  }
}

export default ChangePassword;

