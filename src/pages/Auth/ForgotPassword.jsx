import { useState } from "react";
import { FaArrowLeft } from "react-icons/fa6";
import { toast } from "sonner";
import Footer from "../../components/Footer";
import { postServerData } from "../../config/apiRequest";
import { encryptAadharId } from "../../utils/cryptoHelper";
import { encrypt } from "../../utils/ECollectCryptoUtil";

const ForgotPassword = ({ onBack, onOtpSent }) => {
  const ECollect_Add = `txnId=${import.meta.env.VITE_ECOLLECT_ADD}`;
  const [userId, setUserId] = useState("");
  const [aadharNo, setAadharNo] = useState("");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId || userId?.trim()?.length <= 0) {
      toast.warning("Please enter your user id.");
      return;
    }

    if (!aadharNo || aadharNo?.trim()?.length <= 0) {
      toast.warning("Please enter your aadhar number.");
      return;
    }

    const aadharRegex = /^[0-9]{12}$/;
    if (!aadharRegex.test(aadharNo)) {
      toast.warning("Please enter a valid 12-digit aadhar number");
      return;
    }

    if (!mobile || mobile?.trim()?.length <= 0) {
      toast.warning("Please enter your mobile number.");
      return;
    }

    const mobileRegex = /^[0-9]{10}$/;

    if (!mobileRegex.test(mobile)) {
      toast.warning("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);

    const encryptedAadhar = await encrypt(
      encryptAadharId(aadharNo),
      ECollect_Add,
    );
    const response = await postServerData(
      "auth/forget-pwd/verify-identity",
      {
        userId: userId,
        aadharNo: encryptedAadhar,
        mobile: mobile,
      },
      null,
      { skipToken: true },
    );

    if (response?.value) {
      if (response.status === 200 || response.status === 201) {
        toast.success(response?.data?.message || "OTP sent successfully.");
        onOtpSent({
          userId: userId,
          aadharNo: aadharNo,
          mobile: mobile,
        });
      } else {
        toast.error(response?.message || "Failed to send OTP.");
      }
    } else {
      toast.error(response?.message || "Failed to send OTP.");
    }
    setLoading(false);
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

      <div className="flex flex-col items-center h-auto w-full px-5 sm:pb-0 bg-white dark:bg-dark-bg text-black dark:text-white mb-10 overflow-y-auto min-h-screen">
        <div className="flex flex-col mt-2 bg-white rounded-lg shadow-lg border items-center overflow-hidden max-w-md w-full p-6 dark:bg-dark-bg dark:border-white/10 border-black/10 text-black dark:text-white">
          <label
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white mb-1 transition-colors w-full justify-start cursor-pointer"
          >
            <FaArrowLeft size={20} />
            <span className="text-sm font-medium">Back to Login</span>
          </label>
          <img
            className="h-20 w-20 m-auto"
            src="./images/TTMS.png"
            alt="logo"
          />
          <span className="w-full text-black text-center text-xl p-3 md:text-2xl lg:text-2xl dark:text-white">
            Forgot Password
          </span>
          <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
            Enter your registered User Details to receive an OTP
          </p>
          <form onSubmit={handleSubmit} className="w-full">
            <div>
              <label className="block text-sm font-bold mb-2 text-black dark:text-white">
                User Id <span className="text-red-700 dark:text-red-400">*</span>
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
            <div className="mt-2">
              <label className="block text-sm font-bold mb-2 text-black dark:text-white">
                Aadhar Number <span className="text-red-700 dark:text-red-400">*</span>
              </label>
              <input
                className="border rounded py-2 px-4 block w-full text-black dark:text-white bg-white dark:bg-[#1e1e1e] border-black/20 dark:border-white/20 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand"
                type="tel"
                value={aadharNo}
                onChange={
                  (e) => setAadharNo(e.target.value.replace(/[^0-9]/g, "")) // restrict non-numeric
                }
                placeholder="Enter Aadhar Number"
                maxLength={12}
                minLength={12}
                required
              />
            </div>
            <div className="mt-2">
              <label className="block text-sm font-bold mb-2 text-black dark:text-white">
                Mobile Number <span className="text-red-700 dark:text-red-400">*</span>
              </label>
              <input
                className="border rounded py-2 px-4 block w-full text-black dark:text-white bg-white dark:bg-[#1e1e1e] border-black/20 dark:border-white/20 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand"
                type="tel"
                value={mobile}
                onChange={
                  (e) => setMobile(e.target.value.replace(/[^0-9]/g, "")) // restrict non-numeric
                }
                placeholder="Enter Mobile Number"
                maxLength={10}
                minLength={10}
                required
              />
            </div>
            <div className="mt-4">
              <button
                className={`bg-brand text-white py-2 px-4 w-full rounded cursor-pointer ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ForgotPassword;


