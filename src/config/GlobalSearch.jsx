import { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function GlobalSearch({ menu, setSearchModal, searchModal }) {
  const { isCustomer } = useContext(AuthContext);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [flatMenu, setFlatMenu] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const listRef = useRef(null);

  useEffect(() => {
    const flattenSubmenu = (menu) => {
      return menu
        ?.filter((menuItem) => !isCustomer || menuItem?.onlyCustomer)
        .reduce((acc, item) => {
          if (item.submenu && item.submenu.length > 0) {
            return [...acc, ...item.submenu];
          }
          return acc;
        }, []);
    };

    setFlatMenu(flattenSubmenu(menu));
  }, [menu, isCustomer]);

  useEffect(() => {
    if (searchModal) {
      inputRef.current?.focus();
    }
  }, [searchModal]);

  const handleSelect = (item) => {
    setSearchModal(false);
    navigate(item.url);
  };

  const filteredMenu = flatMenu.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      setSelectedIndex((prevIndex) =>
        prevIndex < filteredMenu.length - 1 ? prevIndex + 1 : prevIndex
      );
    } else if (e.key === "ArrowUp") {
      setSelectedIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : prevIndex
      );
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      handleSelect(filteredMenu[selectedIndex]);
    }
  };

  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      const selectedItem = listRef.current.children[selectedIndex];
      if (selectedItem) {
        selectedItem.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }
  }, [selectedIndex, filteredMenu.length]);

  return (
    <div className="flex flex-col relative">
      <div className="top-full left-0 right-0 mt-2 z-50 bg-white dark:bg-dark-bg border border-black/10 dark:border-white/10 rounded-xl shadow-2xl w-full mx-auto transition-colors duration-300">
        <input
          ref={inputRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full px-4 py-2.5 text-black dark:text-white placeholder-black/40 dark:placeholder-white/40 border-b border-black/10 dark:border-white/10 bg-transparent focus:outline-none text-sm transition-colors"
          placeholder="Search for pages..."
        />
        <div ref={listRef} className="max-h-[300px] overflow-y-auto p-2">
          {filteredMenu.length === 0 ? (
            <div className="py-6 text-center text-sm text-black/50 dark:text-white/50">
              No results found.
            </div>
          ) : (
            filteredMenu.map((item, index) => (
              <div
                key={item.name + (item.url || item.link || index)}
                onClick={() => handleSelect(item)}
                className={`flex items-center px-4 py-2 text-sm rounded-md cursor-pointer text-black dark:text-white transition-colors ${
                  index === selectedIndex
                    ? "bg-black/5 dark:bg-white/10 font-semibold"
                    : "hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                {item.name}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
