import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import LoaderSpinner from "../components/LoaderSpinner";
import {
  getCurrentDate,
  getDateByDifference,
} from "../utils/dateUtil";
import { getServerData } from "../config/apiRequest";
import { useAbortableEffect } from "../hooks/useAbortableEffect";
import { toast } from "sonner";
import CommonTable from "../components/CommonTable";
import RangeDateSearch from "../components/RangeDateSearch";

const CommissionData = () => {
  const [commission, setCommission] = useState("Direct_Commission");
  const [loading, setLoading] = useState(false);
  const { agentId } = useContext(AuthContext);
  const [searchQueryTrigger, setSearchQueryTrigger] = useState(0);
  const [fromDate, setFromDate] = useState(getDateByDifference(365));
  const [toDate, setToDate] = useState(getCurrentDate());
  const [directCommissionData, setDirectCustomerData] = useState([]);
  const [indirectCommissionData, setIndirectCustomerData] = useState([]);

  const tableHeading = [
    "Product Type",
    "Invested Balance",
    "Term",
    "Commission Percentage",
    "Commission Amount",
    "Commission Type",
    "Name",
    "Rank",
    "Agent Id",
  ];

  const getCommissionData = async (fromDate, toDate, options) => {
    setLoading(true);
    try {
      let directResponse = await getServerData(
        `commission-charts/agent/${agentId}/commissiondetails`,
        {
          creationDate: fromDate,
          endDate: toDate,
        },
        options
      );
      if (directResponse?.cancelled) {
        setLoading(false);
        return;
      }
      if (directResponse?.value && directResponse?.status === 200) {
        setDirectCustomerData(directResponse?.data?.data || []);
      }
      let indirectResponse = await getServerData(
        `commission-charts/agent/${agentId}/commissiondetailswithgap`,
        {
          creationDate: fromDate,
          endDate: toDate,
        },
        options
      );
      if (indirectResponse?.cancelled) {
        setLoading(false);
        return;
      }
      if (indirectResponse?.value && indirectResponse?.status === 200) {
        setIndirectCustomerData(indirectResponse?.data?.data || []);
      }
    } catch (err) {
      toast.error(`${err} || Data Fetching Failed`);
    } finally {
      setLoading(false);
    }
  };

  useAbortableEffect(
    (signal) => {
      getCommissionData(fromDate, toDate, { signal });
    },
    [searchQueryTrigger]
  );

  return (
    <div className="flex flex-col mx-4 text-black dark:text-white">
      {loading ? (
        <LoaderSpinner />
      ) : (
        <>
          <div className="flex flex-col gap-x-3 gap-y-3 mt-3 w-full md:flex-row md:items-center lg:flex-row lg:items-center">
            <select
              name="commission"
              id="commission"
              className="px-3 py-1.5 text-sm border border-black/20 dark:border-white/20 rounded-lg bg-white dark:bg-white/5 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-brand"
              value={commission}
              onChange={(e) => {
                setCommission(e.target.value);
              }}
            >
              <option value="Direct_Commission">Direct Commission</option>
              <option value="Indirect_Commission">Indirect Commission</option>
            </select>
            <RangeDateSearch
              fromDate={fromDate}
              setFromDate={setFromDate}
              toDate={toDate}
              setToDate={setToDate}
              toDateValidation={{ max: getCurrentDate() }}
              fromDateValidation={{ max: getCurrentDate() }}
              getSearchData={() => {
                setSearchQueryTrigger((prev) => prev + 1);
              }}
            />
          </div>
          <div className="mt-4 overflow-x-auto">
            {commission === "Direct_Commission" ? (
              <CommonTable
                headItems={tableHeading}
                bodyData={directCommissionData}
              />
            ) : (
              <CommonTable
                headItems={tableHeading}
                bodyData={indirectCommissionData}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CommissionData;

