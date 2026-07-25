import { useState, useContext } from "react";
import { toast } from "sonner";
import { getCurrentDate } from "../utils/dateUtil";
import { getServerData } from "../config/apiRequest";
import LoaderSpinner from "../components/LoaderSpinner";
import { AuthContext } from "../context/AuthContext";
import RangeDateSearch from "../components/RangeDateSearch";
import { nanoid } from "../utils/nanoid";
import { useAbortableEffect } from "../hooks/useAbortableEffect";

function extractNew(data) {
  let result = {};
  let Total = 0;
  for (let account in data) {
    if (typeof data[account] === "object" && data[account]?.details) {
      const dataArray = Object.values(data[account]?.details);
      const total = dataArray?.reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0
      );
      Total += total;
      Object.assign(result, data[account]?.details);
    }
  }
  result["Total"] = Total;
  return result;
}

function extractRenewal(data) {
  let result = {};
  let Total = 0;
  for (let category in data) {
    for (let product in data[category]) {
      result[product] = data[category][product].totalAmount;
      Total += data[category][product].totalAmount;
    }
  }
  result["Total"] = Total;
  return result;
}

function tableData(personalNew, personalRenewal, groupNew, groupRenewal) {
  const allKeys = new Set([
    ...Object.keys(personalNew),
    ...Object.keys(personalRenewal),
    ...Object.keys(groupNew),
    ...Object.keys(groupRenewal),
  ]);
  const output = {};

  allKeys.forEach((key) => {
    output[key] = [
      personalNew[key] || 0,
      personalRenewal[key] || 0,
      groupNew[key] || 0,
      groupRenewal[key] || 0,
    ];
  });
  return output;
}

