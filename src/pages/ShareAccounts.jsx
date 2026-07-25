import { useContext, useState } from "react";
import { GrCurrency } from "react-icons/gr";
import { FaUsers, FaUser, FaRupeeSign } from "react-icons/fa";
import { toast } from "sonner";
import { AuthContext } from "../context/AuthContext";
import { getServerData } from "../config/apiRequest";
import { useAbortableEffect } from "../hooks/useAbortableEffect";
import AccountCard from "../components/AccountCard";
import LoaderSpinner from "../components/LoaderSpinner";
import CommonTable from "../components/CommonTable";

function ShareAcccounts() {
  const [loading, setLoading] = useState(false);
  const { userDetails } = useContext(AuthContext);
  const [shareAccountData, setShareAccountData] = useState([]);
  const [totalAmountPaid, setTotalAmountPaid] = useState(0);
  const customerId = userDetails?.customer?.id;
  const tableHeading = [
    "Account Number",
    "Branch Name",
    "Total Approved Shares",
    "Amount Paid",
    "Unit Price",
    "Approved Date",
    "Activated Date",
    "Customer Id",
    "Product Name",
  ];

  const getShareAccounts = async (options) => {
    setLoading(true);
    let response = await getServerData(
      `share-accounts/customer/${customerId}`,
      null,
      options
    );
    if (response?.cancelled) {
      setLoading(false);
      return;
    }
    if (response?.value) {
      if (response?.status === 200 || response?.status === 201) {
        let savingAccountData = response?.data?.data;
        let CAB = 0;
        setShareAccountData(
          savingAccountData?.map((data) => {
            CAB += data?.amountPaid;
            return {
              accountNumber: data?.accountNo,
              branchName: data?.branchName,
              totalApprovedShares: data?.totalApprovedShares,
              amountPaid: data?.amountPaid,
              unitPrice: data?.unitPrice,
              approvedDate: data?.approvedDate,
              activatedDate: data?.activatedDate,
              customerId: data?.customerId,
              productName: data?.productName,
            };
          }) || []
        );
        setTotalAmountPaid(CAB?.toFixed(2) || 0);
      } else {
        setShareAccountData([]);
        toast.error(`${response?.message || ""} || Data Fetching Failed`);
      }
    } else {
      setShareAccountData([]);
      toast.error(`${response?.message || ""} || Data Fetching Failed`);
    }
    setLoading(false);
  };

  useAbortableEffect((signal) => {
    getShareAccounts({ signal });
  }, []);

  return (
    <div className="flex flex-col mx-4 text-black dark:text-white">
      <div className="flex flex-col justify-evenly mt-4 md:flex-row lg:flex-row gap-4">
        <AccountCard
          name={userDetails?.customer?.firstName?.toLowerCase()?.trim() || "-"}
          desc={"CRN Name"}
          icon={<FaUser size={20} className="text-white" />}
        />
        <AccountCard
          name={totalAmountPaid}
          desc={"Total Amount Paid"}
          icon={<FaRupeeSign size={20} className="text-white" />}
        />
        <AccountCard
          name={"INR"}
          desc={"Currency"}
          icon={<GrCurrency size={20} className="text-white" />}
        />
        <AccountCard
          name={shareAccountData?.length || 0}
          desc={"Number of Accounts"}
          icon={<FaUsers size={20} className="text-white" />}
        />
      </div>
      {loading ? (
        <div className="mt-6">
          <LoaderSpinner />
        </div>
      ) : (
        <div className="mt-6">
          <CommonTable headItems={tableHeading} bodyData={shareAccountData} loading={loading} />
        </div>
      )}
    </div>
  );
}

export default ShareAcccounts;

