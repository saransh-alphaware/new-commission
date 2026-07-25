import { useContext, useMemo, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { toast } from "sonner";
import { convertDateFormat } from "../utils/dateUtil";
import { getServerData } from "../config/apiRequest";
import { useAbortableEffect } from "../hooks/useAbortableEffect";
import SpeedoMeter from "./SpeedoMeter";
import LoaderSpinner from "./LoaderSpinner";
import CommonTable from "./CommonTable";
import { BsBarChartFill } from "react-icons/bs";
import { FaTable } from "react-icons/fa";

const NewSpeedoMeterChart = ({ dateTime }) => {
  const { agentId } = useContext(AuthContext);
  const [meterData, setMeterData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("graph");

  const targetHeading = ["Name", "From Date", "To Date", "Achieved", "Target"];

  const targetData = useMemo(() => {
    if (!meterData) return [];
    const rows = [];

    if (meterData?.promotionalTarget) {
      rows.push({
        name: "Promotional B/S Target",
        fromDate: convertDateFormat(dateTime?.year?.[0]),
        toDate: convertDateFormat(dateTime?.year?.[1]),
        achieved: meterData?.promotionalTarget?.achieved || 0,
        target: meterData?.promotionalTarget?.target || 0,
      });
    }
    if (meterData?.monthlyTarget) {
      rows.push({
        name: "Monthly B/S Target",
        fromDate: convertDateFormat(dateTime?.month?.[0]),
        toDate: convertDateFormat(dateTime?.month?.[1]),
        achieved: meterData?.monthlyTarget?.achieved || 0,
        target: meterData?.monthlyTarget?.target || 0,
      });
    }
    if (meterData?.yearlyTarget) {
      rows.push({
        name: "Yearly B/S Target",
        fromDate: convertDateFormat(dateTime?.year?.[0]),
        toDate: convertDateFormat(dateTime?.year?.[1]),
        achieved: meterData?.yearlyTarget?.achieved || 0,
        target: meterData?.yearlyTarget?.target || 0,
      });
    }
    return rows;
  }, [meterData, dateTime]);

  const getData = async (options) => {
    try {
      setLoading(true);
      const response = await getServerData(
        `agents/target-achieved-group-v2`,
        {
          monthlyStartDate: dateTime?.month?.[0],
          monthlyEndDate: dateTime?.month?.[1],
          yearlyStartDate: dateTime?.year?.[0],
          yearlyEndDate: dateTime?.year?.[1],
          agentId: agentId,
        },
        options
      );
      if (response?.cancelled) {
        setLoading(false);
        return;
      }
      if (
        response?.value &&
        (response.status === 200 || response.status === 201)
      ) {
        setMeterData(response?.data?.data || null);
      } else {
        setMeterData(null);
        toast.error(`${response?.message || ""} || Data Fetching Failed`);
      }
    } catch (err) {
      setMeterData(null);
      toast.error("Unexpected error || Data Fetching Failed");
    } finally {
      setLoading(false);
    }
  };

  useAbortableEffect((signal) => {
    getData({ signal });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    agentId,
    dateTime?.month?.[0],
    dateTime?.month?.[1],
    dateTime?.year?.[0],
    dateTime?.year?.[1],
  ]);

  const hasAnyTarget =
    !!meterData?.promotionalTarget ||
    !!meterData?.monthlyTarget ||
    !!meterData?.yearlyTarget;

  if (loading) {
    return (
      <div className="relative mt-28 w-full">
        <LoaderSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col mt-8 text-black dark:text-white transition-colors duration-300 w-full">
      {targetData?.length > 0 && (
        <div className="flex justify-end mb-4">
          <div
            role="tablist"
            aria-label="Target view"
            className="inline-flex rounded-xl bg-gray-100 dark:bg-white/10 p-1 shadow-sm border border-black/5 dark:border-white/10"
          >
            <button
              role="tab"
              aria-selected={activeTab === "graph"}
              onClick={() => setActiveTab("graph")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === "graph"
                  ? "bg-white dark:bg-dark-bg text-black dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/5"
              }`}
            >
              <BsBarChartFill className="text-lg" />
              Graph
            </button>
            <button
              role="tab"
              aria-selected={activeTab === "table"}
              onClick={() => setActiveTab("table")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === "table"
                  ? "bg-white dark:bg-dark-bg text-black dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/5"
              }`}
            >
              <FaTable className="text-lg" />
              Table
            </button>
          </div>
        </div>
      )}

      <div role="tabpanel" className="mt-2 w-full">
        {activeTab === "graph"
          ? hasAnyTarget && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mt-4 w-full items-stretch justify-items-center">
                {meterData?.promotionalTarget && (
                  <SpeedoMeter
                    title={"Promotional B/S Target"}
                    achivedValue={meterData?.promotionalTarget?.achieved || 0}
                    targetValue={meterData?.promotionalTarget?.target || 0}
                  />
                )}
                {meterData?.monthlyTarget && (
                  <SpeedoMeter
                    title={"Monthly B/S Target"}
                    achivedValue={meterData?.monthlyTarget?.achieved || 0}
                    targetValue={meterData?.monthlyTarget?.target || 0}
                  />
                )}
                {meterData?.yearlyTarget && (
                  <SpeedoMeter
                    title={"Yearly B/S Target"}
                    achivedValue={meterData?.yearlyTarget?.achieved || 0}
                    targetValue={meterData?.yearlyTarget?.target || 0}
                  />
                )}
              </div>
            )
          : targetData?.length > 0 && (
              <div className="w-full flex flex-col mt-2 overflow-x-auto">
                <CommonTable headItems={targetHeading} bodyData={targetData} />
              </div>
            )}
      </div>
    </div>
  );
};

export default NewSpeedoMeterChart;
