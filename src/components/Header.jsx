import { useState, useContext, useEffect, memo } from "react";
import { AuthContext } from "../context/AuthContext";
import { GiHamburgerMenu } from "react-icons/gi";
import {
  IoMdSearch,
  IoMdSunny,
  IoMdMoon,
} from "react-icons/io";
import { MdLogout, MdOutlineCancel } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useShortcut } from "../hooks/useShortcut";
import { postServerData } from "../config/apiRequest";
import GlobalSearch from "../config/GlobalSearch";
import Menu from "../config/sidebarIcons.json";

const Header = ({ isOpen, setIsOpen }) => {
  const auth = useContext(AuthContext) || {};
  const {
    setIsAuthenticated,
    userDetails,
    isCustomer = false,
    setUserDetails,
    refreshToken,
  } = auth;

  const [dataModal, setDataModal] = useState(false);
  const [searchModal, setSearchModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  useEffect(() => {
    const updateDarkState = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    updateDarkState();

    const observer = new MutationObserver(updateDarkState);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  useShortcut({
    "Alt+s": () => handleHamBurger(),
    "Alt+k": () => setSearchModal((prev) => !prev),
  });

  const toggleTheme = () => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  const handleHamBurger = () => {
    setIsOpen(!isOpen);
  };

  const handleLogOut = async () => {
    setLoading(true);
    try {
      const response = await postServerData("customers/logoutToken", {
        refreshToken: refreshToken,
      });

      if (response?.value) {
        if (response.status === 200 || response.status === 201) {
          toast.success(response?.data?.message || "Logged out successfully.");
        } else {
          toast.error(response?.message || "Logout failed.");
        }
      } else {
        toast.error(response?.message || "Logout failed.");
      }
    } catch (err) {
      toast.error("An unexpected error occurred during logout.");
    } finally {
      if (setIsAuthenticated) setIsAuthenticated(false);
      if (setUserDetails) setUserDetails(null);
      localStorage.clear();
      sessionStorage.clear();
      setLoading(false);
      setDataModal(false);
    }
  };

  const userName =
    userDetails?.agentUserName?.toLowerCase()?.trim() ||
    userDetails?.customer?.fullName?.toLowerCase()?.trim() ||
    "User";

  const userId =
    userDetails?.agentNumber || userDetails?.customer?.customerId || "";

  return (
    <>
      {/* Logout Confirmation Modal */}
      {dataModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-dark-bg rounded-xl max-w-sm w-full p-6 shadow-2xl border border-black/10 dark:border-white/10 transition-colors duration-300">
            <h3 className="text-lg font-bold mb-4 text-black dark:text-white">
              Log Out
            </h3>
            <p className="text-sm text-black/70 dark:text-white/70 mb-6">
              Are you sure you want to log out?
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold border border-black/20 dark:border-white/20 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition text-black dark:text-white disabled:opacity-50"
                onClick={() => setDataModal(false)}
                disabled={loading}
              >
                <MdOutlineCancel className="w-4 h-4" />
                Cancel
              </button>
              <button
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50"
                onClick={handleLogOut}
                disabled={loading}
              >
                <MdLogout className="w-4 h-4" />
                {loading ? "Logging out..." : "Log Out"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Search Modal */}
      {searchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-dark-bg rounded-xl max-w-xl w-full p-6 shadow-2xl border border-black/10 dark:border-white/10 transition-colors duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-black dark:text-white">
                Search Menu
              </h3>
              <button
                onClick={() => setSearchModal(false)}
                className="text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white text-sm font-bold p-1 rounded"
              >
                ✕
              </button>
            </div>
            <GlobalSearch
              menu={Menu}
              setSearchModal={setSearchModal}
              searchModal={searchModal}
            />
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="z-50 h-11 flex items-center justify-between px-5 border-b fixed top-0 w-full bg-white dark:bg-dark-bg border-black/10 dark:border-white/10 shadow-sm select-none transition-colors duration-300">
        {/* Left Side */}
        <div className="flex items-center gap-6">
          <button
            id="hamburger-btn"
            className="rounded-lg text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer p-1"
            onClick={handleHamBurger}
            aria-label="Toggle Sidebar"
          >
            <GiHamburgerMenu size={20} />
          </button>

          <div className="flex items-center gap-1.5 font-bold text-sm tracking-tight text-black dark:text-white">
            <img
              src={"../../images/TTMS.png"}
              alt="logos"
              className="h-5 w-auto"
            />
            <span className="text-xs text-gray-500 dark:text-gray-300 font-normal">
              DMS
            </span>
          </div>
        </div>

        {/* Center Title (Desktop & Tablet only) */}
        <div className="hidden md:flex flex-col items-center justify-center leading-none text-center">
          <h4 className="text-sm tracking-wider text-red-600 dark:text-red-400 font-bold">
            DHANLAXMI MULTISTATE
          </h4>
          <h6 className="text-xs text-black/60 dark:text-white/60 font-semibold">
            CO-OP. CREDIT SOCIETY LIMITED
          </h6>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end leading-tight text-xs mr-1">
            <span className="capitalize font-semibold text-black dark:text-white">
              {userName}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              className="p-1.5 text-black/70 dark:text-white/80 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition cursor-pointer"
              onClick={() => setSearchModal(true)}
              title="Search (Alt+K)"
            >
              <IoMdSearch size={24} />
            </button>
            <button
              className="p-1.5 text-black/70 dark:text-white/80 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition cursor-pointer"
              onClick={toggleTheme}
              title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
            >
              {isDark ? <IoMdSunny size={22} /> : <IoMdMoon size={22} />}
            </button>
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-8 h-8 rounded-full overflow-hidden cursor-pointer flex items-center justify-center bg-brand text-white font-semibold text-sm hover:opacity-90 active:scale-95 transition-all focus:outline-none"
            >
              {userName.charAt(0).toUpperCase()}
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-45"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2.5 w-52 bg-white dark:bg-dark-bg border border-black/10 dark:border-white/10 rounded-xl shadow-xl z-50 overflow-hidden animate-fadeIn transition-colors duration-300">
                  <div className="p-4 bg-brand text-white">
                    <p className="capitalize text-xs font-semibold">{userName}</p>
                    {userId && (
                      <p className="text-[10px] text-white/80 mt-0.5">
                        Agent #{userId}
                      </p>
                    )}
                  </div>

                  <div className="p-2 space-y-0.5 flex flex-col">
                    <button
                      className="w-full text-left px-3 py-2 text-xs text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5 rounded transition font-medium"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/changePassword");
                      }}
                    >
                      Change Password
                    </button>
                    {!isCustomer && (
                      <button
                        className="w-full text-left px-3 py-2 text-xs text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5 rounded transition font-medium"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate("/");
                        }}
                      >
                        Agent Dashboard
                      </button>
                    )}
                    <button
                      className="w-full text-left px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded font-semibold transition"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setDataModal(true);
                      }}
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default memo(Header);
