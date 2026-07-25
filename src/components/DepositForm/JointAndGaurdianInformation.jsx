import { useState } from "react";
import { SectionCard } from "../SectionCard";
import { CommonInput } from "../CommonInput";
import CustomerIdAndNameSearch from "../CustomerIdAndNameSearch";

const JointAndGaurdianInformation = ({
  jointData,
  setJointData,
  isMinor,
  savingData,
}) => {
  const [jointCustomerName, setJonitCustomerName] = useState("");
  const [jointCustomerId, setJointCustomerId] = useState("");

  return (
    <SectionCard
      title={`${isMinor ? "Gaurdian" : "Joint"} Customer Information`}
    >
      <CustomerIdAndNameSearch
        customerId={jointCustomerId}
        setCustomerId={setJointCustomerId}
        customerName={jointCustomerName}
        setCustomerName={setJonitCustomerName}
        customerData={jointData}
        setCustomerData={setJointData}
        mode={"create"}
      />
      <CommonInput
        label="Category"
        placeholder="Enter Category"
        value={jointData?.category || ""}
        disabled
      />
      <CommonInput
        label="Email"
        placeholder="Enter Email"
        value={jointData?.email || ""}
        disabled
      />
      <CommonInput
        label="Gender"
        placeholder="Enter Gender"
        value={jointData?.gender || ""}
        disabled
      />
      <CommonInput
        label="Mobile"
        placeholder="Enter mobile"
        value={jointData?.mobileNumber || ""}
        disabled
      />

      {isMinor && (
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

export default JointAndGaurdianInformation;
