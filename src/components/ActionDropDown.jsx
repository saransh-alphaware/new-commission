import { useState, useEffect, useRef } from "react";
import { FaCaretDown as ChevronDown } from "react-icons/fa";
import { getIcon } from "../config/iconHelper";

export default function ActionDropDown({ actions, entityData }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);

  return (
    <>
      <div className="rounded-lg">
        <div className="inline-block text-left" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="inline-flex justify-center items-center w-full px-4 py-[0.5px] text-[12px] font-medium text-gray-700 dark:text-white bg-white dark:bg-dark-bg border border-gray-300 dark:border-white/20 rounded-md hover:bg-gray-50 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand cursor-pointer"
          >
            Action
            <ChevronDown className="w-5 h-5 ml-2 -mr-1" aria-hidden="true" />
          </button>
          <div
            className={`absolute z-50 right-4 w-36 mt-2 origin-top-left opacity-100 bg-white dark:bg-dark-bg rounded-md shadow-lg transition ease-out ring-1 ring-black ring-opacity-5 ${
              isOpen
                ? "scale-100 duration-200"
                : "scale-0 opacity-20 duration-150"
            }`}
          >
            {actions?.map((action) => {
              let IconComponent = getIcon(action?.iconName);
              return (
                <button
                  key={action?.name}
                  className="flex items-center w-full gap-2 px-4 py-1 text-xs border-t border-gray-300 dark:border-white/20 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 cursor-pointer"
                  role="menuitem"
                  onClick={() => {
                    action?.data(entityData);
                    setIsOpen(false);
                  }}
                >
                  {IconComponent && <IconComponent />} {action?.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}


