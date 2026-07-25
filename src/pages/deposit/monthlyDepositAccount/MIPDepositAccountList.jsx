import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoIosAddCircleOutline } from "react-icons/io";
import { FaFilter } from "react-icons/fa";
import CheckerMakerTab from "../../../components/CheckerMakerTab";

const MIPDepositAccountList = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [accountTab, setAccountTab] = useState(0);
  const approveAction = [
    {
      iconName: "FaEye",
      name: "Account Details",
      data: (data) => {
        navigate("/mip-deposit-account/view", {
          state: {
            endpoint: `saving-accounts/particular/mipAccount/${data?.id}`,
          },
        });
      },
    },
  ];
  return (
    <div className="flex flex-col mx-4 text-black dark:text-white">
      <div className="mt-3 flex w-full space-y-2 flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col">
          {accountTab === 0 && (
            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors cursor-pointer focus:outline-none ${
                open
                  ? "bg-brand text-white hover:bg-brand/90"
                  : "bg-white dark:bg-white/5 text-black dark:text-white border border-black/20 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10"
              }`}
            >
              <FaFilter
                className={`transition-colors ${
                  open ? "text-white" : "text-black dark:text-white"
                }`}
              />
            </button>
          )}
        </div>
        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => navigate("/mip-deposit-account/create")}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white bg-brand hover:bg-brand/90 transition-colors sm:w-[350px] cursor-pointer focus:outline-none"
          >
            <IoIosAddCircleOutline className="hover:text-white text-lg" />
            Create New MIP Deposit Account
          </button>
        </div>
      </div>
      <CheckerMakerTab
        accountType="MIP_ACCOUNT"
        eventType="BRANCH_MIP_ACCOUNT"
        approveAction={approveAction}
        open={open}
        setOpen={setOpen}
        setAccountTab={setAccountTab}
      />
    </div>
  );
};

export default MIPDepositAccountList;

