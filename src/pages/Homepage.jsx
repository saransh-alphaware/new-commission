import { useContext, useEffect, useState } from "react";
import PayoutPieChart from "../components/PayoutPieChart";
import PayoutTable from "../components/PayoutTable";
import { getDateByDifference, getDateRanges } from "../utils/dateUtil";
import { AuthContext } from "../context/AuthContext";
import LoaderSpinner from "../components/LoaderSpinner";
import { toast } from "sonner";
import SpeedoMeterChart from "../components/SpeedoMeterChart";
import { encryptId } from "../utils/cryptoHelper";
import { getServerData } from "../config/apiRequest";
import { useAbortableEffect } from "../hooks/useAbortableEffect";

function extractNumbers(str) {
  const matches = str.match(/\d+/g);
  if (matches === null) return [];
  return matches.map(Number);
}

function containsYOJNA(str) {
  const keywords = ["XUBY", "XJSY", "XUY", "UTKARSHA", "UJJWAL"];
  return keywords.some((keyword) => str.includes(keyword));
}

function subtractPersonalFromGroup(obj1, obj2) {
  function subtractRecursive(a, b) {
    const result = Array.isArray(b) ? [] : {};
    for (const key in b) {
      if (typeof b[key] === "object" && b[key] !== null) {
        result[key] = subtractRecursive(a[key] || {}, b[key]);
      } else {
        result[key] = (b[key] || 0) - (a[key] || 0);
      }
    }
    return result;
  }

  return subtractRecursive(obj1, obj2);
}

