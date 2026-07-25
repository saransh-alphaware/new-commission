import { useEffect, useState } from "react";
import InputSearch from "./InputSearch";

const ProductNameAndShortNameSearch = ({
  productName,
  setProductName = () => {},
  productShortName,
  setProductShortName = () => {},
  productData,
  setProductData = () => {},
  mode = "create",
  clearFields = () => {},
  endpoint = "fix-deposit-products",
}) => {
  const tableStructure = {
    "Product Name": "name",
    "Short Name": "shortName",
    Interest: "interest",
    "Lock In Period": "lockInPeriod",
    "Lock In Period Frequency": "lockInPeriodFrequency",
    "Interest Posting Period": "interestPostingPeriod",
  };
  const productShortNameField = {
    endpoint: {
      start: `${endpoint}/search-by-shortName/`,
      end: "",
    },
    label: "Product Short Name",
    type: "text",
    placeholder: "Search product short name",
    required: true,
    unique: {
      "Short Name": "shortName",
    },
  };
  const productNameField = {
    endpoint: {
      start: `${endpoint}/search-by-name/`,
      end: "",
    },
    label: "Product Name",
    type: "text",
    placeholder: "Search product name",
    required: true,
    unique: {
      "Short Name": "shortName",
    },
  };
  const [lastFocused, setLastFocused] = useState("");

  useEffect(() => {
    if (!productData) return;
    setProductName(productData.name || "");
    setProductShortName(productData.shortName || "");
  }, [productData?.shortName, productData?.name]);

  useEffect(() => {
    if (
      !productShortName &&
      productShortName?.length === 0 &&
      mode === "create"
    ) {
      setProductName("");
      setProductData(undefined);
      clearFields();
    }
  }, [productShortName]);

  useEffect(() => {
    if (!productName && productName?.length === 0 && mode === "create") {
      setProductShortName("");
      setProductData(undefined);
      clearFields();
    }
  }, [productName]);

  return (
    <>
      <InputSearch
        field={productNameField}
        inputValue={productName || ""}
        setInputValue={setProductName}
        mode={
          lastFocused === "Product Short Name" && productShortName
            ? "view"
            : mode
        }
        tableStructure={tableStructure}
        setSelectedData={setProductData}
        setLastFocused={setLastFocused}
      />
      <InputSearch
        field={productShortNameField}
        inputValue={productShortName || ""}
        setInputValue={setProductShortName}
        mode={lastFocused === "Product Name" && productName ? "view" : mode}
        tableStructure={tableStructure}
        setSelectedData={setProductData}
        setLastFocused={setLastFocused}
      />
    </>
  );
};

export default ProductNameAndShortNameSearch;

