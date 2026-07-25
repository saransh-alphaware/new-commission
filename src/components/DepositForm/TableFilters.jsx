import { formatUserDate } from "../../utils/dateUtil";
import { getServerData } from "../../config/apiRequest";
import { useAbortableEffect } from "../../hooks/useAbortableEffect";
import { toast } from "sonner";

export default function TableFilters({
  setFilteredData,
  depositType,
  setTotalPages,
  currentPage,
  pageLimit,
  filters,
  setFilters,
  loading,
  setLoading,
}) {
  // Fixed params that are always sent but not user-editable
  const fixedParams = {
    depositType: depositType,
    pageNumber: currentPage || 0,
    pageSize: pageLimit || 10,
    sortDirection: "ASC",
  };

  /* ------------------ Check if any filter has value ------------------ */
  const hasActiveFilters = () => {
    return Object.values(filters).some((value) => value !== "");
  };

  /* ------------------ API Call ------------------ */
  const fetchDepositAccounts = async (options) => {
    setLoading(true);

    const allParams = { ...fixedParams, ...filters };
    const response = await getServerData(
      "agents/get-deposit-accounts",
      allParams,
      options
    );

    if (response?.cancelled) {
      setLoading(false);
      return;
    }

    if (
      response?.value &&
      (response.status === 200 || response.status === 201)
    ) {
      let transactionData = response?.data?.data;
      let totalCount = response?.data?.totalcount;
      let totalPagesCount = Math.ceil(totalCount / pageLimit).toFixed(0);
      setTotalPages(totalPagesCount);
      const approvedData = transactionData?.map((data) => {
        return {
          accountNumber: data?.accountNumber || " ",
          customerId: data?.customerId || " ",
          customerName: data?.customerName || " ",
          accountDate: data?.accountDate
            ? formatUserDate(data?.accountDate)
            : " ",
          productName: data?.productName || " ",
          investedBalance: data?.productName || " ",
          interest: data?.interest || " ",
          term: data?.term || " ",
          id: data?.id,
        };
      });
      setFilteredData(approvedData || []);
    } else {
      setFilteredData([]);
      toast.error(response?.message || "Data Fetching Failed");
    }
    setLoading(false);
  };

  /* ------------------ Debounced API Call ------------------ */
  useAbortableEffect(
    (signal) => {
      // Only fetch if there's at least one active filter
      if (!hasActiveFilters()) {
        return;
      }

      const handler = setTimeout(() => {
        fetchDepositAccounts({ signal });
      }, 500);

      return () => clearTimeout(handler);
    },
    [filters, currentPage, pageLimit]
  );

  /* ------------------ Event Handlers ------------------ */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      customerName: "",
      productName: "",
      accountNumber: "",
      customerId: "",
      accountDate: "",
    });
    // Clear data when resetting filters
    setFilteredData(null);
  };

  /* ------------------ Styles ------------------ */
  const input =
    "w-full px-3 py-2 border border-black/20 dark:border-white/20 rounded-lg text-sm bg-white dark:bg-white/5 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-brand";

  /* ------------------ UI ------------------ */
  return (
    <div className="bg-white dark:bg-dark-bg p-4 rounded-xl border border-black/10 dark:border-white/10 space-y-4 mt-2 shadow-sm text-black dark:text-white">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
        {/* Account Number */}
        <div className="flex flex-col gap-1">
          <label className="text-xs sm:text-sm font-semibold text-black/70 dark:text-white/70">
            Account Number
          </label>
          <input
            type="number"
            name="accountNumber"
            placeholder="Enter account number"
            value={filters.accountNumber}
            onChange={handleChange}
            className={input}
          />
        </div>

        {/* Customer ID */}
        <div className="flex flex-col gap-1">
          <label className="text-xs sm:text-sm font-semibold text-black/70 dark:text-white/70">
            Customer ID
          </label>
          <input
            type="number"
            name="customerId"
            placeholder="Enter customer ID"
            value={filters.customerId}
            onChange={handleChange}
            className={input}
          />
        </div>

        {/* Customer Name */}
        <div className="flex flex-col gap-1">
          <label className="text-xs sm:text-sm font-semibold text-black/70 dark:text-white/70">
            Customer Name
          </label>
          <input
            type="text"
            name="customerName"
            placeholder="Enter customer name"
            value={filters.customerName}
            onChange={handleChange}
            className={input}
          />
        </div>

        {/* Product Name */}
        <div className="flex flex-col gap-1">
          <label className="text-xs sm:text-sm font-semibold text-black/70 dark:text-white/70">
            Product Name
          </label>
          <input
            type="text"
            name="productName"
            placeholder="Enter product name"
            value={filters.productName}
            onChange={handleChange}
            className={input}
          />
        </div>

        {/* Product Date */}
        <div className="flex flex-col gap-1">
          <label className="text-xs sm:text-sm font-semibold text-black/70 dark:text-white/70">
            Account Date
          </label>
          <input
            type="date"
            name="accountDate"
            value={filters.accountDate}
            onChange={handleChange}
            className={input}
          />
        </div>

        {/* Reset Button */}
        <div className="flex flex-col gap-1">
          <label className="text-xs sm:text-sm font-semibold text-black/70 dark:text-white/70 opacity-0 select-none">
            Reset
          </label>
          <button
            onClick={resetFilters}
            disabled={loading}
            className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700 active:bg-rose-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-rose-600 cursor-pointer focus:outline-none"
          >
            {loading ? "Loading..." : "Reset Filters"}
          </button>
        </div>
      </div>
    </div>
  );
}