function Homepage() {
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

  function tableData(response, renewal) {
    response = response ? response : {};

    const dds90 =
      response?.DDS_ACCOUNT?.details?.["DDS 90 DAYS"] ||
      response?.DDS_ACCOUNT?.details?.["DDS 90DAYS NEW"] ||
      0;
    const dds180 =
      response?.DDS_ACCOUNT?.details?.["DDS ONE EIGHTY"] ||
      response?.DDS_ACCOUNT?.details?.["180 DAYS  7%"] ||
      0;
    const dds360 =
      response?.DDS_ACCOUNT?.details?.["DDS DAYS"] ||
      response?.DDS_ACCOUNT?.details?.["365 DAYS 7%"] ||
      0;
    const redds90 =
      renewal?.DDS_ACCOUNT?.details?.["DDS 90 DAYS"] ||
      renewal?.DDS_ACCOUNT?.details?.["DDS 90DAYS NEW"] ||
      0;
    const redds180 =
      renewal?.DDS_ACCOUNT?.details?.["DDS ONE EIGHTY"] ||
      renewal?.DDS_ACCOUNT?.details?.["180 DAYS  7%"] ||
      0;
    const redds365 =
      renewal?.DDS_ACCOUNT?.details?.["DDS DAYS"] ||
      renewal?.DDS_ACCOUNT?.details?.["365 DAYS 7%"] ||
      0;
    const ddsTotal = dds90 + dds180 + dds360 + redds90 + redds180 + redds365;

    let rdsNew = 0;
    let rdsRenew = 0;
    let yojnaNew = 0;
    let yojnaRenew = 0;
    if (response?.RECURRING_DEPOSIT_ACCOUNT?.details) {
      const rdsArray = Object.keys(
        response?.RECURRING_DEPOSIT_ACCOUNT?.details
      );
      for (let i = 0; i < rdsArray?.length; i++) {
        if (containsYOJNA(rdsArray[i])) {
          yojnaNew +=
            response?.RECURRING_DEPOSIT_ACCOUNT?.details?.[rdsArray[i]];
        } else {
          rdsNew += response?.RECURRING_DEPOSIT_ACCOUNT?.details?.[rdsArray[i]];
        }
      }
    }
    if (renewal?.RECURRING_DEPOSIT_ACCOUNT?.details) {
      const rdsArray = Object.keys(renewal?.RECURRING_DEPOSIT_ACCOUNT?.details);
      for (let i = 0; i < rdsArray?.length; i++) {
        if (containsYOJNA(rdsArray[i])) {
          yojnaRenew +=
            renewal?.RECURRING_DEPOSIT_ACCOUNT?.details?.[rdsArray[i]];
        } else {
          rdsRenew +=
            renewal?.RECURRING_DEPOSIT_ACCOUNT?.details?.[rdsArray[i]];
        }
      }
    }
    const rdsTotal = rdsNew + rdsRenew;

    let fixAbove = 0;
    let fixBelow = 0;
    let fixYojna = 0;

    if (response?.FIX_ACCOUNT?.details) {
      const fixArray = Object.keys(response?.FIX_ACCOUNT?.details);
      for (let i = 0; i < fixArray?.length; i++) {
        if (containsYOJNA(fixArray[i])) {
          fixYojna += response?.FIX_ACCOUNT?.details?.[fixArray[i]];
        } else if (extractNumbers(fixArray[i])[0] >= 24) {
          fixAbove += response?.FIX_ACCOUNT?.details?.[fixArray[i]];
        } else {
          fixBelow += response?.FIX_ACCOUNT?.details?.[fixArray[i]];
        }
      }
    }
    const fixTotal = fixAbove + fixBelow;
    let mipNew = 0;
    if (response?.MIP_ACCOUNT?.details) {
      const mipArray = Object.values(response?.MIP_ACCOUNT?.details);
      mipNew = mipArray?.reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0
      );
    }
    let mip = mipNew;
    let yojna = fixYojna + yojnaNew + yojnaRenew;
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
  }

  async function getDashboardData(creationDate, endDate, url, state, options) {
    try {
      if (state === "new") {
        const response = await getServerData(
          `agents/${url}`,
          {
            creationDate: creationDate,
            endDate: endDate,
          },
          options
        );
        if (response?.cancelled) {
          return {};
        }
        return response?.data;
      }
      if (state === "renew") {
        const response = await getServerData(
          `agents/${url}`,
          {
            startDate: creationDate,
            endDate: endDate,
          },
          options
        );
        if (response?.cancelled) {
          return {};
        }
        if (url.endsWith("renewal-business-byDate")) {
          const B = {
            DDS_ACCOUNT: { details: {} },
            RECURRING_DEPOSIT_ACCOUNT: { details: {} },
            FIX_ACCOUNT: { details: {} },
            MIP_ACCOUNT: { details: {} },
          };

          const mapping = {
            DAILY_DEPOSIT: "DDS_ACCOUNT",
            RECURRING_DEPOSIT: "RECURRING_DEPOSIT_ACCOUNT",
            FIXED_DEPOSIT: "FIX_ACCOUNT",
            MONTHLY_INCOME: "MIP_ACCOUNT",
          };

          if (response?.data?.ACCOUNT_AND_PRODUCT_DETAILS) {
            for (const [accountType, products] of Object.entries(
              response?.data?.ACCOUNT_AND_PRODUCT_DETAILS
            )) {
              if (mapping[accountType]) {
                const targetAccount = mapping[accountType];
                for (const [productName, details] of Object.entries(products)) {
                  B[targetAccount].details[productName] = details.totalAmount;
                }
              }
            }
            return B;
          } else {
            return {};
          }
        } else if (
          url.endsWith("renewal-business-byDate-and-children-fetch-v3")
        ) {
          return response?.data;
        } else {
          return {};
        }
      }
    } catch (error) {
      toast.error(`${error} || Data Fetching Failed`);
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

  async function getPersonalData(options) {
    try {
      setLoading(true);
      const newPersonalURL = `${AgentId}/account-counted`;
      const renewalPersonalURL = `${AgentId}/renewal-business-byDate`;
      const rangeData = getDateRanges(today);
      const [
        personalToday,
        personalWeek,
        personalMonth,
        personalYear,
        personalRenewalToday,
        personalRenewalWeek,
        personalRenewalMonth,
        personalRenewalYear,
      ] = await Promise.all([
        getDashboardData(
          rangeData.today[0],
          rangeData.today[1],
          newPersonalURL,
          "new",
          options
        ),
        getDashboardData(
          rangeData.week[0],
          rangeData.week[1],
          newPersonalURL,
          "new",
          options
        ),
        getDashboardData(
          rangeData.month[0],
          rangeData.month[1],
          newPersonalURL,
          "new",
          options
        ),
        getDashboardData(
          rangeData.year[0],
          rangeData.year[1],
          newPersonalURL,
          "new",
          options
        ),
        getDashboardData(
          rangeData.today[0],
          rangeData.today[1],
          renewalPersonalURL,
          "renew",
          options
        ),
        getDashboardData(
          rangeData.week[0],
          rangeData.week[1],
          renewalPersonalURL,
          "renew",
          options
        ),
        getDashboardData(
          rangeData.month[0],
          rangeData.month[1],
          renewalPersonalURL,
          "renew",
          options
        ),
        getDashboardData(
          rangeData.year[0],
          rangeData.year[1],
          renewalPersonalURL,
          "renew",
          options
        ),
      ]);

      const personalObj = {
        today: tableData(personalToday, personalRenewalToday),
        week: tableData(personalWeek, personalRenewalWeek),
        month: tableData(personalMonth, personalRenewalMonth),
        year: tableData(personalYear, personalRenewalYear),
      };
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
      const newGroupURL = `${AgentId}/account-summary-child-fetchv2`;
      const renewalGroupURL = `${AgentId}/renewal-business-byDate-and-children-fetch-v3`;
      const rangeData = getDateRanges(today);
      const [
        groupToday,
        groupWeek,
        groupMonth,
        groupYear,
        groupRenewalToday,
        groupRenewalWeek,
        groupRenewalMonth,
        groupRenewalYear,
      ] = await Promise.all([
        getDashboardData(
          rangeData.today[0],
          rangeData.today[1],
          newGroupURL,
          "new",
          options
        ),
        getDashboardData(
          rangeData.week[0],
          rangeData.week[1],
          newGroupURL,
          "new",
          options
        ),
        getDashboardData(
          rangeData.month[0],
          rangeData.month[1],
          newGroupURL,
          "new",
          options
        ),
        getDashboardData(
          rangeData.year[0],
          rangeData.year[1],
          newGroupURL,
          "new",
          options
        ),
        getDashboardData(
          rangeData.today[0],
          rangeData.today[1],
          renewalGroupURL,
          "renew",
          options
        ),
        getDashboardData(
          rangeData.week[0],
          rangeData.week[1],
          renewalGroupURL,
          "renew",
          options
        ),
        getDashboardData(
          rangeData.month[0],
          rangeData.month[1],
          renewalGroupURL,
          "renew",
          options
        ),
        getDashboardData(
          rangeData.year[0],
          rangeData.year[1],
          renewalGroupURL,
          "renew",
          options
        ),
      ]);
      const groupObj = {
        today: tableData(groupToday, groupRenewalToday),
        week: tableData(groupWeek, groupRenewalWeek),
        month: tableData(groupMonth, groupRenewalMonth),
        year: tableData(groupYear, groupRenewalYear),
      };

      const personalObj = await getPersonalData(options);
      setGroupTableData(subtractPersonalFromGroup(personalObj, groupObj));
    } catch (err) {
      toast.error(`${err} || Data Fetching Failed`);
    } finally {
      setLoading(false);
    }
  }

  useAbortableEffect(
    (signal) => {
      if (collection === "Perosnal_Collection") {
        getPersonalData({ signal });
      } else {
        getGroupData({ signal });
      }
    },
    [AgentId, collection, today]
  );

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

export default Homepage;
