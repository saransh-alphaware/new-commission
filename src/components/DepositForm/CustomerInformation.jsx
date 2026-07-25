import { useEffect, useState } from "react";
import { SectionCard } from "../SectionCard";
import { CommonInput } from "../CommonInput";
import CustomerIdAndNameSearch from "../CustomerIdAndNameSearch";
import { getServerData } from "../../config/apiRequest";
import { useAbortableEffect } from "../../hooks/useAbortableEffect";

const CustomerInformation = ({
  customerData,
  setCustomerData,
  savingData,
  selectedBranch,
  setSelectedBranch,
}) => {
  const [customerName, setCustomerName] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [branchOptions, setBranchOptions] = useState([]);

  const fetchBranches = async (options) => {
    let resBranchesOptions = await getServerData(
      "offices",
      {
        pageSize: 1000,
      },
      options
    );
    if (resBranchesOptions?.cancelled) {
      return;
    }
    const branchOptionsFetchedData = resBranchesOptions?.data?.data;
    const branchOptionsMap = branchOptionsFetchedData?.map((optionValue) => ({
      value: optionValue?.id,
      label: optionValue?.name,
      branchCode: optionValue?.branchCode,
    }));
    setSelectedBranch(branchOptionsMap?.[0]);
    setBranchOptions(branchOptionsMap || []);
  };

  useAbortableEffect((signal) => {
    fetchBranches({ signal });
  }, []);

  useEffect(() => {
    if (customerData?.id) {
      setSelectedBranch({
        value: customerData?.customerOfficeDetails?.id || null,
        label: customerData?.customerOfficeDetails?.name || null,
        branchCode: customerData?.customerOfficeDetails?.branchCode || null,
      });
    }
  }, [customerData?.id]);

  return (
    <SectionCard title="Customer Information">
      <CustomerIdAndNameSearch
        customerId={customerId}
        setCustomerId={setCustomerId}
        customerName={customerName}
        setCustomerName={setCustomerName}
        customerData={customerData}
        setCustomerData={setCustomerData}
        mode={"create"}
      />
      <CommonInput
        label="Category"
        placeholder="Enter Category"
        value={customerData?.category || ""}
        disabled
      />
      <CommonInput
        label="Email"
        placeholder="Enter Email"
        value={customerData?.email || ""}
        disabled
      />
      <CommonInput
        label="Gender"
        placeholder="Enter Gender"
        value={customerData?.gender || ""}
        disabled
      />
      <CommonInput
        label="Mobile"
        placeholder="Enter mobile"
        value={customerData?.mobileNumber || ""}
        disabled
      />
      <div className="flex flex-col gap-1">
        <label className="text-xs sm:text-sm font-semibold text-black/70 dark:text-white/70">
          Select Branch <span className="text-red-600 dark:text-red-400">*</span>
        </label>
        <select
          className="border border-black/20 dark:border-white/20 rounded-lg px-3 py-2 w-full text-sm sm:text-base focus:ring-2 focus:ring-brand focus:outline-none bg-white dark:bg-white/5 text-black dark:text-white cursor-pointer"
          onChange={(e) => {
            const selectedBanch = branchOptions?.find(
              (data) => data?.value === e?.target?.value
            );
            setSelectedBranch(selectedBanch);
          }}
          value={selectedBranch?.value}
        >
          {branchOptions?.map((branch) => (
            <option key={branch.value} value={branch.value} className="bg-white dark:bg-dark-bg text-black dark:text-white">
              {branch.label}
            </option>
          ))}
        </select>
      </div>

      {!customerData?.isMinor && (
        <>
          <CommonInput
            label="Saving Account Number"
            placeholder="Enter Saving Account Number"
            value={savingData?.accountNumber || ""}
            disabled
          />
          <CommonInput
            label="Balance"
            placeholder="Enter Balance"
            value={savingData?.balance || "0"}
            disabled
          />
        </>
      )}
    </SectionCard>
  );
};

export default CustomerInformation;

