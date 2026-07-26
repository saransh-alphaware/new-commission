import { useState, useEffect, useContext } from "react";
import { formatUserDate } from "../utils/dateUtil";
import { getServerData, putServerData } from "../config/apiRequest";
import { useAbortableEffect } from "../hooks/useAbortableEffect";
import { AuthContext } from "../context/AuthContext";
import LoaderSpinner from "../components/LoaderSpinner";
import ModalMain from "../components/ModalMain";
import { toast } from "sonner";
import CommonTable from "./CommonTable";
import Tabs from "./Tabs";
import TableFilters from "./DepositForm/TableFilters";
import { cleanAndFormatInput } from "../utils/formatInput";

const CheckerMakerTab = ({
  accountType,
  eventType,
  approveAction,
  open,
  setOpen,
  setAccountTab,
}) => {
  const { userDetails } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);
  const [activeTab, setActiveTab] = useState(0);
  const [bodyData, setBodyData] = useState([]);
  const [rejectReason, setRejectReason] = useState("");
  const [dataModal, setDataModal] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [rejectDataId, setRejectDataId] = useState(null);
  const [filters, setFilters] = useState({
    customerName: "",
    productName: "",
    accountNumber: "",
    customerId: "",
    accountDate: "",
  });
  const [filteredData, setFilteredData] = useState(null);

  const approvedTableHeading = [
    "Account Number",
    "Customer Id",
    "Customer Name",
    "Account Date",
    "Product Name",
    "Invested Balance",
    "Interest",
    "Term",
  ];

  const pendingRejetedTableHeading = [
    "Customer Id",
    "Customer Name",
    "Product Name",
    "Invested Balance",
    "Interest",
    "Term",
    "Branch Name",
  ];

  const pendingAction = [
    {
      iconName: "FaBan",
      name: "Reject",
      data: (data) => {
        setRejectReason("");
        setRejectDataId(data?.id);
        setDataModal(true);
      },
    },
  ];

  const rejectAction = [
    {
      iconName: "FaEye",
      name: "Reject Reason",
      data: (data) => {
        setDataModal(true);
        setRejectDataId(null);
        setRejectReason(data?.approverComment);
      },
    },
  ];

  const tabs = [
    {
      label: "Approved",
      content: (
        <CommonTable
          headItems={approvedTableHeading}
          bodyData={filteredData ? filteredData : bodyData}
          isPagination={true}
          totalPages={totalPages}
          limit={pageLimit}
          setPageLimit={setPageLimit}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          actions={approveAction}
          loading={loading}
        />
      ),
    },
    {
      label: "Pending",
      content: (
        <CommonTable
          headItems={pendingRejetedTableHeading}
          bodyData={bodyData}
          isPagination={true}
          totalPages={totalPages}
          limit={pageLimit}
          setPageLimit={setPageLimit}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          actions={pendingAction}
          loading={loading}
        />
      ),
    },
    {
      label: "Rejected",
      content: (
        <CommonTable
          headItems={pendingRejetedTableHeading}
          bodyData={bodyData}
          isPagination={true}
          totalPages={totalPages}
          limit={pageLimit}
          setPageLimit={setPageLimit}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          actions={rejectAction}
          loading={loading}
        />
      ),
    },
  ];

  const getApprovedData = async (accountType, currentPage, pageLimit, options) => {
    setLoading(true);
    let response = await getServerData(
      `agents/get-deposit-accounts`,
      {
        depositType: accountType,
        pageNumber: currentPage,
        pageSize: pageLimit,
      },
      options
    );
    if (response?.cancelled) return;
    if (response?.value) {
      if (response?.status === 200 || response?.status === 201) {
        let transactionData = response?.data?.data;
        let totalCount = response?.data?.totalcount;
        let totalPagesCount = Math.ceil(totalCount / pageLimit).toFixed(0);
        setTotalPages(totalPagesCount);
        const approvedData = transactionData?.map((data) => {
          return {
            accountNumber: data?.accountNumber || " ",
            customerId: data?.customerId || " ",
            customerName: data?.customerName || " ",
            accountDate: data?.accountDate
              ? formatUserDate(data?.accountDate)
              : " ",
            productName: data?.productName || " ",
            investedBalance: data?.productName || " ",
            interest: data?.interest || " ",
            term: data?.term || " ",
            id: data?.id,
          };
        });
        setBodyData(approvedData || []);
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

  const getPendingRejectedData = async (
    eventType,
    endpoint,
    currentPage,
    pageLimit,
    options
  ) => {
    setLoading(true);
    let response = await getServerData(
      `workers/${endpoint}`,
      {
        eventType: eventType,
        pageNumber: currentPage,
        pageSize: pageLimit,
      },
      options
    );
    if (response?.cancelled) return;
    if (response?.value) {
      if (response?.status === 200 || response?.status === 201) {
        let transactionData = response?.data?.data;
        let totalCount = response?.data?.totalcount;
        let totalPagesCount = Math.ceil(totalCount / pageLimit).toFixed(0);
        setTotalPages(totalPagesCount);
        const workerData = transactionData?.map((data) => {
          const requestData = JSON.parse(data.requestData);

          return {
            customerId: requestData?.customer?.customerId || "-",
            customerName: requestData?.customer?.customerName || "-",
            productName:
              requestData?.fixDepositProduct?.name ||
              requestData?.recurringDepositProduct?.name ||
              requestData?.dailyDepositSchemeProduct?.name ||
              requestData?.monthlyIncomeProduct?.name || "-",
            investedBalance: requestData?.investedBalance || "-",
            interest:
              requestData?.fixDepositProduct?.interest ||
              requestData?.recurringDepositProduct?.interest ||
              requestData?.dailyDepositSchemeProduct?.interest ||
              requestData?.monthlyIncomeProduct?.interest || "-",
            term: requestData?.term || "-",
            branchName: data?.officeName || " ",
            approverComment: data?.approverComment || " ",
            id: data?.id,
          };
        });
        setBodyData(workerData || []);
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

  async function rejectRecord() {
    if (rejectReason.trim().length === 0) {
      toast.warning("REJECT REASON CANNOT BE EMPTY");
      return;
    }
    setRejectLoading(true);
    let response = await putServerData(
      `workers/pendingRequest/${rejectDataId}`,
      {
        eventStatus: "REJECT",
        approverComment: `REJECTED BY AGENT : ${userDetails?.agentUserName}(${userDetails?.agentNumber}), REASON : ${rejectReason}`,
        eventType: eventType,
      }
    );
    if (response?.value) {
      if (response?.status === 200 || response?.status === 201) {
        toast.success("Record Rejected Successfully");
        setDataModal(false);
        setRejectReason("");
        setRejectDataId(null);
        getPendingRejectedData(
          eventType,
          "getPendingRecords",
          currentPage,
          pageLimit
        );
      } else {
        toast.error(response?.message || "Action Failed");
      }
    } else {
      toast.error(response?.message || "Action Failed");
    }
    setRejectLoading(false);
  }

  const hasActiveFilters = Object.values(filters).some((value) => value !== "");

  useEffect(() => {
    setFilters({
      customerName: "",
      productName: "",
      accountNumber: "",
      customerId: "",
      accountDate: "",
    });

    setFilteredData(null);
    setCurrentPage(0);
    setPageLimit(10);
  }, [activeTab]);

  useAbortableEffect(
    (signal) => {
      if (activeTab === 0) {
        if (!hasActiveFilters) {
          setFilteredData(null);
          getApprovedData(accountType, currentPage, pageLimit, { signal });
        }
        setAccountTab(0);
      }

      if (activeTab === 1) {
        setOpen(false);
        getPendingRejectedData(
          eventType,
          "getPendingRecords",
          currentPage,
          pageLimit,
          { signal }
        );
        setAccountTab(1);
      }

      if (activeTab === 2) {
        setOpen(false);
        getPendingRejectedData(
          eventType,
          "getRejectedRecords",
          currentPage,
          pageLimit,
          { signal }
        );
        setAccountTab(2);
      }
    },
    [activeTab, currentPage, pageLimit, hasActiveFilters]
  );

  useEffect(() => {
    setCurrentPage(0);
    setPageLimit(10);
  }, [filters]);

  return (
    <div className="mt-4 text-black dark:text-white">
      {dataModal && (
        <ModalMain
          isOpen={dataModal}
          content={
            <div className="max-w-full">
              <h2 className="text-lg font-bold text-black dark:text-white text-center mb-2">
                {activeTab === 1
                  ? "ARE YOU SURE YOU WANT TO REJECT ?"
                  : "REJECT REASON"}
              </h2>
              <textarea
                className="h-[20vh] w-full p-3 border border-black/20 dark:border-white/20 rounded-lg shadow-sm bg-white dark:bg-white/5 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="Enter Reject Reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value.toUpperCase())}
                onBlur={(e) =>
                  setRejectReason(cleanAndFormatInput(e.target.value))
                }
                readOnly={activeTab === 2}
                disabled={activeTab === 2}
                maxLength={75}
                minLength={1}
                required
              ></textarea>
              {activeTab === 1 && (
                <div className="flex flex-col space-y-4 mt-2">
                  <div className="flex space-x-4 items-center justify-center">
                    {rejectLoading && <LoaderSpinner />}
                    <button
                      onClick={rejectRecord}
                      className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors focus:outline-none ${
                        rejectLoading
                          ? "bg-gray-400 dark:bg-gray-700 cursor-not-allowed"
                          : "bg-brand hover:bg-brand/90 cursor-pointer"
                      }`}
                      disabled={rejectLoading}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => {
                        setDataModal(false);
                      }}
                      className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors focus:outline-none ${
                        rejectLoading
                          ? "bg-gray-400 dark:bg-gray-700 cursor-not-allowed"
                          : "bg-rose-600 hover:bg-rose-700 cursor-pointer"
                      }`}
                      disabled={rejectLoading}
                    >
                      No
                    </button>
                  </div>
                </div>
              )}
            </div>
          }
          setIsOpen={setDataModal}
          title={activeTab === 1 ? "Reject Record" : "Reject Reason"}
        />
      )}
      {activeTab === 0 && open && (
        <TableFilters
          setFilteredData={setFilteredData}
          depositType={accountType}
          setTotalPages={setTotalPages}
          currentPage={currentPage}
          pageLimit={pageLimit}
          filters={filters}
          setFilters={setFilters}
          loading={loading}
          setLoading={setLoading}
        />
      )}
      <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default CheckerMakerTab;

