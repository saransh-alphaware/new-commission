import { useEffect } from "react";

const Tabs = ({ tabs, activeTab, setActiveTab, endpoint, mode }) => {
  let tabSwitch = sessionStorage.getItem("tabSwitch");
  const handleClick = (index) => {
    setActiveTab(index);
  };

  useEffect(() => {
    if (tabs?.length === 1) {
      setActiveTab(0);
    } else if (tabSwitch) {
      setActiveTab(Number(tabSwitch));
    }
  }, [tabSwitch, tabs?.length, setActiveTab]);

  return (
    <div className="mt-1 bg-white dark:bg-dark-bg text-black dark:text-white">
      <ul className="p-0 flex flex-col w-full justify-around bg-white dark:bg-dark-bg list-none md:flex-row lg:flex-row gap-1">
        {tabs?.map((tab, index) => (
          <li
            key={tab?.label || index}
            className={
              index === activeTab
                ? "bg-brand border border-black/10 dark:border-white/10 rounded-lg text-white text-center cursor-pointer md:w-1/3 lg:w-1/3 py-1.5 font-semibold transition-colors"
                : "text-center cursor-pointer md:w-1/3 lg:w-1/3 text-black dark:text-white py-1.5 font-medium hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
            }
            onClick={() => handleClick(index)}
          >
            {tab?.label}
          </li>
        ))}
      </ul>
      <div className="p-2 text-black dark:text-white">
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
};

export default Tabs;

