import { useState, useEffect, useContext, useRef } from "react";
import { toast } from "sonner";
import {
  getCurrentDate,
  getDateByDifference,
  formatUserDate,
} from "../utils/dateUtil";
import { useAbortableEffect } from "../hooks/useAbortableEffect";
import { getServerData } from "../config/apiRequest";
import { AuthContext } from "../context/AuthContext";
import RangeDateSearch from "../components/RangeDateSearch";
import CommonTable from "../components/CommonTable";
import Tabs from "../components/Tabs";

const RenewalPendingList = () => {
  const { agentId } = useContext(AuthContext);
  const [searchQueryTrigger, setSearchQueryTrigger] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState(getDateByDifference(30));
  const [toDate, setToDate] = useState(getCurrentDate());
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);
  const [activeTab, setActiveTab] = useState(0);
  const [bodyData, setBodyData] = useState([]);

  const tableHeading = [
    "Customer Id",
    "Customer Name",
    "Branch Name",
    "Account Number",
    "Product Name",
    "Account Date",
    "Pending Term",
    "Premium Amount",
    "Late Fees",
    "Total Renewal Amount",
    "Next EMI Date",
    "Maturity Date",
  ];

  const tabs = [
    {
      label: "RD ACCOUNTS",
      content: (
        <CommonTable
          headItems={tableHeading}
          bodyData={bodyData}
          isPagination={true}
          totalPages={totalPages}
          limit={pageLimit}
          setPageLimit={setPageLimit}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          loading={loading}
        />
      ),
    },
    {
      label: "DDS ACCOUNTS",
      content: (
        <CommonTable
          headItems={tableHeading}
          bodyData={bodyData}
          isPagination={true}
          totalPages={totalPages}
          limit={pageLimit}
          setPageLimit={setPageLimit}
          currentPage={currentPage}
          loading={loading}
          setCurrentPage={setCurrentPage}
        />
      ),
    },
  ];

  const getRenewalData = async (
    accountType,
    currentPage,
    pageLimit,
    options,
  ) => {
    setLoading(true);
    let response = await getServerData(
      `agents/${agentId}/pendingRdDdsRenewals`,
      {
        sortBy: "customer_id",
        depositAccountType: accountType,
        fromDate: fromDate,
        toDate: toDate,
        pageNumber: currentPage,
        pageSize: pageLimit,
      },
      options,
    );
    if (response?.cancelled) return;
    if (response?.value) {
      if (response?.status === 200 || response?.status === 201) {
        let transactionData = response?.data?.data;
        let totalCount = response?.data?.totalcount;
        let totalPagesCount = Math.ceil(totalCount / pageLimit).toFixed(0);
        setTotalPages(totalPagesCount);
        const renewalData = transactionData?.map((data) => {
          const renewalAmount = Number(data?.renewalAmount || 0);
          const totalLateFee = Number(data?.totalLateFee || 0);

          const premiumAmount = renewalAmount === 0 ? "-" : renewalAmount;
          const lateFees = totalLateFee === 0 ? "-" : totalLateFee;

          const totalAmount = renewalAmount + totalLateFee;
          const totalRenewalAmount = totalAmount === 0 ? "-" : totalAmount;

          return {
            customerId: data?.customerId || " ",
            customerName: data?.customerName || " ",
            branchName: data?.branchName || " ",
            accountNumber: data?.accountNumber || " ",
            productName: data?.productName || " ",
            accountDate: data?.accountDate
              ? formatUserDate(data.accountDate)
              : " ",
            pendingTerm: data?.currentTerm === 0 ? "-" : data?.currentTerm,
            premiumAmount,
            lateFees,
            totalRenewalAmount,
            nextEmiDate: data?.nextEmiDate
              ? formatUserDate(data.nextEmiDate)
              : " ",
            maturityDate: data?.maturityDate
              ? formatUserDate(data.maturityDate)
              : " ",
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

  const hasInitializedRef = useRef(false);
  useEffect(() => {
    setCurrentPage(0);
    setPageLimit(10);
  }, [activeTab]);

  useAbortableEffect(
    (signal) => {
      if (!hasInitializedRef.current) {
        hasInitializedRef.current = true;
        return;
      }
      const accountType =
        activeTab === 1 ? "DDS_ACCOUNT" : "RECURRING_DEPOSIT_ACCOUNT";
      getRenewalData(accountType, currentPage, pageLimit, { signal });
    },
    [activeTab, currentPage, pageLimit, searchQueryTrigger],
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
            setCurrentPage(0);
            setSearchQueryTrigger((prev) => prev + 1);
          }}
        />
      </div>
      <div className="mt-4">
        <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
};

export default RenewalPendingList;
