import { useState, useRef, useEffect } from "react";
import { getIcon } from "../config/iconHelper";
import sideBarIcons from "../config/sidebarIcons.json";
import { FiChevronDown } from "react-icons/fi";
import { IoMdArrowDropright } from "react-icons/io";
import { Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const auth = useContext(AuthContext) || {};
  const isCustomer = auth.isCustomer ?? false;
  const userDetails = auth.userDetails || { agentNumber: "123", agentUserName: "Saransh Sharma" };
  
  const [showMenu, setShowMenu] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const sidebarRef = useRef(null);
  const location = useLocation();
  const currentPath = location.pathname;

  // Auto-expand menu containing active submenu route on page mount/route change
  useEffect(() => {
    const activeMenuIndex = sideBarIcons.findIndex(
      (menu) => menu.hasSubmenu && menu.submenu?.some((sub) => sub.url === currentPath)
    );
    if (activeMenuIndex !== -1) {
      setShowMenu(activeMenuIndex);
    }
  }, [currentPath]);

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [isSidebarOpen]);

  const handleOutsideClick = (event) => {
    if (
      window.innerWidth <= 768 &&
      sidebarRef.current &&
      !sidebarRef.current.contains(event.target) &&
      !event.target.closest("#hamburger-btn")
    ) {
      setIsSidebarOpen(false);
    }
  };

  useEffect(() => {
    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isSidebarOpen]);

  const isMenuRouteActive = (menu) => {
    if (menu.hasSubmenu) {
      return menu.submenu?.some((sub) => currentPath === sub.url);
    }
    return currentPath === menu.link;
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        ref={sidebarRef}
        className={`fixed top-11 bottom-9 left-0 z-40 bg-white dark:bg-dark-bg border-r border-black/10 dark:border-white/10 transition-all duration-300 ease-in-out md:sticky md:top-11 md:bottom-10 md:h-[calc(100vh-5rem)] flex flex-col
          ${isSidebarOpen 
            ? "translate-x-0 w-60 overflow-y-auto overflow-x-hidden" 
            : "-translate-x-full md:translate-x-0 w-[60px] overflow-hidden md:overflow-visible"
          }
        `}
      >
        <ul className={`flex flex-col gap-1 p-2 h-full scrollbar-none select-none ${isSidebarOpen ? "overflow-y-auto overflow-x-hidden" : "overflow-hidden md:overflow-visible"}`}>
          {sideBarIcons
            ?.filter((menu) => {
              if (isCustomer && !menu?.onlyCustomer) return false;
              if (menu?.onlyAgent?.length) {
                return menu.onlyAgent.includes(userDetails?.agentNumber);
              }
              return true;
            })
            .map((menu, i) => {
              const MenuIcon = getIcon(menu.icon);
              const hasSubmenu = menu?.hasSubmenu;
              const isMenuExpanded = showMenu === i;
              const isActive = isMenuRouteActive(menu);

              return (
                <li
                  className="relative group flex flex-col"
                  key={menu.name}
                >
                  {/* Main Link/Button */}
                  <div
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200
                      ${isActive 
                        ? "bg-brand/10 dark:bg-brand/20 text-brand dark:text-cyan-400 font-semibold" 
                        : "text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5 hover:text-brand dark:hover:text-cyan-300"
                      }
                    `}
                    onClick={() => {
                      if (hasSubmenu) {
                        setShowMenu(isMenuExpanded ? null : i);
                      }
                    }}
                  >
                    <Link 
                      to={hasSubmenu ? "#" : menu?.link}
                      className="flex items-center gap-3 w-full"
                    >
                      <MenuIcon className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${!isSidebarOpen && "group-hover:scale-110"}`} />
                      <span className={`text-sm transition-opacity duration-300 whitespace-nowrap ${!isSidebarOpen && "md:opacity-0 md:w-0 md:hidden"}`}>
                        {menu?.name}
                      </span>
                    </Link>

                    {hasSubmenu && isSidebarOpen && (
                      <FiChevronDown 
                        className={`w-4 h-4 transition-transform duration-200 ${isMenuExpanded ? "rotate-180" : ""}`} 
                      />
                    )}
                  </div>

                  {/* Submenu rendering */}
                  {hasSubmenu && (
                    <>
                      {/* Sidebar Open: Accordion Style */}
                      {isSidebarOpen ? (
                        <div 
                          className={`transition-all border-white dark:border-dark-bg duration-300 overflow-hidden ${
                            isMenuExpanded ? "max-h-[500px] opacity-100 mt-1 pl-4" : "max-h-0 opacity-0 pointer-events-none"
                          }`}
                        >
                          <ul className="border-l border-black/10 dark:border-white/10 space-y-1 py-1">
                            {menu?.submenu
                              ?.filter((submenu) => {
                                if (submenu?.onlyAgent?.length) {
                                  return submenu.onlyAgent.includes(userDetails?.agentNumber);
                                }
                                return true;
                              })
                              ?.map((submenu) => {
                                const isSubActive = currentPath === submenu.url;
                                return (
                                  <li key={submenu.name}>
                                    <Link
                                      to={submenu.url}
                                      className={`flex items-center gap-1.5 py-1.5 px-3 rounded text-xs transition-all
                                        ${isSubActive
                                          ? "text-brand dark:text-cyan-400 font-bold bg-brand/5 dark:bg-brand/10"
                                          : "text-black/50 dark:text-white/50 hover:text-brand dark:hover:text-cyan-300 hover:bg-black/5 dark:hover:bg-white/5"
                                        }
                                      `}
                                    >
                                      <IoMdArrowDropright className="w-3.5 h-3.5" />
                                      <span>{submenu.name}</span>
                                    </Link>
                                  </li>
                                );
                              })}
                          </ul>
                        </div>
                      ) : (
                        /* Sidebar Closed: Hover Popup Dropdown */
                        <div 
                          className={`absolute left-full top-0 ml-3 py-2 w-52 bg-white dark:bg-dark-bg border border-black/10 dark:border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 pointer-events-none group-hover:pointer-events-auto
                            ${isTransitioning ? "!hidden" : ""}
                          `}
                        >
                          <div className="px-4 py-2 border-b border-black/5 dark:border-white/10 text-sm font-semibold">
                            <span className="text-blue-600 dark:text-blue-400  cursor-pointer hover:opacity-80">
                              {menu?.name}
                            </span>
                          </div>
                          <ul className="p-1 space-y-0.5">
                            {menu?.submenu
                              ?.filter((submenu) => {
                                if (submenu?.onlyAgent?.length) {
                                  return submenu.onlyAgent.includes(userDetails?.agentNumber);
                                }
                                return true;
                              })
                              ?.map((submenu) => {
                                const isSubActive = currentPath === submenu.url;
                                return (
                                  <li key={submenu.name}>
                                    <Link
                                      to={submenu.url}
                                      className={`flex items-center gap-1.5 py-1.5 px-3 rounded text-xs transition-all
                                        ${isSubActive
                                          ? "text-brand dark:text-cyan-400 font-bold bg-brand/5 dark:bg-brand/10"
                                          : "text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5 hover:text-brand dark:hover:text-cyan-300"
                                        }
                                      `}
                                    >
                                      <IoMdArrowDropright className="w-3.5 h-3.5 flex-shrink-0 text-black/40 dark:text-white/40" />
                                      <span className="truncate">{submenu.name}</span>
                                    </Link>
                                  </li>
                                );
                              })}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </li>
              );
            })}
        </ul>
      </aside>
    </>
  );
};

export default Sidebar;
