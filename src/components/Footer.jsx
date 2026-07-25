import { useState, useEffect } from "react";
import { IoIosArrowUp } from "react-icons/io";

const Footer = () => {
  const [showButton, setShowButton] = useState(false);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handleScrollButtonVisiblity = () => {
      window.scrollY >= 100 ? setShowButton(true) : setShowButton(false);
    };
    window.addEventListener("scroll", handleScrollButtonVisiblity);
    return () => {
      window.removeEventListener("scroll", handleScrollButtonVisiblity);
    };
  }, []);

  return (
    <>
      {showButton && (
        <div className="fixed bottom-14 right-7 z-50">
          <button
            className="p-3 rounded-full bg-brand hover:opacity-90 transition-opacity cursor-pointer focus:outline-none shadow-lg text-white flex items-center justify-center"
            onClick={handleScrollToTop}
          >
            <IoIosArrowUp className="text-xl" />
          </button>
        </div>
      )}
      <div className="bg-brand dark:bg-dark-bg text-white py-2 w-full text-center z-50 fixed bottom-0 border-t border-white/10">
        <h6 className="text-white/80 dark:text-white/80 text-xs md:text-sm">@2025 Designed By Alphaware</h6>
      </div>
    </>
  );
};

export default Footer;
