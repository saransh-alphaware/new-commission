import { useEffect, useState } from "react";
import InputSearch from "./InputSearch";
const CustomerIdAndNameSearch = ({
  customerId,
  setCustomerId = () => {},
  customerName,
  setCustomerName = () => {},
  customerData,
  setCustomerData = () => {},
  mode = "create",
  clearFields = () => {},
}) => {
  const tableStructure = {
    "Customer ID": "customerId",
    "First Name": "firstName",
    "Middle Name": "middleName",
    "Last Name": "lastName",
    Email: "email",
  };
  const customerNameField = {
    endpoint: {
      start: "customers/search-customers-referred-by-agent?customerName=",
      end: "",
    },
    label: "Customer Name",
    type: "text",
    placeholder: "Search customers name",
    required: true,
    unique: {
      "Customer ID": "customerId",
    },
  };
  const customerIdField = {
    endpoint: {
      start: "customers/search-customers-referred-by-agent?customerId=",
      end: "",
    },
    label: "Customer Id",
    type: "number",
    placeholder: "Search customers id",
    required: true,
    unique: {
      "Customer ID": "customerId",
    },
  };
  const [lastFocused, setLastFocused] = useState("");
  useEffect(() => {
    if (!customerData) return;
    setCustomerName(customerData?.customerName || "");
    setCustomerId(customerData?.customerId || "");
  }, [customerData?.customerName, customerData?.customerId]);
  useEffect(() => {
    if (!customerName && customerName?.length === 0 && mode === "create") {
      setCustomerId("");
      setCustomerData(undefined);
      clearFields();
    }
  }, [customerName]);
  useEffect(() => {
    if (!customerId && customerId?.length === 0 && mode === "create") {
      setCustomerName("");
      setCustomerData(undefined);
      clearFields();
    }
  }, [customerId]);
  return (
    <>
      <InputSearch
        field={customerNameField}
        inputValue={customerName || ""}
        setInputValue={setCustomerName}
        mode={lastFocused === "Customer Id" && customerId ? "view" : mode}
        tableStructure={tableStructure}
        setSelectedData={setCustomerData}
        setLastFocused={setLastFocused}
      />
      <InputSearch
        field={customerIdField}
        inputValue={customerId || ""}
        setInputValue={setCustomerId}
        mode={lastFocused === "Customer Name" && customerName ? "view" : mode}
        tableStructure={tableStructure}
        setSelectedData={setCustomerData}
        setLastFocused={setLastFocused}
      />
    </>
  );
};
export default CustomerIdAndNameSearch;
