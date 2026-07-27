import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import MyMembersTree from "../components/MyMembersTree";
import { getCurrentDate, getDateByDifference } from "../utils/dateUtil";
import { getServerData } from "../config/apiRequest";
import LoaderSpinner from "../components/LoaderSpinner";
import { toast } from "sonner";
import RangeDateSearch from "../components/RangeDateSearch";
import CommonTable from "../components/CommonTable";
import { useAbortableEffect } from "../hooks/useAbortableEffect";
import {
  normalizeAccountCountedData,
  normalizeRenewalBusinessData,
} from "../utils/responseNormalizer";

const MyMembers = () => {
  const { agentId, userDetails } = useContext(AuthContext);
  const [agentDatabaseId, setAgentDatabaseId] = useState(agentId);
  const [searchQueryTrigger, setSearchQueryTrigger] = useState(0);
  const [fromDate, setFromDate] = useState(getDateByDifference(365));
  const [loading, setLoading] = useState(false);
  const [toDate, setToDate] = useState(getCurrentDate());
  const [myMembersData, setMyMembersData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedAgentData, setSelectedAgentData] = useState(null);

  const tableHeading = [
    "Agent",
    "Level",
    "Collection",
    "DDS",
    "RD",
    "MIP",
    "FD",
    "Total Collection",
  ];

  const getTotalMembersCount = async () => {
    let response = await getServerData(
      `agents/${agentDatabaseId}/child-agent-count`
    );
    if (response?.value) {
      if (response?.status === 200 || response?.status === 201) {
        setTotalCount(response?.data?.data || 0);
      } else {
        setTotalCount(0);
        toast.error(
          `${response?.message || ""} || Data Fetching Failed`
        );
      }
    } else {
      setTotalCount(0);
      toast.error(
        `${response?.message || ""} || Data Fetching Failed`
      );
    }
  };

  async function getDashboardData(
    creationDate,
    endDate,
    newUrl,
    renewUrl,
    flag = false,
    options
  ) {
    const calculateAccountDetailsSum = (accountData) => {
      return (
        Object?.values(accountData?.details || {})?.reduce(
          (acc, val) => acc + val,
          0
        ) || 0
      );
    };

    try {
      const newResponse = await getServerData(
        `agents/${newUrl}`,
        {
          creationDate: creationDate,
          endDate: endDate,
        },
        options
      );

      if (newResponse?.cancelled) {
        return {};
      }

      const normNew = normalizeAccountCountedData(newResponse?.data);

      const ddsValue = calculateAccountDetailsSum(normNew?.DDS_ACCOUNT);
      const rdValue = calculateAccountDetailsSum(
        normNew?.RECURRING_DEPOSIT_ACCOUNT
      );
      const fdValue = calculateAccountDetailsSum(normNew?.FIX_ACCOUNT);
      const mipValue = calculateAccountDetailsSum(normNew?.MIP_ACCOUNT);

      const getRenewData = async (url, dateParams) => {
        const renewResponse = await getServerData(
          `agents/${url}?${dateParams}`,
          null,
          options
        );
        if (renewResponse?.cancelled) {
          return {};
        }
        if (flag) {
          const normRenew = normalizeRenewalBusinessData(renewResponse?.data);
          const calculateRenewSum = (accountType) => {
            return (
              Object?.keys(
                normRenew?.ACCOUNT_AND_PRODUCT_DETAILS?.[accountType] || {}
              )
                ?.map(
                  (item) =>
                    normRenew?.ACCOUNT_AND_PRODUCT_DETAILS?.[accountType]?.[
                      item
                    ]?.totalAmount || 0
                )
                ?.reduce((acc, val) => acc + val, 0) || 0
            );
          };

          const personalRenewalDDS = calculateRenewSum("DAILY_DEPOSIT");
          const personalRenewalRD = calculateRenewSum("RECURRING_DEPOSIT");
          const personalRenewalMIP = calculateRenewSum("MONTHLY_INCOME");
          const personalRenewalFD = calculateRenewSum("FIXED_DEPOSIT");

          return {
            personalRenewalDDS,
            personalRenewalRD,
            personalRenewalMIP,
            personalRenewalFD,
          };
        } else {
          return normalizeAccountCountedData(renewResponse?.data);
        }
      };

      let result;

      if (flag) {
        const { personalRenewalDDS, personalRenewalRD } = await getRenewData(
          renewUrl,
          `startDate=${creationDate}&endDate=${endDate}`
        );

        result = {
          dds: ddsValue + (personalRenewalDDS || 0),
          rd: rdValue + (personalRenewalRD || 0),
          mip: mipValue,
          fd: fdValue,
          totalCollection:
            ddsValue +
            (personalRenewalDDS || 0) +
            rdValue +
            (personalRenewalRD || 0) +
            mipValue +
            fdValue,
        };
      } else {
        const normRenewGroup = await getRenewData(
          renewUrl,
          `startDate=${creationDate}&endDate=${endDate}`
        );
        const reddsValue = calculateAccountDetailsSum(
          normRenewGroup?.DDS_ACCOUNT
        );
        const rerdValue = calculateAccountDetailsSum(
          normRenewGroup?.RECURRING_DEPOSIT_ACCOUNT
        );

        result = {
          dds: ddsValue + reddsValue,
          rd: rdValue + rerdValue,
          mip: mipValue,
          fd: fdValue,
          totalCollection:
            ddsValue + reddsValue + rdValue + rerdValue + mipValue + fdValue,
        };
      }

      return result;
    } catch (error) {
      toast.error(`Error fetching data: ${error.message || error}`);
      console.error("Error fetching dashboard data:", error);
      return null;
    }
  }

  const getMyMembersAccount = async (fromDate, toDate, options) => {
    try {
      setLoading(true);
      const newPersonalURL = `${agentDatabaseId}/account-counted`;
      const renewalPersonalURL = `${agentDatabaseId}/renewal-business-byDate`;
      const newGroupURL = `${agentDatabaseId}/account-summary-child-fetchv2`;
      const renewalGroupURL = `${agentDatabaseId}/renewal-business-byDate-and-children-fetch-v3`;
      const personal = await getDashboardData(
        fromDate,
        toDate,
        newPersonalURL,
        renewalPersonalURL,
        true,
        options
      );
      const group = await getDashboardData(
        fromDate,
        toDate,
        newGroupURL,
        renewalGroupURL,
        false,
        options
      );
      setMyMembersData([
        {
          agent:
            selectedAgentData?.name ||
            `${userDetails?.agentUserName} (${userDetails?.agentNumber})`,
          level:
            selectedAgentData?.title ||
            `(${userDetails?.agentRank?.rank}) ${userDetails?.agentRank?.rankName}`,
          collection: "Personal Collection",
          dds: personal?.dds || 0,
          rd: personal?.rd || 0,
          mip: personal?.mip || 0,
          fd: personal?.fd || 0,
          totalCollection: personal?.totalCollection || 0,
        },
        {
          agent:
            selectedAgentData?.name ||
            `${userDetails?.agentUserName} (${userDetails?.agentNumber})`,
          level:
            selectedAgentData?.title ||
            `(${userDetails?.agentRank?.rank}) ${userDetails?.agentRank?.rankName}`,
          collection: "Group Collection",
          dds: group?.dds || 0,
          rd: group?.rd || 0,
          mip: group?.mip || 0,
          fd: group?.fd || 0,
          totalCollection: group?.totalCollection || 0,
        },
      ]);
    } catch (error) {
      toast.error(`${error} || Data Fetching Failed`);
    } finally {
      setLoading(false);
    }
  };

  useAbortableEffect(
    (signal) => {
      getMyMembersAccount(fromDate, toDate, { signal });
    },
    [agentDatabaseId, searchQueryTrigger]
  );

  useEffect(() => {
    getTotalMembersCount();
  }, [agentDatabaseId]);

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
          toDateValidation={{ max: getCurrentDate() }}
          fromDateValidation={{ max: getCurrentDate() }}
        />
      </div>

      <div className="flex justify-end w-full text-black dark:text-white mt-2 text-sm font-medium">
        Total Number of Agents :{" "}
        <strong className="ml-1 font-bold">{totalCount}</strong>
      </div>

      {loading ? (
        <div className="relative mt-14 mb-10">
          <LoaderSpinner />
        </div>
      ) : (
        <div className="mt-4">
          <CommonTable headItems={tableHeading} bodyData={myMembersData} />
        </div>
      )}

      <MyMembersTree
        agentDatabaseId={agentDatabaseId}
        setAgentDatabaseId={setAgentDatabaseId}
        setSelectedAgentData={setSelectedAgentData}
      />
    </div>
  );
};

export default MyMembers;

