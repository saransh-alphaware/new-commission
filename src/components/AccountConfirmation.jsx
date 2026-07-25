
const AccountConfirmation = ({
  message = "Are You Sure You want to Perform This Action?",
  bodyData = {},
}) => {
  return (
    <>
      <h2 className="text-lg font-bold text-black dark:text-white text-center mb-4">{message}</h2>
      {Object.keys(bodyData).length > 0 && (
        <div className="border border-black/10 dark:border-white/10 rounded-xl p-4 text-black dark:text-white bg-white dark:bg-white/5 shadow-sm">
          <div className="flex flex-col md:flex-row w-full gap-4">
            <div className={`flex flex-col space-y-4 ${bodyData?.anotherRow ? "w-full md:w-1/2" : "w-full"}`}>
              {Object.entries(bodyData).map(
                ([key, value]) =>
                  value &&
                  key !== "anotherRow" && (
                    <div key={key} className="flex flex-col">
                      <label className="text-xs font-semibold text-black/60 dark:text-white/60">
                        {key.replace(/([A-Z])/g, " $1").toUpperCase()}
                      </label>
                      <span className="text-black dark:text-white font-semibold border-b border-black/10 dark:border-white/10 pb-1 text-sm">
                        {typeof value === "object"
                          ? JSON.stringify(value)
                          : value || "N/A"}
                      </span>
                    </div>
                  )
              )}
            </div>
            {/* Second Row (anotherRow) */}
            {bodyData?.anotherRow && (
              <div className="flex flex-col space-y-4 w-full md:w-1/2">
                {Object.entries(bodyData?.anotherRow).map(
                  ([key, value]) =>
                    value && (
                      <div key={key} className="flex flex-col">
                        <label className="text-xs font-semibold text-black/60 dark:text-white/60">
                          {key.replace(/([A-Z])/g, " $1").toUpperCase()}
                        </label>
                        <span className="text-black dark:text-white font-semibold border-b border-black/10 dark:border-white/10 pb-1 text-sm">
                          {typeof value === "object"
                            ? JSON.stringify(value)
                            : value || "N/A"}
                        </span>
                      </div>
                    )
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AccountConfirmation;



