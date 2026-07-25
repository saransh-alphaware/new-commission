import { useContext, useEffect, useState } from "react";
import PayoutPieChart from "../components/PayoutPieChart";
import PayoutTable from "../components/PayoutTable";
import { getDateByDifference, getDateRanges } from "../utils/dateUtil";
import { getServerData, postServerData } from "../config/apiRequest";
import { AuthContext } from "../context/AuthContext";
import LoaderSpinner from "../components/LoaderSpinner";
import { toast } from "sonner";
import SpeedoMeterChart from "../components/NewSpeedoMeterChart";
import { encryptId } from "../utils/cryptoHelper";
import { useAbortableEffect } from "../hooks/useAbortableEffect";

function extractNumbers(str) {
  const matches = str.match(/\d+/g);
  if (matches === null) return [];
  return matches.map(Number);
}

function OptimizedHomePage() {
  let { agentId, userDetails, setUserDetails } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [agentList, setAgentList] = useState([]);
  const [AgentId, setAgentId] = useState(agentId);
  let collectionName = "Group_Collection";
  if (userDetails?.agentRank?.rank === 1) {
    collectionName = "Perosnal_Collection";
  }
  const [collection, setCollection] = useState(collectionName);
  const [today, setToday] = useState(getDateByDifference(0));

  const getAgentDetils = async (agentId) => {
    let response = await getServerData(`agents/agentlogin/${agentId}`);
    if (response?.value) {
      if (response?.status === 200 || response?.status === 201) {
        let AgentData = response?.data?.data;
        let userData = {
          agentNumber: AgentData?.agentNumber || "",
          referAgentId: AgentData?.reffredAgentById?.agentNumber || "",
          agentUserName: AgentData?.agentUserName || "",
          joiningDate: AgentData?.joiningDate || "",
          agentRank: {
            rank: AgentData?.rank || "",
            rankName: AgentData?.rankName || "",
          },
          customer: {
            id: AgentData?.customerDTO?.id || "",
            mobileNumber: AgentData?.customerDTO?.mobileNumber || "",
            email: AgentData?.customerDTO?.email || "",
            firstName: AgentData?.customerDTO?.firstName || "",
            gender: AgentData?.customerDTO?.gender || "",
          },
          office: {
            countryToOffice: AgentData?.officeData?.countryToOffice?.name || "",
            districtToOffice:
              AgentData?.officeData?.districtToOffice?.name || "",
            stateToOffice: AgentData?.officeData?.stateToOffice?.state || "",
          },
        };
        const constUserDataStringified = JSON.stringify(userData);
        const encryptedAgentDetails = encryptId(constUserDataStringified);
        sessionStorage.setItem("agentDetails", encryptedAgentDetails);
        setUserDetails(userData);
        if (userData?.agentRank?.rank === 1) {
          setCollection("Perosnal_Collection");
        } else {
          setCollection("Group_Collection");
        }
      } else {
        setUserDetails({});
        toast.error(`${response?.message || ""} || Data Fetching Failed`);
      }
    } else {
      setUserDetails({});
      toast.error(`${response?.message || ""} || Data Fetching Failed`);
    }
  };

  async function getDashboardData(AgentNumber, dateRange, options) {
    const response = await postServerData(
      `agents/agent-dashboard-summary/${AgentNumber}`,
      dateRange,
      null,
      options
    );
    if (response?.cancelled) {
      return null;
    }
    if (response?.value) {
      if (response?.status === 200 || response?.status === 201) {
        return response?.data;
      } else {
        toast.error(response?.message || "Data Fetching Failed");
        return null;
      }
    } else {
      toast.error(response?.message || "Data Fetching Failed");
      return null;
    }
  }

  const getAgentData = async (options) => {
    const response = await getServerData(
      `agents/${agentId}/agents`,
      null,
      options
    );
    if (response?.cancelled) {
      return;
    }
    if (response?.value) {
      if (response?.status === 200 || response?.status === 201) {
        setAgentList(response?.data?.data);
      } else {
        toast.error(response?.message);
      }
    } else {
      toast.error(response?.message);
    }
  };

  useEffect(() => {
    const encryptedAgentDetails = sessionStorage?.getItem("agentDetails");
    if (AgentId && !encryptedAgentDetails) {
      getAgentDetils(AgentId);
    }
  }, [AgentId]);

  useAbortableEffect((signal) => {
    getAgentData({ signal });
  }, []);

  const actualData = {
    dds: {
      ninety: 0,
      oneEighty: 0,
      threeSixtyFive: 0,
      reNinety: 0,
      reOneEighty: 0,
      reThreeSixtyFive: 0,
      total: 0,
    },
    rds: { new: 0, renewal: 0, total: 0 },
    fixed: { below: 0, above: 0, total: 0 },
    yojna: 0,
    mip: 0,
    grandTotal: 0,
  };

  const data = {
    today: actualData,
    week: actualData,
    month: actualData,
    year: actualData,
  };

  const [viewOption, setViewOption] = useState("table");
  const [personalTableData, setPersonalTableData] = useState(data);
  const [groupTableData, setGroupTableData] = useState(data);

  function convertDashboardData(response, isGroup) {
    const calculatePeriodData = (periodData, isGroup) => {
      const groupNew = periodData.agentWithChildAccountsBusiness || [];
      const personalNew = periodData.agentAccountsBusiness || [];
      const groupRenew = periodData.agentWithChildRenewalBusiness || [];
      const personalRenew = periodData.agentRenewalBusiness || [];

      const getDDSValue = (array, type) => {
        if (!array || !Array.isArray(array)) return 0;
        return array
          .filter((item) => item.productType === "DDS_PRODUCT")
          .filter((item) => {
            const name = item.productName || "";
            const normalized = name.replace(/\s+/g, " ").trim();
            if (type === 90) {
              return (
                normalized === "DDS 90DAYS NEW" || normalized === "DDS 90 DAYS"
              );
            }
            if (type === 180) {
              return (
                normalized === "180 DAYS 7%" || normalized === "DDS ONE EIGHTY"
              );
            }
            if (type === 365) {
              return normalized === "365 DAYS 7%" || normalized === "DDS DAYS";
            }
            return false;
          })
          .reduce((sum, item) => sum + (item.totalInvestedBalance || 0), 0);
      };

      const getYojnaValue = (array) => {
        if (!array || !Array.isArray(array)) return 0;
        const keywords = ["XUBY", "XJSY", "XUY", "UTKARSHA", "UJJWAL"];
        return array
          .filter(
            (item) =>
              item.productType === "RD_PRODUCT" ||
              item.productType === "FIX_PRODUCT"
          )
          .filter((item) => {
            const name = item.productName || "";
            return keywords.some((keyword) => name.includes(keyword));
          })
          .reduce((sum, item) => sum + (item.totalInvestedBalance || 0), 0);
      };

      const getRDValue = (array) => {
        if (!array || !Array.isArray(array)) return 0;
        const keywords = ["XUBY", "XJSY", "XUY", "UTKARSHA", "UJJWAL"];
        return array
          .filter((item) => item.productType === "RD_PRODUCT")
          .filter((item) => {
            const name = item.productName || "";
            return !keywords.some((keyword) => name.includes(keyword));
          })
          .reduce((sum, item) => sum + (item.totalInvestedBalance || 0), 0);
      };

      const getFixValue = (array, aboveOption) => {
        if (!array || !Array.isArray(array)) return 0;
        const keywords = ["XUBY", "XJSY", "XUY", "UTKARSHA", "UJJWAL"];
        return array
          .filter((item) => item.productType === "FIX_PRODUCT")
          .filter((item) => {
            const name = item.productName || "";
            return !keywords.some((keyword) => name.includes(keyword));
          })
          .filter((item) => {
            const nums = extractNumbers(item.productName || "");
            const firstNum = nums.length > 0 ? nums[0] : null;
            if (aboveOption) {
              return firstNum !== null && firstNum >= 24;
            } else {
              return firstNum === null || firstNum < 24;
            }
          })
          .reduce((sum, item) => sum + (item.totalInvestedBalance || 0), 0);
      };

      const getMIPValue = (array) => {
        if (!array || !Array.isArray(array)) return 0;
        return array
          .filter((item) => item.productType === "MIP_PRODUCT")
          .reduce((sum, item) => sum + (item.totalInvestedBalance || 0), 0);
      };

      let dds90, dds180, dds360, redds90, redds180, redds365;
      if (isGroup) {
        dds90 = getDDSValue(groupNew, 90) - getDDSValue(personalNew, 90);
        dds180 = getDDSValue(groupNew, 180) - getDDSValue(personalNew, 180);
        dds360 = getDDSValue(groupNew, 365) - getDDSValue(personalNew, 365);
        redds90 = getDDSValue(groupRenew, 90) - getDDSValue(personalRenew, 90);
        redds180 =
          getDDSValue(groupRenew, 180) - getDDSValue(personalRenew, 180);
        redds365 =
          getDDSValue(groupRenew, 365) - getDDSValue(personalRenew, 365);
      } else {
        dds90 = getDDSValue(personalNew, 90);
        dds180 = getDDSValue(personalNew, 180);
        dds360 = getDDSValue(personalNew, 365);
        redds90 = getDDSValue(personalRenew, 90);
        redds180 = getDDSValue(personalRenew, 180);
        redds365 = getDDSValue(personalRenew, 365);
      }
      const ddsTotal = dds90 + dds180 + dds360 + redds90 + redds180 + redds365;

      let yojna;
      if (isGroup) {
        yojna =
          getYojnaValue(groupNew) +
          getYojnaValue(groupRenew) -
          getYojnaValue(personalRenew) -
          getYojnaValue(personalNew);
      } else {
        yojna = getYojnaValue(personalNew) + getYojnaValue(personalRenew);
      }

      let rdsNew, rdsRenew;
      if (isGroup) {
        rdsNew = getRDValue(groupNew) - getRDValue(personalNew);
        rdsRenew = getRDValue(groupRenew) - getRDValue(personalRenew);
      } else {
        rdsNew = getRDValue(personalNew);
        rdsRenew = getRDValue(personalRenew);
      }
      const rdsTotal = rdsNew + rdsRenew;

      let fixAbove, fixBelow;
      if (isGroup) {
        fixAbove = getFixValue(groupNew, true) - getFixValue(personalNew, true);
        fixBelow =
          getFixValue(groupNew, false) - getFixValue(personalNew, false);
      } else {
        fixAbove = getFixValue(personalNew, true);
        fixBelow = getFixValue(personalNew, false);
      }
      const fixTotal = fixAbove + fixBelow;

      let mip;
      if (isGroup) {
        mip = getMIPValue(groupNew) - getMIPValue(personalNew);
      } else {
        mip = getMIPValue(personalNew);
      }

      const grandTotal = ddsTotal + rdsTotal + fixTotal + yojna + mip;

      return {
        dds: {
          ninety: dds90,
          oneEighty: dds180,
          threeSixtyFive: dds360,
          reNinety: redds90,
          reOneEighty: redds180,
          reThreeSixtyFive: redds365,
          total: ddsTotal,
        },
        rds: { new: rdsNew, renewal: rdsRenew, total: rdsTotal },
        fixed: {
          below: fixBelow,
          above: fixAbove,
          total: fixTotal,
        },
        yojna: yojna,
        mip: mip,
        grandTotal: grandTotal,
      };
    };

    const getPeriodData = (periodKey) => {
      return {
        agentWithChildAccountsBusiness:
          response?.agentWithChildAccountsBusiness?.[periodKey] || [],
        agentAccountsBusiness:
          response?.agentAccountsBusiness?.[periodKey] || [],
        agentWithChildRenewalBusiness:
          response?.agentWithChildRenewalBusiness?.[periodKey] || [],
        agentRenewalBusiness: response?.agentRenewalBusiness?.[periodKey] || [],
      };
    };

    return {
      today: calculatePeriodData(getPeriodData("today"), isGroup),
      week: calculatePeriodData(getPeriodData("thisWeek"), isGroup),
      month: calculatePeriodData(getPeriodData("thisMonth"), isGroup),
      year: calculatePeriodData(getPeriodData("financialYear"), isGroup),
    };
  }

  async function getPersonalData(options) {
    try {
      setLoading(true);
      const rangeData = getDateRanges(today);
      const dateRange = {
        businessType: "PERSONAL-BUSINESS",
        today: {
          startDate: rangeData.today[0],
          endDate: rangeData.today[1],
        },
        thisWeek: {
          startDate: rangeData.week[0],
          endDate: rangeData.week[1],
        },
        thisMonth: {
          startDate: rangeData.month[0],
          endDate: rangeData.month[1],
        },
        financialYear: {
          startDate: rangeData.year[0],
          endDate: rangeData.year[1],
        },
      };

      const response = await getDashboardData(AgentId, dateRange, options);
      const personalObj = convertDashboardData(response, false);
      setPersonalTableData(personalObj);
      return personalObj;
    } catch (err) {
      toast.error(`${err} || Data Fetching Failed`);
    } finally {
      setLoading(false);
    }
  }

  async function getGroupData(options) {
    try {
      setLoading(true);
      const rangeData = getDateRanges(today);
      const dateRange = {
        businessType: "GROUP-BUSINESS",
        today: {
          startDate: rangeData.today[0],
          endDate: rangeData.today[1],
        },
        thisWeek: {
          startDate: rangeData.week[0],
          endDate: rangeData.week[1],
        },
        thisMonth: {
          startDate: rangeData.month[0],
          endDate: rangeData.month[1],
        },
        financialYear: {
          startDate: rangeData.year[0],
          endDate: rangeData.year[1],
        },
      };

      const response = await getDashboardData(AgentId, dateRange, options);
      const groupObj = convertDashboardData(response, true);
      setGroupTableData(groupObj);
    } catch (err) {
      toast.error(`${err} || Data Fetching Failed`);
    } finally {
      setLoading(false);
    }
  }

  useAbortableEffect((signal) => {
    if (collection === "Perosnal_Collection") {
      getPersonalData({ signal });
    } else {
      getGroupData({ signal });
    }
  }, [AgentId, collection, today]);

  return (
    <div
      className={`relative w-full min-h-[400px] flex items-center flex-col py-3 text-black dark:text-white transition-colors duration-300 ${
        loading ? "blur-[1px] pointer-events-none" : "blur-none"
      }`}
    >
      {loading && (
        <div className="absolute inset-0 z-40 flex justify-center items-center bg-black/20 dark:bg-black/40 backdrop-blur-xs rounded-xl">
          <LoaderSpinner />
        </div>
      )}
        <div className="w-full flex flex-col md:flex-row md:items-center gap-3 md:gap-4 px-4 py-1">
          <div className="w-full md:w-1/5 flex items-center">
            <span className="text-2xl font-black text-black dark:text-white whitespace-nowrap">
              {collection && collection === "Perosnal_Collection"
                ? "Personal Collection"
                : "Group Collection"}
            </span>
          </div>
          <div className="w-full md:w-1/5 flex items-center">
            <select
              name="personalCollection"
              id="personalCollection"
              value={collection}
              className="h-10 px-3 text-sm border border-black/20 dark:border-white/20 rounded-lg bg-white dark:bg-white/5 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-brand w-full transition-colors leading-tight"
              onChange={(e) => {
                setCollection(e.target.value);
              }}
            >
              <option value="Perosnal_Collection" className="bg-white dark:bg-dark-bg text-black dark:text-white">Personal Collection</option>
              <option value="Group_Collection" className="bg-white dark:bg-dark-bg text-black dark:text-white">Group Collection</option>
            </select>
          </div>
          <div className="w-full md:w-1/5 flex items-center">
            <select
              name="a123"
              id="a123"
              className="h-10 px-3 text-sm border border-black/20 dark:border-white/20 rounded-lg bg-white dark:bg-white/5 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-brand w-full transition-colors leading-tight"
              value={AgentId}
              onChange={(e) => {
                setAgentId(e.target.value);
              }}
            >
              <option key={agentId} value={agentId} className="bg-white dark:bg-dark-bg text-black dark:text-white">
                {`My Account (${userDetails?.agentNumber})`}
              </option>
              {agentList &&
                agentList?.map((data) => (
                  <option key={data?.id} value={data?.id} className="bg-white dark:bg-dark-bg text-black dark:text-white">
                    {data?.agentNumber}
                  </option>
                ))}
            </select>
          </div>
          <div className="w-full md:w-1/5 flex items-center">
            <input
              type="date"
              id="date"
              className="h-10 px-3 text-sm border border-black/20 dark:border-white/20 rounded-lg bg-white dark:bg-white/5 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-brand w-full transition-colors leading-tight"
              value={today}
              onChange={(e) => setToday(e.target.value)}
            />
          </div>
          <div className="w-full md:w-1/5 flex items-center">
            <select
              name="view"
              id="view"
              className="h-10 px-3 text-sm border border-black/20 dark:border-white/20 rounded-lg bg-white dark:bg-white/5 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-brand w-full transition-colors leading-tight"
              onChange={(e) => {
                setViewOption(e.target.value);
              }}
            >
              <option value="table" className="bg-white dark:bg-dark-bg text-black dark:text-white">Table</option>
              <option value="chart" className="bg-white dark:bg-dark-bg text-black dark:text-white">Chart</option>
            </select>
          </div>
        </div>
        {collection && collection === "Perosnal_Collection" ? (
          <div className="w-full px-4 flex flex-col mx-4">
            <div className="mt-4 overflow-x-auto">
              {viewOption && viewOption === "table" ? (
                <PayoutTable data={personalTableData} today={today} />
              ) : (
                <div className="flex flex-col">
                  <PayoutPieChart
                    interval={"Today"}
                    grandTotal={personalTableData?.today?.grandTotal}
                    data={personalTableData?.today}
                  />
                  <PayoutPieChart
                    interval={"Week"}
                    grandTotal={personalTableData?.week?.grandTotal}
                    data={personalTableData?.week}
                  />
                  <PayoutPieChart
                    interval={"Month"}
                    grandTotal={personalTableData?.month?.grandTotal}
                    data={personalTableData?.month}
                  />
                  <PayoutPieChart
                    interval={"Year"}
                    grandTotal={personalTableData?.year?.grandTotal}
                    data={personalTableData?.year}
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full px-4 flex flex-col mx-4">
            <div className="mt-4">
              {viewOption && viewOption === "table" ? (
                <PayoutTable data={groupTableData} today={today} />
              ) : (
                <div className="flex flex-col">
                  <PayoutPieChart
                    interval={"Today"}
                    grandTotal={groupTableData?.today?.grandTotal}
                    data={groupTableData?.today}
                  />
                  <PayoutPieChart
                    interval={"Week"}
                    grandTotal={groupTableData?.week?.grandTotal}
                    data={groupTableData?.week}
                  />
                  <PayoutPieChart
                    interval={"Month"}
                    grandTotal={groupTableData?.month?.grandTotal}
                    data={groupTableData?.month}
                  />
                  <PayoutPieChart
                    interval={"Year"}
                    grandTotal={groupTableData?.year?.grandTotal}
                    data={groupTableData?.year}
                  />
                </div>
              )}
            </div>
          </div>
        )}
        <div className="w-full px-4 flex flex-col mx-4">
          <SpeedoMeterChart dateTime={getDateRanges(today)} />
        </div>
      </div>
  );
}

export default OptimizedHomePage;
