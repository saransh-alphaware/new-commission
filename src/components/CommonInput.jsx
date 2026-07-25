export function CommonInput({ placeholder, label, value, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs sm:text-sm font-semibold text-black/70 dark:text-white/70">
        {label} <span className="text-red-600 dark:text-red-400">*</span>
      </label>

      <input
        type="text"
        placeholder={placeholder}
        value={value || ""}
        className="border border-black/20 dark:border-white/20 rounded-lg px-3 py-2 w-full text-sm sm:text-base focus:ring-2 focus:ring-brand focus:outline-none bg-white dark:bg-white/5 text-black dark:text-white disabled:bg-gray-100 dark:disabled:bg-white/10 disabled:opacity-75"
        {...props}
      />
    </div>
  );
}