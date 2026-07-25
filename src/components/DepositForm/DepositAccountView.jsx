import { useState } from "react";
import { useLocation } from "react-router-dom";
import { formatUserDate } from "../../utils/dateUtil";
import { getServerData } from "../../config/apiRequest";
import { useAbortableEffect } from "../../hooks/useAbortableEffect";
import { toast } from "sonner";
import LoaderSpinner from "../LoaderSpinner";

const ViewField = ({ label, value }) => {
  return (
    <div className="flex flex-col space-y-1">
      <span className="text-xs font-semibold text-black/60 dark:text-white/60">{label}</span>
      <span className="border-b border-black/10 dark:border-white/10 pb-1 text-sm font-semibold text-black dark:text-white">
        {String(value || "-").replace(/_/g, " ")}
      </span>
    </div>
  );
};

export default function DepositAccountView() {
  const { state } = useLocation();
  const [loading, setLoading] = useState(false);
  const [bodyData, setBodyData] = useState([]);

  const getAccountData = async (endpoint, options) => {
    setLoading(true);
    let response = await getServerData(endpoint, null, options);
    if (response?.cancelled) {
      setLoading(false);
      return;
    }
    if (response?.value) {
      if (response?.status === 200 || response?.status === 201) {
        let transactionData = response?.data?.data;
        setBodyData(transactionData);
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

  useAbortableEffect((signal) => {
    if (state?.endpoint) {
      getAccountData(state.endpoint, { signal });
    }
  }, [state?.endpoint]);

  if (loading) {
    return <LoaderSpinner />;
  }

  return (
    <div className="w-full p-3 space-y-4 sm:p-6 text-black dark:text-white">
      <div className="mx-auto max-w-7xl bg-white dark:bg-dark-bg rounded-xl border border-black/10 dark:border-white/10 p-4 shadow-sm sm:p-6">
        <h2 className="mb-6 text-lg font-bold text-black dark:text-white border-b border-black/10 dark:border-white/10 pb-2">
          Account Details
        </h2>

        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
          <ViewField label="Account Number" value={bodyData?.accountNumber} />
          <ViewField label="Customer Name" value={bodyData?.customerName} />
          <ViewField label="Customer ID" value={bodyData?.customerId} />
          {bodyData?.guardianName && (
            <ViewField label="Guardian Name" value={bodyData?.guardianName} />
          )}
          {bodyData?.guardianId && (
            <ViewField
              label="Guardian Customer Id"
              value={bodyData?.guardianId}
            />
          )}
          <ViewField label="Product Name" value={bodyData.productName} />
          <ViewField
            label="Invested Balance"
            value={bodyData?.investedBalance}
          />
          <ViewField label="Current Balance" value={bodyData?.balance || bodyData?.investedBalance || 0} />
          <ViewField
            label="Account Date"
            value={formatUserDate(bodyData?.accountDate)}
          />
          <ViewField label="Rate of Interest" value={bodyData?.interest} />
          <ViewField label="Term" value={bodyData.term} />

          <ViewField label="Branch Name" value={bodyData?.branchName} />
          <ViewField label="Maturity Amount" value={bodyData?.maturityAmount} />
          <ViewField
            label="Maturity Date"
            value={formatUserDate(bodyData?.maturityDate)}
          />
          {bodyData?.maturityWithdrawalDate && (
            <ViewField
              label="Closed Date"
              value={formatUserDate(bodyData?.maturityWithdrawalDate)}
            />
          )}
          <ViewField label="Account Status" value={bodyData?.accountStatus} />
          <ViewField label="Maturity Status" value={bodyData?.maturityStatus} />
          <ViewField label="Payment Mode" value={bodyData?.paymentMode} />
          {bodyData?.toReinvestedAccount && (
            <ViewField
              label="Reinvested To Account"
              value={bodyData?.toReinvestedAccount}
            />
          )}
          {bodyData?.fromReinvestedAccount && (
            <ViewField
              label="Reinvested From Account"
              value={bodyData?.fromReinvestedAccount}
            />
          )}
        </div>
      </div>
      {bodyData?.nomineeResponses?.length > 0 && (
        <div className="mx-auto max-w-7xl bg-white dark:bg-dark-bg rounded-xl border border-black/10 dark:border-white/10 p-4 shadow-sm sm:p-6">
          <h2 className="mb-6 text-lg font-bold text-black dark:text-white border-b border-black/10 dark:border-white/10 pb-2">
            Nominee Details
          </h2>
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
            {bodyData?.nomineeResponses?.map((data, index) => {
              return (
                <div key={index} className="contents">
                  <ViewField label={`(${index + 1}) Nominee Name `} value={data?.nomineeName} />
                  <ViewField
                    label="Birth Date (Age)"
                    value={`${formatUserDate(data?.nomineeBirthDate)} (${data?.nomineeAge})`}
                  />
                  <ViewField label="Gender" value={data?.gender} />
                  <ViewField
                    label="Relation"
                    value={data?.relationMaster?.relation}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
      {bodyData?.jointCustomerDetails && (
        <div className="mx-auto max-w-7xl bg-white dark:bg-dark-bg rounded-xl border border-black/10 dark:border-white/10 p-4 shadow-sm sm:p-6">
          <h2 className="mb-6 text-lg font-bold text-black dark:text-white border-b border-black/10 dark:border-white/10 pb-2">
            Joint Customer Details
          </h2>

          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
            <ViewField
              label="Customer Name"
              value={bodyData?.jointCustomerDetails?.customerName}
            />
            <ViewField
              label="Customer ID"
              value={bodyData?.jointCustomerDetails?.customerId}
            />
            <ViewField
              label="Email"
              value={bodyData?.jointCustomerDetails?.email}
            />
            <ViewField
              label="Mobile Number"
              value={bodyData?.jointCustomerDetails?.mobileNumber}
            />
            <ViewField
              label="Gender"
              value={bodyData?.jointCustomerDetails?.gender}
            />
          </div>
        </div>
      )}
    </div>
  );
}

