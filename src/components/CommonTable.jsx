import ActionDropDown from "./ActionDropDown";
import { nanoid } from "../utils/nanoid";

const CommonTable = ({
  headItems,
  bodyData,
  actions,
  totalPages,
  isPagination,
  currentPage,
  limit,
  setPageLimit,
  setCurrentPage,
  onRowClick,
  loading,
}) => {
  const pageOptions = [
    { label: 10, value: 10 },
    { label: 20, value: 20 },
    { label: 30, value: 30 },
    { label: 40, value: 40 },
    { label: 50, value: 50 },
  ];

  const handlePerPageLimitChange = (event) => {
    const newValue = parseInt(event.target.value);
    setPageLimit(newValue);
  };

  return (
    <div className="overflow-x-auto bg-white font-sans md:table-fixed lg:table-fixed dark:bg-dark-bg text-black dark:text-white">
      <table className="table-auto w-full p-4">
        <thead className="bg-gray-100 sticky top-0 dark:bg-dark-bg">
          <tr>
            {headItems?.map((head) => (
              <td
                key={nanoid()}
                className="text-xs font-bold text-white p-2 bg-brand border dark:border-white/20"
              >
                {head}
              </td>
            ))}
            {actions && (
              <td className="text-xs font-bold text-white p-2 bg-brand border dark:border-white/20">
                Actions
              </td>
            )}
          </tr>
        </thead>

        <tbody>
          {/* ✅ SKELETON LOADING */}
          {loading ? (
            Array.from({ length: 10 }).map(() => (
              <tr key={nanoid()} className="animate-pulse">
                {headItems?.map(() => (
                  <td
                    key={nanoid()}
                    className="border border-gray-300 px-2 py-2 dark:border-white/20"
                  >
                    <div className="h-3 bg-gray-300 rounded dark:bg-white/10" />
                  </td>
                ))}
                {actions && (
                  <td className="border border-gray-300 px-2 py-2 dark:border-white/20">
                    <div className="h-3 bg-gray-300 rounded dark:bg-white/10" />
                  </td>
                )}
              </tr>
            ))
          ) : bodyData?.length !== 0 ? (
            bodyData?.map((body) => {
              const headKeys = headItems?.map((item) =>
                item?.toLowerCase()?.replace(/\s+/g, "")
              );

              const filteredBody = Object.keys(body)
                .filter((key) =>
                  headKeys?.includes(key?.toLowerCase()?.replace(/\s+/g, ""))
                )
                .reduce((obj, key) => {
                  obj[key] = String(body[key]).replace(/_/g, " ");
                  return obj;
                }, {});

              const headData = Object.values(filteredBody);

              return (
                <tr
                  key={nanoid()}
                  onClick={() => onRowClick?.(body)}
                  className={`text-xs text-black even:bg-gray-50 hover:bg-gray-200 dark:text-white dark:even:bg-white/5 dark:hover:bg-white/10 ${
                    onRowClick ? "cursor-pointer" : ""
                  }`}
                  style={!actions ? { height: "40px" } : null}
                >
                  {headData?.map((head) => (
                    <td
                      key={nanoid()}
                      className="border border-gray-300 px-2 py-1 dark:border-white/20"
                    >
                      {head}
                    </td>
                  ))}
                  {actions && (
                    <td className="flex border justify-center items-center border-gray-300 px-2 py-1 dark:border-white/20">
                      <ActionDropDown actions={actions} entityData={body} />
                    </td>
                  )}
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={(headItems?.length || 0) + (actions ? 1 : 0)}
                className="py-4 text-center dark:text-white"
              >
                No Data Found
              </td>
            </tr>
          )}

          {/* PAGINATION */}
          {isPagination && !loading && (
            <tr className="bg-white printRow dark:bg-dark-bg border-t border-black/10 dark:border-white/10">
              <td colSpan={(headItems?.length || 0) + (actions ? 1 : 0)} className="py-3 px-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  {/* Left Side: Navigation Buttons & Page Info */}
                  <div className="flex items-center space-x-2 select-none">
                    <button
                      type="button"
                      onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0}
                      className="px-3 py-1.5 font-semibold text-white bg-brand hover:bg-brand/90 disabled:bg-black/10 dark:disabled:bg-white/10 disabled:text-black/40 dark:disabled:text-white/40 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed focus:outline-none"
                    >
                      Previous
                    </button>

                    <span className="font-medium text-black/70 dark:text-white/70 px-1">
                      Page <strong className="text-black dark:text-white font-bold">{currentPage + 1}</strong> of <strong className="text-black dark:text-white font-bold">{totalPages || 1}</strong>
                    </span>

                    <input
                      className="w-12 py-1 px-1 text-center font-medium border border-black/20 dark:border-white/20 rounded-lg bg-white dark:bg-white/5 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-brand"
                      type="number"
                      value={currentPage + 1}
                      onChange={(e) => {
                        const val = Number(e.target.value) - 1;
                        if (!isNaN(val) && val >= 0 && val < totalPages) {
                          setCurrentPage(val);
                        }
                      }}
                      min="1"
                      max={totalPages}
                    />

                    <button
                      type="button"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage + 1 >= totalPages}
                      className="px-3 py-1.5 font-semibold text-white bg-brand hover:bg-brand/90 disabled:bg-black/10 dark:disabled:bg-white/10 disabled:text-black/40 dark:disabled:text-white/40 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed focus:outline-none"
                    >
                      Next
                    </button>
                  </div>

                  {/* Right Side: Per Page Limit */}
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-black/70 dark:text-white/70">
                      Per Page:
                    </span>
                    <select
                      value={limit}
                      onChange={handlePerPageLimitChange}
                      className="px-2.5 py-1 text-xs font-medium border border-black/20 dark:border-white/20 rounded-lg bg-white dark:bg-white/5 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer"
                    >
                      {pageOptions?.map((option) => (
                        <option value={option.value} key={option.value} className="bg-white dark:bg-dark-bg text-black dark:text-white">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

  );
};

export default CommonTable;



