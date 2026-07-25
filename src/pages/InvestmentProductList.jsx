import { useContext, useState } from "react";
import { toast } from "sonner";
import { AuthContext } from "../context/AuthContext";
import LoaderSpinner from "../components/LoaderSpinner";
import { getServerData } from "../config/apiRequest";
import { useAbortableEffect } from "../hooks/useAbortableEffect";
import { convertDateFormat } from "../utils/dateUtil";
import CommonTable from "../components/CommonTable";

function InvestmentProductList() {
  const [loading, setLoading] = useState(false);
  const { agentId } = useContext(AuthContext);
  const [customerData, setCustomerData] = useState([]);

  const tableHeading = [
    "Customer Id",
    "Account Number",
    "Account Date",
    "Customer Name",
    "Deposit Account Type",
    "Balance",
  ];

  const getCustomersAccounts = async (options) => {
    setLoading(true);
    let response = await getServerData(
      `customers/by-agent/${agentId}`,
      null,
      options,
    );
    if (response?.cancelled) return;
    if (response?.value) {
      if (response?.status === 200 || response?.status === 201) {
        const responseData = response?.data?.data;
        setCustomerData(
          responseData?.map((data) => ({
            customerId: data?.customerId,
            accountNumber: data?.accountNumber,
            accountDate: data?.accountDate
              ? convertDateFormat(data?.accountDate)
              : "-",
            customerName: data?.customerName,
            depositAccountType: data?.depositAccountType,
            balance: data?.balance,
          })) || [],
        );
      } else {
        toast.error(`${response?.message || ""} || Data Fetching Failed`);
        setCustomerData([]);
      }
    } else {
      setCustomerData([]);
      toast.error(`${response?.message || ""} || Data Fetching Failed`);
    }
    setLoading(false);
  };

  useAbortableEffect((signal) => {
    getCustomersAccounts({ signal });
  }, []);

  return (
    <div className="flex flex-col mx-4 bg-white dark:bg-dark-bg text-black dark:text-white relative min-h-75">
      {loading ? (
        <LoaderSpinner />
      ) : (
        <div className="mt-4">
          <CommonTable
            headItems={tableHeading}
            bodyData={customerData}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
}

export default InvestmentProductList;
