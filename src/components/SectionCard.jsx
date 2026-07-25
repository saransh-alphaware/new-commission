export function SectionCard({ title, children }) {
  return (
    <div className="bg-white dark:bg-dark-bg shadow-sm rounded-xl border border-black/10 dark:border-white/10 p-4 sm:p-5">
      {title && (
        <h2 className="text-base sm:text-lg font-bold text-black dark:text-white mb-3 sm:mb-4 border-b border-black/10 dark:border-white/10 pb-2">
          {title}
        </h2>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {children}
      </div>
    </div>
  );
}

