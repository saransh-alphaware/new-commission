import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { toast } from "sonner";
import Footer from "../../components/Footer";
import { AuthContext } from "../../context/AuthContext";
import { encryptId } from "../../utils/cryptoHelper";
import { useTurnstile } from "../../hooks/useTurnstile";
import { postServerData } from "../../config/apiRequest";

const LoginPage = ({ onForgotPassword }) => {
  const {
    setIsAuthenticated,
    setToken,
    setRefreshToken,
    setAgentId,
    setIsCustomer,
  } = useContext(AuthContext);
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || "";
  const {
    containerRef,
    isReady: isCaptchaReady,
    error: captchaError,
    getToken,
    reset: resetCaptcha,
  } = useTurnstile(siteKey);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!isCaptchaReady) {
      toast.error("Captcha is not ready. Please try again later.");
      return;
    }
    const captchaToken = getToken();
    if (!captchaToken) {
      toast.error("Please complete the CAPTCHA verification");
      return;
    }
    if (!userId || !password) {
      return;
    }
    setLoading(true);
    const response = await postServerData(`agents/login`, {
      username: userId,
      password: password,
      captchaToken: captchaToken,
    }, null, { skipToken: true });
    if (response.value) {
      if (response.status === 200 || response.status === 201) {
        if (response?.data?.data?.hasOwnProperty("agentId")) {
          const myToken = response?.data?.data?.accesstoken;
          setToken(myToken);
          const encryptedToken = encryptId(myToken);
          sessionStorage?.setItem("token", encryptedToken);
          const myRefreshToken = response?.data?.data?.refreshToken;
          setRefreshToken(myRefreshToken);
          const encryptedRefreshToken = encryptId(myRefreshToken);
          sessionStorage?.setItem("refreshToken", encryptedRefreshToken);
          setIsAuthenticated(true);
          const userData = response?.data?.data;
          const encryptedAgentId = encryptId(userData?.agentId);
          sessionStorage?.setItem("agentId", encryptedAgentId);
          setAgentId(response?.data?.data?.agentId);
          sessionStorage?.setItem("customerDetails", encryptId("false"));
          setIsCustomer(false);
          toast.success("Login successful!");
          navigation("");
        } else if (response?.data?.data?.hasOwnProperty("customerId")) {
          const myToken = response?.data?.data?.accesstoken;
          setToken(myToken);
          const encryptedToken = encryptId(myToken);
          sessionStorage?.setItem("token", encryptedToken);
          const myRefreshToken = response?.data?.data?.refreshToken;
          setRefreshToken(myRefreshToken);
          const encryptedRefreshToken = encryptId(myRefreshToken);
          sessionStorage?.setItem("refreshToken", encryptedRefreshToken);
          setIsAuthenticated(true);
          const userData = { agentId: userId }; // Storing Customer Id as agent Id
          const encryptedAgentId = encryptId(userData?.agentId);
          sessionStorage?.setItem("agentId", encryptedAgentId);
          setAgentId(userData?.agentId);
          sessionStorage?.setItem("customerDetails", encryptId("true"));
          setIsCustomer(true);
          toast.success("Login successful!");
          navigation("/savingAccount");
        } else {
          setIsAuthenticated(false);
          toast.error(response?.message || "Login Failed.");
        }
      } else {
        setIsAuthenticated(false);
        toast.error(response?.message || "Login Failed.");
      }
    } else {
      setIsAuthenticated(false);
      toast.error(response?.message || "Login Failed.");
    }
    setLoading(false);
    resetCaptcha();
  };

  return (
    <>
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

      <div className="flex flex-col items-center h-auto w-full px-5 sm:pb-0 bg-white dark:bg-dark-bg text-black dark:text-white min-h-[calc(100vh-8rem)] justify-center">
        <div className="flex flex-col mt-2 bg-white rounded-lg shadow-lg border items-center overflow-hidden max-w-md w-full p-6 dark:bg-dark-bg dark:border-white/10 border-black/10 text-black dark:text-white">
          <img
            className="h-20 w-20 m-auto"
            src="./images/TTMS.png"
            alt="logo"
          />
          <span className="w-full text-black text-center text-xl p-3 md:text-2xl lg:text-2xl dark:text-white">
            Welcome To DMS Agent Panel
          </span>
          <form onSubmit={handleLogin} className="w-full">
            <div className="mt-4">
              <label className="block text-sm font-bold mb-2 text-black dark:text-white">
                User Id <span className="text-red-500">*</span>
              </label>
              <input
                className="border rounded py-2 px-4 block w-full text-black dark:text-white bg-white dark:bg-[#1e1e1e] border-black/20 dark:border-white/20 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand"
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter User Id"
                required
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-bold mb-2 text-black dark:text-white">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  className="border rounded py-2 px-4 pr-10 block w-full text-black dark:text-white bg-white dark:bg-[#1e1e1e] border-black/20 dark:border-white/20 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  required
                />
                <button
                  type="button"
                  className="absolute border-none bg-transparent inset-y-0 right-0 pr-3 flex items-center focus:outline-none text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <IoMdEyeOff size={18} /> : <IoMdEye size={18} />}
                </button>
              </div>
            </div>
            <div className="mt-1 flex justify-end ">
              <label
                className="block text-sm cursor-pointer font-bold mb-0 text-brand hover:underline dark:text-cyan-400"
                onClick={onForgotPassword}
              >
                Forgot Password ?
              </label>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold mb-2 text-black dark:text-white">
                Verification <span className="text-red-500">*</span>
              </label>
              <div
                ref={containerRef}
                className="flex justify-center bg-muted/30"
              />
              {captchaError && (
                <p className="text-sm text-destructive">{captchaError}</p>
              )}
            </div>
            <div className="mt-4">
              <button
                className={`bg-brand text-white py-2 px-4 w-full rounded cursor-pointer ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading || !isCaptchaReady}
              >
                {loading ? "Loging..." : "Login"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default LoginPage;


