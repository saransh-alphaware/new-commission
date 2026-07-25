import { useState, useContext } from "react";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { toast } from "sonner";
import { postServerData } from "../../config/apiRequest";
import { AuthContext } from "../../context/AuthContext";
import Footer from "../../components/Footer";

const ResetPassword = ({ onOtpSent }) => {
  const { userDetails, agentId, isCustomer } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = isCustomer ? agentId : userDetails?.agentNumber;

    if (!newPassword || !confirmPassword) {
      toast.warning("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.warning("Passwords do not match");
      return;
    }

    if (!userId || userId?.trim()?.length <= 0) {
      toast.warning("User Id not found.");
      return;
    }
    setLoading(true);
    const response = await postServerData("agents/verify-pwd", {
      userId: userId,
      currentPassword: newPassword,
    });
    if (response?.value) {
      if (response.status === 200 || response.status === 201) {
        toast.success(response?.data?.message || "Current password verified.");
        onOtpSent({ userId: userId, currentPassword: newPassword });
      } else {
        toast.error(response?.message || "Verification failed.");
      }
    } else {
      toast.error(response?.message || "Verification failed.");
    }
    setLoading(false);
  };

  return (
    <>
      <div className="flex flex-col items-center h-auto w-full px-5 sm:pb-0 bg-white dark:bg-dark-bg text-black dark:text-white overflow-y-auto min-h-screen">
        <div className="flex flex-col mt-2 mb-12 bg-white rounded-lg shadow-lg border items-center overflow-hidden max-w-md w-full p-6 dark:bg-dark-bg dark:border-white/10 border-black/10 text-black dark:text-white">
          <img
            className="h-20 w-20 m-auto"
            src="./images/TTMS.png"
            alt="logo"
          />
          <span className="w-full text-black text-center text-xl p-3 md:text-2xl lg:text-2xl dark:text-white">
            Verify Current Password
          </span>
          <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
            Verify your current password to proceed
          </p>
          <form onSubmit={handleSubmit} className="w-full">
            <div className="mt-4">
              <label className="block text-sm font-bold mb-2 text-black dark:text-white">
                Current Password
              </label>
              <div className="relative">
                <input
                  className="border rounded py-2 px-4 block w-full text-black dark:text-white bg-white dark:bg-white/5 border-black/20 dark:border-white/20"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter Current Password"
                  required
                />
                <button
                  type="button"
                  className="absolute border-none bg-transparent inset-y-0 right-0 pr-3 flex items-center focus:outline-none text-black dark:text-white cursor-pointer"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <IoMdEyeOff /> : <IoMdEye />}
                </button>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-bold mb-2 text-black dark:text-white">
                Confirm Current Password
              </label>

              <div className="relative">
                <input
                  className="border rounded py-2 px-4 block w-full text-black dark:text-white bg-white dark:bg-white/5 border-black/20 dark:border-white/20"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Enter confirm current password"
                  required
                />
                <button
                  type="button"
                  className="absolute border-none bg-transparent inset-y-0 right-0 pr-3 flex items-center focus:outline-none text-black dark:text-white cursor-pointer"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <IoMdEyeOff /> : <IoMdEye />}
                </button>
              </div>
            </div>

            <div className="mt-4">
              <button
                className={`bg-brand text-white py-2 px-4 w-full rounded cursor-pointer ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                {loading ? "Changing Password..." : "Change Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ResetPassword;

