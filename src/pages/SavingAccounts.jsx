import { GrCurrency } from "react-icons/gr";
import { FaUsers, FaUser, FaRupeeSign, FaDownload } from "react-icons/fa";
import { useContext, useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { useReactToPrint } from "react-to-print";
import { AuthContext } from "../context/AuthContext";
import {
  formatUserDate,
  getCurrentDate,
  getDateByDifference,
} from "../utils/dateUtil";
import { getServerData, postServerData } from "../config/apiRequest";
import { useAbortableEffect } from "../hooks/useAbortableEffect";
import ModalMain from "../components/ModalMain";
import AccountCard from "../components/AccountCard";
import LoaderSpinner from "../components/LoaderSpinner";
import CommonTable from "../components/CommonTable";
import RangeDateSearch from "../components/RangeDateSearch";
import { encryptId } from "../utils/cryptoHelper";

const SavingAcccounts = () => {
  const { userDetails, isCustomer, setUserDetails, agentId } =
    useContext(AuthContext);
  const [bodyData, setBodyData] = useState([]);
  const [activeTwoTab, setActiveTwoTab] = useState("Descending");
  const [loading, setLoading] = useState(false);
  const [customerId, setCustomerId] = useState(userDetails?.customer?.id);
  const [combinedAvilableBalance, setCombinedAvilableBalance] = useState(0);
  const [dataModal, setDataModal] = useState(false);
  const [statementData, setStatementData] = useState([]);
  const [fromDate, setFromDate] = useState(getDateByDifference(31));
  const [toDate, setToDate] = useState(getCurrentDate());
  const [accountDatabaseId, setaccountDatabaseId] = useState();
  const [statementType, setStatementType] = useState("Mini Statement");
  const [isDownloading, setIsDownloading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);
  const componentRef = useRef();

  const tableHeading = [
    "Account Number",
    "Branch Name",
    "Account Date",
    "Balance",
    "Account Type",
  ];
  const statementTableHeading = [
    "Account Number",
    "Date",
    "Particulars",
    "Debit",
    "Credit",
    "Payment Mode",
    "Balance",
  ];

  const handlePrint = useReactToPrint({
    content: () => {
      const tableRef = componentRef.current.cloneNode(true);
      const lastRow = tableRef.querySelector("tr.printRow");
      if (lastRow) {
        lastRow.remove();
      }
      const tempDiv = document.createElement("div");
      const myHTML = `
        <div style="display: flex; align-items: center; justify-content: center; flex-direction: column; margin: 0; padding: 0;">
          <h4 style="font-weight: 500; color: red;">DHANLAXMI MULTISTATE</h4>
          <h6 style="font-size: 0.875rem; font-weight: 400;">CO-OP. CREDIT SOCIETY LIMITED</h6> 
          <h5 style="font-size: 1rem margin-top: 10px; font-weight: 700; color: black;">${statementType}</h5>                   
        </div> 
        <div style="margin-left : 20px">
          <div>Customer Name: <span style="text-transform: capitalize;">${
            userDetails?.agentUserName?.toLowerCase()?.trim() ||
            userDetails?.customer?.fullName?.toLowerCase()?.trim() ||
            ""
          } </span> </div>
          ${
            statementType === "Statement"
              ? `<div>From Date: ${formatUserDate(
                  fromDate,
                  "/"
                )} To Date: ${formatUserDate(toDate, "/")}</div>`
              : ``
          }
        </div>
      `;
      tempDiv.innerHTML = myHTML;
      tempDiv.appendChild(tableRef);
      return tempDiv;
    },
  });

  const actions = [
    {
      iconName: "MdLibraryBooks",
      name: "Mini Statement",
      data: (data) => {
        setDataModal(true);
        getStatements(fromDate, toDate, data.id, false);
        setCurrentPage(0);
        setPageLimit(10);
        setaccountDatabaseId(data.id);
        setStatementType("Mini Statement");
      },
    },
    {
      iconName: "MdLibraryBooks",
      name: "Statement",
      data: (data) => {
        setDataModal(true);
        getStatements(fromDate, toDate, data.id, true);
        setaccountDatabaseId(data.id);
        setStatementType("Statement");
      },
    },
  ];

  const getCustomerDeatils = async (customerId) => {
    setLoading(true);
    let response = await getServerData(
      `customers/search-by-customerId/${customerId}`,
      { pageNumber: 0, pageSize: 10 }
    );
    if (response?.value) {
      if (response?.status === 200 || response?.status === 201) {
        let customerData = response?.data?.data;
        if (customerData?.length === 1) {
          let userData = {
            customer: {
              id: customerData?.[0]?.id ?? "",
              mobileNumber: customerData?.[0]?.mobileNumber ?? "",
              email: customerData?.[0]?.email ?? "",
              firstName: customerData?.[0]?.firstName ?? "",
              gender: customerData?.[0]?.gender ?? "",
              fullName: customerData?.[0]?.customerName,
              customerId: customerData?.[0]?.customerId,
            },
          };
          setCustomerId(userData?.customer?.id);
          const constUserDataStringified = JSON.stringify(userData);
          const encryptedAgentDetails = encryptId(constUserDataStringified);
          sessionStorage.setItem("agentDetails", encryptedAgentDetails);
          setUserDetails(userData);
        }
      }
    }
  };

  const getAgentAccounts = async (accountType, options) => {
    setLoading(true);
    let response = await getServerData(
      "saving-accounts/depositType",
      {
        depositAccountType: accountType,
        customerId: customerId,
      },
      options
    );
    if (response?.cancelled) return;
    if (response?.value) {
      if (response?.status === 200 || response?.status === 201) {
        let savingAccountData = response?.data?.data;
        let CAB = 0;
        setBodyData(
          savingAccountData
            ?.filter(
              (data) =>
                data?.accountStatus === "ACTIVE" || data?.status === "ACTIVE"
            )
            ?.map((data) => {
              CAB += data?.balance;
              return {
                id: data?.id,
                accountNumber: data?.accountNumber,
                branchName: data?.branchName,
                accountDate: formatUserDate(data?.accountDate),
                balance: data?.balance?.toFixed(2) ?? 0,
                accountType: data?.accountType || "-",
              };
            }) || []
        );
        setCombinedAvilableBalance(CAB?.toFixed(2) ?? 0);
      } else {
        setBodyData([]);
        toast.error(`${response?.message ?? ""} || Data Fetching Failed`);
      }
    } else {
      setBodyData([]);
      toast.error(`${response?.message ?? ""} || Data Fetching Failed`);
    }
    setLoading(false);
  };

  const getStatements = async (
    fromDate,
    toDate,
    id,
    dateBetween,
    direction = "DESC"
  ) => {
    const payload = {
      savingAccount: {
        id: id,
      },
      isRecordBetweenDate: dateBetween,
      direction: direction,
      isAllRecord: true,
      exactDate: false,
      fromDate: fromDate,
      toDate: toDate,
    };
    setLoading(true);
    setIsDownloading(true);
    let response = await postServerData("passbook-history/record", payload, {
      pageNumber: currentPage,
      pageSize: pageLimit,
    });
    if (response?.value) {
      if (response?.status === 200 || response?.status === 201) {
        let transactionData = response?.data?.data;
        let totalCount = response?.data?.totalcount;
        let totalPagesCount = Math?.ceil(totalCount / pageLimit)?.toFixed(0);
        setTotalPages(totalPagesCount);
        setStatementData(
          transactionData?.map((data) => {
            return {
              accountNumber: data?.accountNumber ?? "",
              date: formatUserDate(data?.transactionDate) ?? "",
              particulars:
                String(
                  data?.particular ||
                    data?.dynamicparticulars ||
                    data?.transactionRemark ||
                    " "
                ).replace(/_/g, " ") || "",
              debit:
                data?.transactionType === "DEBIT"
                  ? (data?.amount?.toFixed(2) ?? 0)
                  : "-",
              credit:
                data?.transactionType === "CREDIT"
                  ? (data?.amount?.toFixed(2) ?? 0)
                  : "-",
              paymentMode: data?.paymentMode ?? "",
              Balance:
                (data?.runningBalanceDerived?.toFixed(2) ?? 0) + " Cr." || "",
            };
          }) || []
        );
      } else {
        setStatementData([]);
        toast.error(`${response?.message ?? ""} || Data Fetching Failed`);
      }
    } else {
      setStatementData([]);
      toast.error(`${response?.message ?? ""} || Data Fetching Failed`);
    }
    setLoading(false);
    setIsDownloading(false);
  };

  useAbortableEffect(
    (signal) => {
      if (customerId) {
        getAgentAccounts("SAVING_ACCOUNT", { signal });
      }
    },
    [customerId]
  );

  useEffect(() => {
    if (accountDatabaseId) {
      getStatements(fromDate, toDate, accountDatabaseId, true);
    }
  }, [currentPage, pageLimit]);

  useEffect(() => {
    if (isCustomer) {
      getCustomerDeatils(agentId);
    }
  }, []);

  useEffect(() => {
    if (accountDatabaseId) {
      switch (activeTwoTab) {
        case "Ascending":
          getStatements(fromDate, toDate, accountDatabaseId, true, "ASC");
          break;
        case "Descending":
          getStatements(fromDate, toDate, accountDatabaseId, true, "DESC");
          break;
        default:
          getStatements(fromDate, toDate, accountDatabaseId, true, "DESC");
          break;
      }
    }
  }, [activeTwoTab]);

  return (
    <div className="flex flex-col mx-4 text-black dark:text-white">
      {dataModal && (
        <ModalMain
          isOpen={dataModal}
          content={
            <>
              {statementType === "Statement" && (
                <div className="mb-2">
                  <RangeDateSearch
                    fromDate={fromDate}
                    setFromDate={setFromDate}
                    toDate={toDate}
                    setToDate={setToDate}
                    toDateValidation={{ max: getCurrentDate() }}
                    fromDateValidation={{ max: getCurrentDate() }}
                    getSearchData={() => {
                      if (accountDatabaseId) {
                        getStatements(
                          fromDate,
                          toDate,
                          accountDatabaseId,
                          true,
                          activeTwoTab === "Ascending" ? "ASC" : "DESC"
                        );
                      }
                    }}
                  />
                </div>
              )}
              <div className="flex items-center my-2 space-x-2 md:w-1/2 lg:w-1/2">
                <label className="text-sm font-medium text-black/80 dark:text-white/80">Order : </label>
                <select
                  name="view"
                  id="view"
                  className="px-3 py-1.5 text-sm border border-black/20 dark:border-white/20 rounded-lg bg-white dark:bg-white/5 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-brand"
                  onChange={(e) => {
                    setActiveTwoTab(e.target.value);
                  }}
                >
                  <option value="Descending">⬇ Descending</option>
                  <option value="Ascending">⬆ Ascending</option>
                </select>
              </div>
              {loading ? (
                <div>
                  <LoaderSpinner />
                </div>
              ) : (
                <>
                  <div ref={componentRef}>
                    <CommonTable
                      headItems={statementTableHeading}
                      bodyData={statementData}
                      isPagination={
                        statementType === "Statement" ? true : false
                      }
                      totalPages={totalPages}
                      limit={pageLimit}
                      setPageLimit={setPageLimit}
                      currentPage={currentPage}
                      setCurrentPage={setCurrentPage}
                    />
                  </div>

                  <button
                    className="flex items-center gap-2 px-4 py-2 my-4 bg-brand hover:bg-brand/90 text-white rounded-lg transition-colors cursor-pointer focus:outline-none font-semibold text-sm"
                    onClick={() => {
                      handlePrint();
                    }}
                    disabled={isDownloading}
                  >
                    <FaDownload className="hover:text-white" />
                    {isDownloading ? "Downloading..." : "Download Statement"}
                  </button>
                </>
              )}
            </>
          }
          setIsOpen={setDataModal}
          title={statementType}
        />
      )}
      <div className="flex flex-col mx-4">
        <div className="flex flex-col justify-evenly mt-4 md:flex-row lg:flex-row gap-4">
          <AccountCard
            name={userDetails?.customer?.firstName?.toLowerCase()?.trim()}
            desc={"CRN Name"}
            icon={<FaUser size={20} className="text-white" />}
          />
          <AccountCard
            name={combinedAvilableBalance}
            desc={"Combined Avilable Balance"}
            icon={<FaRupeeSign size={20} className="text-white" />}
          />
          <AccountCard
            name={"INR"}
            desc={"Currency"}
            icon={<GrCurrency size={20} className="text-white" />}
          />
          <AccountCard
            name={bodyData?.length ? bodyData?.length : 0}
            desc={"Number of Accounts"}
            icon={<FaUsers size={20} className="text-white" />}
          />
        </div>
      </div>
      <div className="mx-4 mt-4">
        <CommonTable
          headItems={tableHeading}
          bodyData={bodyData}
          actions={actions}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default SavingAcccounts;

