import { useState, useContext } from "react";
import { FaDownload } from "react-icons/fa";
import { toast } from "sonner";
import {
  getCurrentDate,
  getDateByDifference,
  formatUserDate,
} from "../utils/dateUtil";
import { getServerData } from "../config/apiRequest";
import { useAbortableEffect } from "../hooks/useAbortableEffect";
import { AuthContext } from "../context/AuthContext";
import LoaderSpinner from "../components/LoaderSpinner";
import RangeDateSearch from "../components/RangeDateSearch";
import CommonTable from "../components/CommonTable";

const UpcomingMaturityList = () => {
  const { agentId } = useContext(AuthContext);
  const [searchQueryTrigger, setSearchQueryTrigger] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dowloadLoading, setDowloadLoading] = useState(false);
  const [fromDate, setFromDate] = useState(getCurrentDate());
  const [toDate, setToDate] = useState(getDateByDifference(-30));
  const [bodyData, setBodyData] = useState([]);

  const tableHeading = [
    "Account Number",
    "Customer Name",
    "Product Name",
    "Account Date",
    "Invested Balance",
    "Current Balance",
    "Maturity Date",
    "Maturity Amount",
    "Deposit Account Type",
    "Branch Name",
  ];

  const getUpcomingMaturityList = async (options) => {
    setLoading(true);
    let response = await getServerData(
      "saving-accounts/upcoming-maturity-by-agent",
      {
        fromDate: fromDate,
        toDate: toDate,
        agentId: agentId,
      },
      options,
    );
    if (response?.cancelled) return;
    if (response?.value) {
      if (response?.status === 200 || response?.status === 201) {
        let transactionData = response?.data?.data;
        const renewalData = transactionData?.map((data) => {
          return {
            accountNumber: data?.accountNo || " ",
            customerName: data?.customerName || " ",
            productName: data?.product || " ",
            accountDate: data?.accountDate
              ? formatUserDate(data.accountDate)
              : " ",
            investedBalance: data?.netDeposit || " ",
            currentBalance: data?.tillDate || " ",
            maturityDate: data?.maturityDate
              ? formatUserDate(data.maturityDate)
              : " ",
            maturityAmount: data?.netMaturity || " ",
            depositAccountType:
              String(data?.depositAccountType)?.replace(/_/g, " ") || "",
            branchName: data?.branchName || " ",
          };
        });
        setBodyData(renewalData || []);
      } else {
        setBodyData([]);
        toast.error(response?.message || "Data Fetching Failed");
      }
    } else {
      setBodyData([]);
      toast.error(response?.message || "Data Fetching Failed");
    }
    setLoading(false);
  };

  const downloadUpcomingMaturityReport = async () => {
    setDowloadLoading(true);
    const response = await getServerData(
      "saving-accounts/upcoming-maturity-by-agent",
      {
        fromDate: fromDate,
        toDate: toDate,
        refAgentId: agentId,
      },
    );

    if (response?.value) {
      if (response?.status === 200) {
        const responseData = response?.data?.data;
        const base64Data = responseData?.content;
        const mimeType = responseData?.fileType || "application/octet-stream";
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length)
          .fill()
          .map((_, i) => byteCharacters.charCodeAt(i));
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });
        // Create download link
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `${formatUserDate(fromDate)} - ${formatUserDate(
          toDate,
        )} Upcoming Maturity Report.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
        toast.success(response?.data?.message || "File Downloaded.");
      } else {
        toast.error(response?.message || "Unable To Download File.");
      }
    } else {
      toast.error(response?.message || "Unable To Download File.");
    }
    setDowloadLoading(false);
  };

  useAbortableEffect(
    (signal) => {
      getUpcomingMaturityList({ signal });
    },
    [searchQueryTrigger],
  );

  return (
    <div className="flex flex-col mx-4 text-black dark:text-white">
      <div className="flex flex-col gap-x-1 mt-3 w-full md:flex-row md:items-center lg:flex-row lg:items-center">
        <RangeDateSearch
          fromDate={fromDate}
          setFromDate={setFromDate}
          toDate={toDate}
          setToDate={setToDate}
          getSearchData={() => {
            setSearchQueryTrigger((prev) => prev + 1);
          }}
          toDateValidation={{ min: getCurrentDate() }}
          fromDateValidation={{ min: getCurrentDate() }}
        />
        <div className="flex flex-col mt-2 md:mt-0">
          <label className="text-sm text-transparent select-none">
            {"Search"}
          </label>
          <button
            type="button"
            onClick={() => {
              downloadUpcomingMaturityReport();
            }}
            disabled={dowloadLoading}
            className={`flex items-center justify-center gap-2 w-full sm:w-75 px-4 py-1.5 text-sm font-semibold text-white rounded-lg transition-colors ${
              dowloadLoading
                ? "bg-gray-400 dark:bg-gray-700 cursor-not-allowed"
                : "bg-brand hover:bg-brand/90 cursor-pointer"
            } focus:outline-none`}
          >
            <FaDownload className="hover:text-white" />
            {dowloadLoading ? "Downloading..." : "Upcoming Maturity Report"}
          </button>
        </div>
      </div>
      <div className="mt-4">
        <CommonTable
          headItems={tableHeading}
          bodyData={bodyData}
          isPagination={false}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default UpcomingMaturityList;
