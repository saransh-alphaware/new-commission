import { useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import AllRoutes from "../routes/AllRoutes";

const Layout = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative w-full min-h-screen flex flex-col bg-white dark:bg-dark-bg text-black dark:text-white transition-colors duration-300">
      <Header isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className="relative flex flex-1 w-full pt-11">
        <Sidebar isSidebarOpen={isOpen} setIsSidebarOpen={setIsOpen}/>
        <main className="flex-1 p-4 pb-20 overflow-y-auto scrollbar-none">
          <AllRoutes />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
