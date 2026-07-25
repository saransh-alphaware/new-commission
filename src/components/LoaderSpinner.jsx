const LoaderSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-87.5 w-full py-12 select-none">
      <div className="w-14 h-14 rounded-full border-4 border-black/10 dark:border-white/10 border-t-brand dark:border-t-cyan-400 animate-spin" />
      <h6 className="text-[15px] font-semibold text-black dark:text-white mt-3">
        Please Wait
      </h6>
    </div>
  );
};

export default LoaderSpinner;