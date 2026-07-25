import { useState, useRef, useEffect } from "react";
import { FaArrowLeft } from "react-icons/fa6";
import { toast } from "sonner";
import Footer from "../../components/Footer";
import { postServerData } from "../../config/apiRequest";

const OtpVerification = ({
  userData,
  onBack,
  onVerified,
  module = "forgot-password",
}) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(300);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split("");
    while (newOtp.length < 6) newOtp.push("");
    setOtp(newOtp);

    const nextEmptyIndex = newOtp.findIndex((digit) => !digit);
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      toast.warning("Please enter the complete 6-digit OTP");
      return;
    }
    setLoading(true);
    const response = await postServerData(
      "auth/forget-pwd/verify-otp",
      {
        userId: userData?.userId,
        otp: otpCode,
      },
      null,
      { skipToken: true },
    );
    if (response.value) {
      if (response.status === 200 || response.status === 201) {
        toast.success(response?.data?.message || "OTP verified successfully.");
        onVerified({ ...userData, otp: otpCode });
      } else {
        toast.error(response?.message || "OTP verification failed.");
      }
    } else {
      toast.error(response?.message || "OTP verification failed.");
    }
    setLoading(false);
  };

  const handleResend = async () => {
    if (timer > 0) return;

    setResendLoading(true);

    let response;
    if (module === "change-password") {
      response = await postServerData("agents/verify-pwd", {
        userId: userData.userId,
        currentPassword: userData.currentPassword,
      });
    } else {
      response = await postServerData(
        "auth/forget-pwd/verify-identity",
        {
          userId: userData?.userId,
          aadharNo: userData?.aadharNo,
          mobile: userData?.mobile,
        },
        null,
        { skipToken: true },
      );
    }
    if (response.value) {
      if (response.status === 200 || response.status === 201) {
        toast.success(response?.data?.message || "OTP resent successfully.");
        setTimer(300);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        toast.error(response?.message || "Failed to resend OTP.");
      }
    } else {
      toast.error(response?.message || "Failed to resend OTP.");
    }
    setResendLoading(false);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

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

      <div className="flex flex-col items-center h-auto w-full px-5 sm:pb-0 bg-white dark:bg-dark-bg text-black dark:text-white min-h-[calc(100vh-8rem)] justify-center">
        <div className="flex flex-col mt-2 bg-white rounded-lg shadow-lg border items-center overflow-hidden max-w-md w-full p-6 dark:bg-dark-bg dark:border-white/10 border-black/10 text-black dark:text-white">
          <label
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white mb-1 transition-colors w-full justify-start cursor-pointer"
          >
            <FaArrowLeft size={20} />
            <span className="text-sm font-medium">
              Back to{" "}
              {module === "forgot-password" ? "Login" : "Change Password"}
            </span>
          </label>
          <img
            className="h-20 w-20 m-auto"
            src="./images/TTMS.png"
            alt="logo"
          />
          <span className="w-full text-black text-center text-xl p-3 md:text-2xl lg:text-2xl dark:text-white">
            Verify OTP
          </span>
          <p className="text-center text-gray-600 dark:text-gray-400 text-sm mb-2">
            Enter the 6-digit code sent to your registered mobile number
          </p>
          <form onSubmit={handleSubmit} className="w-full">
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-14 text-center text-2xl font-semibold bg-blue-50 dark:bg-white/5 border-2 border-transparent dark:border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white dark:focus:bg-dark-bg focus:border-brand transition-all text-black dark:text-white"
                />
              ))}
            </div>
            <div className="mt-4">
              <button
                className={`bg-brand text-white py-2 px-4 w-full rounded cursor-pointer ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
              <div className="text-center">
                {timer > 0 ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Resend OTP in{" "}
                    <span className="font-semibold text-brand dark:text-cyan-400">
                      {formatTime(timer)}
                    </span>
                  </p>
                ) : (
                  <p
                    onClick={handleResend}
                    disabled={resendLoading}
                    className="text-sm text-brand dark:text-cyan-400 hover:underline font-medium transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {resendLoading ? "Sending..." : "Resend OTP"}
                  </p>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
      {module === "forgot-password" && <Footer />}
    </>
  );
};

export default OtpVerification;


