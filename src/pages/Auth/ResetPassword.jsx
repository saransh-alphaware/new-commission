import { useState, useEffect, useContext } from "react";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { FaRegCheckCircle } from "react-icons/fa";
import { toast } from "sonner";
import Footer from "../../components/Footer";
import { postServerData, putServerData } from "../../config/apiRequest";
import { AuthContext } from "../../context/AuthContext";

const ResetPassword = ({
  userData,
  onSuccess,
  onExpired,
  module = "forgot-password",
}) => {
  const { setIsAuthenticated, refreshToken, setUserDetails } =
    useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(240);
  const [expired, setExpired] = useState(false);

  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number";
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return "Password must contain at least one special character";
    }
    return null;
  };

  const handleLogOut = async () => {
    try {
      const response = await postServerData("customers/logoutToken", {
        refreshToken: refreshToken,
      });

      if (response.status === 200 || response.status === 201) {
        setIsAuthenticated(false);
        setUserDetails({});
        localStorage.clear();
        sessionStorage.clear();
      } else {
        toast.error(response?.message || "Logout failed.");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error?.response?.data?.errorMessage || "An error occurred.",
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (expired) {
      toast.warning(
        "Your password reset session has expired. Please request a new reset link.",
      );
      return;
    }

    if (!newPassword || !confirmPassword) {
      toast.warning("Please fill in all fields");
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      toast.warning(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.warning("Passwords do not match");
      return;
    }

    if (!userData?.userId || userData?.userId?.trim()?.length <= 0) {
      toast.warning("User Id not found.");
      return;
    }
    setLoading(true);
    let data = {
      userId: userData?.userId,
      otp: userData?.otp,
    };
    let response;
    if (module === "change-password") {
      data.password = confirmPassword;
      response = await putServerData("agents/change-password", data);
    } else if (module === "forgot-password") {
      data.newPwd = newPassword;
      data.confirmPwd = confirmPassword;
      response = await putServerData("auth/forget-pwd/reset-pwd", data, null, {
        skipToken: true,
      });
    }
    if (response?.value) {
      if (response.status === 200 || response.status === 201) {
        toast.success(response?.data?.message || "Password reset successfully!");
        setSuccess(true);
        setTimeout(async () => {
          if (module === "change-password") {
            await handleLogOut();
          }
          onSuccess();
        }, 2000);
      } else {
        toast.error(response?.message || "Failed to reset password.");
      }
    } else {
      toast.error(response?.message || "Failed to reset password.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (timeLeft <= 0) {
      setExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (expired) {
      onExpired();
    }
  }, [expired, onExpired]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-bg dark:to-dark-bg flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-md">
            <div className="bg-white dark:bg-dark-bg border border-black/10 dark:border-white/10 rounded-2xl shadow-xl p-8 text-center text-black dark:text-white">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-lg">
                  <FaRegCheckCircle size={40} className="text-white" />
                </div>
              </div>

              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                Password Reset Successfully!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                Your password has been reset successfully. You can now login
                with your new password.
              </p>

              <div className="animate-pulse text-sm text-brand dark:text-cyan-400 mt-4">
                Redirecting to login...
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {module === "forgot-password" && (
        <div className="flex flex-row justify-center items-center bg-white dark:bg-dark-bg text-black dark:text-white">
          <img className="h-20 w-20 m-0" src="./images/TTMS.png" alt="logos" />
          <div className="flex flex-col m-0 p-0 w-full">
            <div className="w-full text-center justify-center">
              <h4 className="font-[500] text-black text-xl font-serif md:text-2xl lg:text-2xl dark:text-white">
                DhanLaxmi Multistate Co-Op. Credit Society Limited.
              </h4>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center h-auto w-full px-5 sm:pb-0 bg-white dark:bg-dark-bg text-black dark:text-white overflow-y-auto min-h-screen">
        <div className="flex flex-col mt-2 mb-12 bg-white rounded-lg shadow-lg border items-center overflow-hidden max-w-md w-full p-6 dark:bg-dark-bg dark:border-white/10 border-black/10 text-black dark:text-white">
          <img
            className="h-20 w-20 m-auto"
            src="./images/TTMS.png"
            alt="logo"
          />
          <span className="w-full text-black text-center text-xl p-3 md:text-2xl lg:text-2xl dark:text-white">
            Reset Password
          </span>
          <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
            Create a new strong password for your account
          </p>
          {!expired ? (
            <div className="text-center text-sm text-brand dark:text-cyan-400 mb-2">
              Session expires in: {formatTime(timeLeft)}
            </div>
          ) : (
            <div className="text-center text-sm text-red-600 dark:text-red-400 mb-2">
              Your password update session has expired. Please request a new
              link.
            </div>
          )}
          <form onSubmit={handleSubmit} className="w-full">
            <div className="mt-4">
              <label className="block text-sm font-bold mb-2 text-black dark:text-white">
                New Password
              </label>
              <div className="relative">
                <input
                  className="border rounded py-2 px-4 pr-10 block w-full text-black dark:text-white bg-white dark:bg-[#1e1e1e] border-black/20 dark:border-white/20 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  className="absolute border-none bg-transparent inset-y-0 right-0 pr-3 flex items-center focus:outline-none text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white cursor-pointer"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <IoMdEyeOff size={18} /> : <IoMdEye size={18} />}
                </button>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-bold mb-2 text-black dark:text-white">
                Confirm Password
              </label>

              <div className="relative">
                <input
                  className="border rounded py-2 px-4 pr-10 block w-full text-black dark:text-white bg-white dark:bg-[#1e1e1e] border-black/20 dark:border-white/20 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Enter confirm password"
                  required
                />
                <button
                  type="button"
                  className="absolute border-none bg-transparent inset-y-0 right-0 pr-3 flex items-center focus:outline-none text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white cursor-pointer"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <IoMdEyeOff size={18} /> : <IoMdEye size={18} />}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-white/5 border border-blue-200 dark:border-white/10 rounded-lg p-3 mt-4">
              <span className="text-sm text-gray-700 dark:text-gray-200 font-medium">
                Password must contain :
              </span>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <li className="flex items-center gap-2">
                  <span
                    className={
                      newPassword.length >= 8
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-400"
                    }
                  >
                    •
                  </span>
                  At least 8 characters
                </li>
                <li className="flex items-center gap-2">
                  <span
                    className={
                      /[A-Z]/.test(newPassword)
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-400"
                    }
                  >
                    •
                  </span>
                  One uppercase letter
                </li>
                <li className="flex items-center gap-2">
                  <span
                    className={
                      /[a-z]/.test(newPassword)
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-400"
                    }
                  >
                    •
                  </span>
                  One lowercase letter
                </li>
                <li className="flex items-center gap-2">
                  <span
                    className={
                      /[0-9]/.test(newPassword)
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-400"
                    }
                  >
                    •
                  </span>
                  One number
                </li>
                <li className="flex items-center gap-2">
                  <span
                    className={
                      /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-400"
                    }
                  >
                    •
                  </span>
                  One special character
                </li>
              </ul>
            </div>

            <div className="mt-4">
              <button
                className={`bg-brand text-white py-2 px-4 w-full rounded cursor-pointer ${
                  loading || expired ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading || expired}
              >
                {expired
                  ? "Session Expired"
                  : loading
                    ? "Resetting Password..."
                    : "Reset Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
      {module === "forgot-password" && <Footer />}
    </>
  );
};

export default ResetPassword;


