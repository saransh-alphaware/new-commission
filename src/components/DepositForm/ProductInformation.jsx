import { useEffect, useState } from "react";
import { SectionCard } from "../SectionCard";
import { CommonInput } from "../CommonInput";
import ProductNameAndShortNameSearch from "../ProductNameAndShortNameSearch";

const endpoint = {
  RECURRING_DEPOSIT_ACCOUNT: "recurring-product-service",
  FIX_ACCOUNT: "fix-deposit-products",
  DDS_ACCOUNT: "daily-deposit-scheme-products",
  MIP_ACCOUNT: "monthly-income-product",
};

const ProductInformation = ({
  productData,
  setProductData,
  accountType,
}) => {
  const [productName, setProductName] = useState("");
  const [productShortName, setProductShortName] = useState("");
  useEffect(() => {
    setProductName(null);
    setProductShortName(null);
    setProductData(null);
  }, [accountType]);
  return (
    <SectionCard key={"product"} title="Product Details">
      {/* <div className="flex flex-col gap-1">
        <label className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
          Select Account: <span className="text-red-600">*</span>
        </label>
        <select
          value={accountType}
          onChange={(e) => {
            setAccountType(e.target.value);
          }}
          className="border border-gray-300 dark:border-gray-600 rounded-lg 
          px-3 py-2 w-full 
          text-sm sm:text-base
          focus:ring-2 focus:ring-indigo-500 focus:outline-none 
          dark:bg-gray-900 dark:text-white"
        >
          <option value="FIX_ACCOUNT">FD ACCOUNT</option>
          <option value="MIP_ACCOUNT">MIP ACCOUNT</option>
          <option value="RECURRING_DEPOSIT_ACCOUNT">RD ACCOUNT</option>
          <option value="DDS_ACCOUNT">DDS ACCOUNT</option>
        </select>
      </div> */}
      <ProductNameAndShortNameSearch
        productName={productName}
        productShortName={productShortName}
        productData={productData}
        setProductShortName={setProductShortName}
        setProductName={setProductName}
        setProductData={setProductData}
        endpoint={endpoint?.[accountType]}
        mode={"create"}
      />
      <CommonInput
        label="Interest(%)"
        placeholder="Enter Interest"
        value={productData?.interest || ""}
        disabled
      />
      <CommonInput
        label="Term"
        placeholder="Enter Term"
        value={productData?.term || ""}
        disabled
      />
      <CommonInput
        label="Term Period"
        placeholder="Enter Term Period"
        value={productData?.periodType || ""}
        disabled
      />
      <CommonInput
        label="Lock In Period"
        placeholder="Enter Lock In Period"
        value={productData?.lockInPeriod || ""}
        disabled
      />
      <CommonInput
        label="Lock In Period Frequency"
        placeholder="Enter Lock In Period Frequency"
        value={productData?.lockInPeriodFrequency || ""}
        disabled
      />
      <CommonInput
        label="Interest Posting Period"
        placeholder="Enter Interest Posting Period"
        value={productData?.interestPostingPeriod || ""}
        disabled
      />
      <CommonInput
        label="Minimum Opening Balance"
        placeholder="Enter Minimum Opening Balance"
        value={
          productData?.minimumDepositAmmount ||
          productData?.minimumOpeningBalance ||
          ""
        }
        disabled
      />
    </SectionCard>
  );
};

export default ProductInformation;