function ProductwiseBusiness() {
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState(getCurrentDate());
  const [toDate, setToDate] = useState(getCurrentDate());
  const [productData, setProductData] = useState({});
  const [searchQueryTrigger, setSearchQueryTrigger] = useState(0);
  const { agentId } = useContext(AuthContext);

  const newPersonalURL = `agents/${agentId}/account-counted`;
  const renewalPersonalURL = `agents/${agentId}/renewal-business-byDate`;
  const newGroupURL = `agents/${agentId}/account-summary-child-fetchv2`;
  const renewalGroupURL = `agents/${agentId}/renewal-business-byDate-and-children-fetch-v3`;
  async function getData(startDate, endDate, options) {
    try {
      setLoading(true);
      const [personalNew, personalRenewal, groupNew, groupRenewal] =
        await Promise.all([
          getServerData(
            newPersonalURL,
            {
              creationDate: startDate,
              endDate: endDate,
            },
            options
          ),
          getServerData(
            renewalPersonalURL,
            {
              startDate: startDate,
              endDate: endDate,
            },
            options
          ),
          getServerData(
            newGroupURL,
            {
              creationDate: startDate,
              endDate: endDate,
            },
            options
          ),
          getServerData(
            renewalGroupURL,
            {
              startDate: startDate,
              endDate: endDate,
            },
            options
          ),
        ]);
      
      if(personalNew?.cancelled || personalRenewal?.cancelled || groupNew?.cancelled || groupRenewal?.cancelled){
        setLoading(false);
        return;
      }

      if (personalRenewal?.data?.ACCOUNT_AND_PRODUCT_DETAILS) {
        if (
          personalRenewal?.data?.ACCOUNT_AND_PRODUCT_DETAILS?.MONTHLY_INCOME
        ) {
          delete personalRenewal?.data?.ACCOUNT_AND_PRODUCT_DETAILS
            ?.MONTHLY_INCOME;
        }
        if (personalRenewal?.data?.ACCOUNT_AND_PRODUCT_DETAILS?.FIXED_DEPOSIT) {
          delete personalRenewal?.data?.ACCOUNT_AND_PRODUCT_DETAILS
            ?.FIXED_DEPOSIT;
        }
      }

      if (groupRenewal?.data?.MIP_ACCOUNT) {
        delete groupRenewal?.data?.MIP_ACCOUNT;
      }
      if (groupRenewal?.data?.FIX_ACCOUNT) {
        delete groupRenewal?.data?.FIX_ACCOUNT;
      }

      setProductData(
        tableData(
          extractNew(personalNew?.data),
          extractRenewal(personalRenewal?.data?.ACCOUNT_AND_PRODUCT_DETAILS),
          extractNew(groupNew?.data),
          extractNew(groupRenewal?.data)
        )
      );
    } catch (error) {
      toast.error(`${error?.message || error} || Data Fetching Failed`);
    } finally {
      setLoading(false);
    }
  }

  useAbortableEffect((signal) => {
    getData(fromDate, toDate, { signal });
  }, [searchQueryTrigger]);

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-50 flex justify-center items-center">
          <LoaderSpinner />
        </div>
      )}
      <div
        className={`flex flex-col mx-4 text-black dark:text-white ${
          loading ? "blur-[1px] pointer-events-none" : "blur-none"
        }`}
      >
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
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left rtl:text-right text-gray-500 dark:text-gray-400 border-collapse">
            <thead className="text-xs text-gray-900 dark:text-gray-400">
              <tr>
                <th className="border border-black/10 dark:border-white/20 w-1/5 text-xs p-2 text-center text-white bg-[#1F2766]">
                  Product Name
                </th>
                <th
                  className="border border-black/10 dark:border-white/20 w-1/5 text-xs p-2 text-center text-white bg-[#1F2766]"
                  colSpan={2}
                >
                  Personal Collection
                </th>
                <th
                  className="border border-black/10 dark:border-white/20 w-1/5 text-xs p-2 text-center text-white bg-[#1F2766]"
                  colSpan={2}
                >
                  Group Collection
                </th>
                <th className="border border-black/10 dark:border-white/20 w-1/5 text-xs p-2 text-center text-white bg-[#1F2766]">
                  Total
                </th>
              </tr>
              <tr>
                <th className="border border-black/10 dark:border-white/20 w-1/5 text-xs p-2 text-center text-white bg-[#7681d5]"></th>
                <th className="border border-black/10 dark:border-white/20 w-1/5 text-xs p-2 text-center text-white bg-[#7681d5]">
                  New
                </th>
                <th className="border border-black/10 dark:border-white/20 w-1/5 text-xs p-2 text-center text-white bg-[#7681d5]">
                  Renewal
                </th>
                <th className="border border-black/10 dark:border-white/20 w-1/5 text-xs p-2 text-center text-white bg-[#7681d5]">
                  New
                </th>
                <th className="border border-black/10 dark:border-white/20 w-1/5 text-xs p-2 text-center text-white bg-[#7681d5]">
                  Renewal
                </th>
                <th className="border border-black/10 dark:border-white/20 w-1/5 text-xs p-2 text-center text-white bg-[#7681d5]"></th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(productData)?.map(([key, values]) => {
                if (key === "Total") return null;
                return (
                  <tr key={nanoid()} className="bg-white dark:bg-dark-bg">
                    <td className="border border-black/10 dark:border-white/10 text-xs p-2 py-1.5 text-black dark:text-white">
                      {key}
                    </td>
                    <td
                      key={nanoid()}
                      className="border border-black/10 dark:border-white/10 text-xs p-2 py-1.5 text-black dark:text-white text-center"
                    >
                      {values?.[0]}
                    </td>
                    <td
                      key={nanoid()}
                      className="border border-black/10 dark:border-white/10 text-xs p-2 py-1.5 text-black dark:text-white text-center"
                    >
                      {values?.[1]}
                    </td>
                    <td
                      key={nanoid()}
                      className="border border-black/10 dark:border-white/10 text-xs p-2 py-1.5 text-black dark:text-white text-center"
                    >
                      {values?.[2] - values?.[0]}
                    </td>
                    <td
                      key={nanoid()}
                      className="border border-black/10 dark:border-white/10 text-xs p-2 py-1.5 text-black dark:text-white text-center"
                    >
                      {values?.[3] - values?.[1]}
                    </td>
                    <td
                      key={nanoid()}
                      className="border border-black/10 dark:border-white/10 text-xs p-2 py-1.5 text-black dark:text-white text-center font-medium"
                    >
                      {values?.[3] + values?.[2]}
                    </td>
                  </tr>
                );
              })}
              <tr>
                <td className="border border-black/10 dark:border-white/20 text-xs p-2 py-1.5 text-black dark:text-white bg-[#ebedf9] dark:bg-white/15 font-bold">
                  Total
                </td>
                {productData?.Total && (
                  <>
                    <td
                      key={nanoid()}
                      className="border border-black/10 dark:border-white/20 text-xs p-2 py-1.5 text-black dark:text-white bg-[#ebedf9] dark:bg-white/15 font-bold text-center"
                    >
                      {productData?.Total?.[0]}
                    </td>
                    <td
                      key={nanoid()}
                      className="border border-black/10 dark:border-white/20 text-xs p-2 py-1.5 text-black dark:text-white bg-[#ebedf9] dark:bg-white/15 font-bold text-center"
                    >
                      {productData?.Total?.[1]}
                    </td>
                    <td
                      key={nanoid()}
                      className="border border-black/10 dark:border-white/20 text-xs p-2 py-1.5 text-black dark:text-white bg-[#ebedf9] dark:bg-white/15 font-bold text-center"
                    >
                      {productData?.Total?.[2] - productData?.Total?.[0]}
                    </td>
                    <td
                      key={nanoid()}
                      className="border border-black/10 dark:border-white/20 text-xs p-2 py-1.5 text-black dark:text-white bg-[#ebedf9] dark:bg-white/15 font-bold text-center"
                    >
                      {productData?.Total?.[3] - productData?.Total?.[1]}
                    </td>
                    <td
                      key={nanoid()}
                      className="border border-black/10 dark:border-white/20 text-xs p-2 py-1.5 text-black dark:text-white bg-[#ebedf9] dark:bg-white/15 font-bold text-center"
                    >
                      {productData?.Total?.[3] + productData?.Total?.[2]}
                    </td>
                  </>
                )}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default ProductwiseBusiness;
