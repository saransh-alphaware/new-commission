import { toast } from "sonner";
import { formatUserDate } from "../utils/dateUtil";
import { FaDownload } from "react-icons/fa";

const RangeDateSearch = ({
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  getSearchData,
  toDateValidation = {
    min: undefined,
    max: undefined,
  },
  fromDateValidation = {
    min: undefined,
    max: undefined,
  },
  loading,
  type = "search",
}) => {
  function handleSearch() {
    if (fromDate && toDate) {
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;

      if (toDateValidation?.max && to && new Date(toDateValidation.max) < to) {
        toast.warning(
          `To date cannot be after Date:${formatUserDate(
            toDateValidation.max
          )}.`
        );
        return;
      }
      if (toDateValidation?.min && to && new Date(toDateValidation.min) > to) {
        toast.warning(
          `To date cannot be before Date:${formatUserDate(
            toDateValidation.min
          )}.`
        );
        return;
      }
      if (
        fromDateValidation?.max &&
        from &&
        new Date(fromDateValidation.max) < from
      ) {
        toast.warning(
          `From date cannot be after Date:${formatUserDate(
            fromDateValidation.max
          )}.`
        );
        return;
      }
      if (
        fromDateValidation?.min &&
        from &&
        new Date(fromDateValidation.min) > from
      ) {
        toast.warning(
          `From date cannot be before Date:${formatUserDate(
            fromDateValidation.min
          )}.`
        );
        return;
      }

      if (from && to && from > to) {
        toast.warning("From date cannot be after To date.");
        return;
      }
      getSearchData();
    } else {
      toast.warning("Please Select From date and To date.");
    }
  }

  return (
    <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0 items-start sm:items-center w-full text-black dark:text-white">
      <div className="flex flex-col w-full sm:w-auto">
        <label className="text-sm font-medium text-black/80 dark:text-white/80 mb-1">
          From Date :
        </label>
        <input
          type="date"
          className="w-full sm:w-auto px-3 py-1.5 text-sm border border-black/20 dark:border-white/20 rounded-lg bg-white dark:bg-white/5 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-brand"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          max={fromDateValidation?.max ? fromDateValidation?.max : undefined}
          min={fromDateValidation?.min ? fromDateValidation?.min : undefined}
        />
      </div>
      <div className="flex flex-col w-full sm:w-auto">
        <label className="text-sm font-medium text-black/80 dark:text-white/80 mb-1">
          To Date :
        </label>
        <input
          type="date"
          className="w-full sm:w-auto px-3 py-1.5 text-sm border border-black/20 dark:border-white/20 rounded-lg bg-white dark:bg-white/5 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-brand"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          max={toDateValidation?.max ? toDateValidation?.max : undefined}
          min={toDateValidation?.min ? toDateValidation?.min : undefined}
        />
      </div>

      <div className="flex flex-col w-full sm:w-auto">
        <label className="text-sm text-transparent opacity-0 mb-1">Search</label>
        {type === "search" && (
          <button
            type="button"
            onClick={handleSearch}
            disabled={loading}
            className={`w-full sm:w-auto px-4 py-1.5 text-sm font-semibold rounded-lg text-white transition-colors ${
              loading
                ? "bg-gray-400 dark:bg-gray-700 cursor-not-allowed"
                : "bg-brand hover:bg-brand/90 cursor-pointer"
            } focus:outline-none`}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        )}
        {type === "download" && (
          <button
            type="button"
            onClick={handleSearch}
            disabled={loading}
            className={`flex items-center justify-center gap-2 w-full sm:w-[300px] px-4 py-1.5 text-sm font-semibold text-white rounded-lg transition-colors ${
              loading
                ? "bg-gray-400 dark:bg-gray-700 cursor-not-allowed"
                : "bg-brand hover:bg-brand/90 cursor-pointer"
            } focus:outline-none`}
          >
            <FaDownload className="hover:text-white" />
            {loading ? "Downloading..." : "Download Upcoming Maturity"}
          </button>
        )}
      </div>
    </div>
  );
};

export default RangeDateSearch;

