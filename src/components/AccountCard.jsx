import { BsThreeDots } from "react-icons/bs";

const AccountCard = ({ name, desc, icon }) => {
  return (
    <div className="flex flex-col bg-white dark:bg-dark-bg md:w-1/5 lg:w-1/5">
      <div className="flex flex-row border border-black/10 dark:border-white/10 rounded-xl bg-brand justify-between py-2 px-4 items-center shadow-sm">
        {icon}
        <BsThreeDots size={20} className="text-white" />
      </div>
      <p className="text-2xl mx-3 font-extrabold capitalize text-black dark:text-white mt-2">
        {name}
      </p>
      <p className="text-lg mx-3 text-[#9B9ABA] dark:text-white/60 mt-8">{desc}</p>
    </div>
  );
};

export default AccountCard;

