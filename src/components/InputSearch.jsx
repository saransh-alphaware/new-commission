import { useEffect, useMemo, useRef, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { ImCross } from "react-icons/im";
import { getServerData } from "../config/apiRequest";
import ModalMain from "./ModalMain";
import CommonTable from "./CommonTable";
import LoaderSpinner from "./LoaderSpinner";
import { useAbortableEffect } from "../hooks/useAbortableEffect";

function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

const getValueByPath = (obj, path) => {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
};

const InputSearch = ({
  inputValue,
  setInputValue,
  field,
  debounceMs = 500,
  minChars = 2,
  tableStructure,
  setSelectedData = () => {},
  setLastFocused = () => {},
  mode,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [tableData, setTableData] = useState([]);
  const [bodyData, setBodyData] = useState([]);
  const [error, setError] = useState(null);
  const debounced = useDebouncedValue(search?.trim(), debounceMs);
  const skipNextOpenRef = useRef(false);
  const isUserTypingRef = useRef(false);
  const [loading, setLoading] = useState(false);

  const url = useMemo(() => {
    if (!field.endpoint?.start) return "";
    if (debounced?.length < minChars) return "";
    return `${field.endpoint.start}${debounced}${field.endpoint?.end ?? ""}`;
  }, [field.endpoint, debounced, minChars]);

  const tableHeading = Object.keys(tableStructure);

  const getSearchData = async (url, options) => {
    setLoading(true);
    let response = await getServerData(url, null, options);
    if (response?.cancelled) {
      setLoading(false);
      return;
    }
    if (response?.value) {
      if (response?.status === 200 || response?.status === 201) {
        let responseData = response?.data?.data;
        const tableData = responseData?.map((data) => {
          const result = {};
          Object.entries(tableStructure).forEach(([heading, fullPath]) => {
            const pathParts = fullPath.split(".");
            result[heading] = getValueByPath(data, pathParts.join("."));
          });
          return result;
        });
        setError(null);
        setBodyData(responseData);
        setTableData(tableData || []);
      } else {
        setError(`${response?.message || ""} || Data Fetching Failed`);
        setTableData([]);
        setBodyData([]);
      }
    } else {
      setTableData([]);
      setBodyData([]);
      setError(`${response?.message || ""} || Data Fetching Failed`);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (skipNextOpenRef.current) {
      skipNextOpenRef.current = false;
      return;
    }

    const shouldOpen =
      debounced?.length >= minChars &&
      mode !== "view" &&
      isUserTypingRef.current;

    setOpen(shouldOpen);
  }, [debounced, minChars, mode]);

  useAbortableEffect((signal) => {
    if (url) {
      getSearchData(url, { signal });
    }
  }, [url]);

  return (
    <div className="flex flex-col gap-1">
      {open && (
        <ModalMain
          isOpen={open}
          content={
            <>
              <div className="mb-2 font-medium text-black/80 dark:text-white/80">{`Search Input : ${search}`}</div>
              {loading ? (
                <div className="relative mt-14 mb-10 h-20">
                  <LoaderSpinner />
                </div>
              ) : error ? (
                <span className="text-center text-rose-600 dark:text-rose-400 font-semibold">{error}</span>
              ) : (
                <CommonTable
                  headItems={tableHeading}
                  bodyData={tableData}
                  onRowClick={(row) => {
                    const objVal = Object.entries(field?.unique);
                    const rowKey = objVal[0][0];
                    const dataKey = objVal[0][1];
                    const selectedData = bodyData?.filter(
                      (data) => data?.[dataKey] === row?.[rowKey]
                    );
                    isUserTypingRef.current = false;
                    skipNextOpenRef.current = true;

                    setSelectedData(selectedData?.[0]);
                    setOpen(false);
                  }}
                />
              )}
            </>
          }
          setIsOpen={setOpen}
          title={`${field.label} Search`}
        />
      )}
      <label className="text-xs sm:text-sm font-semibold text-black/70 dark:text-white/70">
        {field.label} <span className="text-red-600 dark:text-red-400">*</span>
      </label>
      <div className="relative w-full">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40">
          <FaSearch size={16} />
        </div>
        <input
          type="text"
          value={inputValue || ""}
          onChange={(e) => {
            const val = e.target.value;
            if (field.type === "number") {
              const numericRegex = /^[0-9]*$/;
              if (!numericRegex.test(val)) {
                return;
              }
            }
            isUserTypingRef.current = true;
            setSearch(val);
            setInputValue(val);
          }}
          onFocus={() => setLastFocused(field?.label)}
          placeholder={field.placeholder}
          required={field.required}
          readOnly={mode === "view"}
          disabled={mode === "view"}
          autoComplete="off"
          className="border border-black/20 dark:border-white/20 rounded-lg py-2 px-9 w-full text-sm focus:ring-2 focus:ring-brand focus:outline-none bg-white dark:bg-white/5 text-black dark:text-white"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {inputValue?.length > 0 && mode !== "view" && (
            <button
              onClick={() => {
                isUserTypingRef.current = true;
                setSearch("");
                setInputValue("");
                setSelectedData(null);
              }}
              className="bg-transparent border-none outline-none cursor-pointer text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors"
              title="Clear"
            >
              <ImCross size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InputSearch;

