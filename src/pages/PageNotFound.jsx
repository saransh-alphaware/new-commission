import { Link } from "react-router-dom";
import { MdArrowBack, MdOutlineErrorOutline } from "react-icons/md";

const PageNotFound = ({ agentNotFound }) => {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 py-12 bg-white dark:bg-dark-bg text-black dark:text-white transition-colors duration-300">
      <div className="text-center max-w-lg mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand/20 dark:border-cyan-400/20 text-xs font-bold text-brand dark:text-cyan-400 bg-brand/10 dark:bg-cyan-400/10">
          <span className="w-2 h-2 rounded-full bg-brand dark:bg-cyan-400 animate-pulse"></span>
          <span>404 Error</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none text-black dark:text-white">
          {agentNotFound ? "Agent Not Found" : "Page Not Found"}
        </h1>
        <p className="text-black/60 dark:text-white/60 text-base leading-relaxed">
          {agentNotFound
            ? "We couldn't locate the requested agent details. Please contact your system administrator for assistance."
            : "Sorry, the page you are looking for doesn't exist, has been removed, or is temporarily unavailable."}
        </p>
        <div className="pt-4 flex items-center justify-center">
          {!agentNotFound ? (
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-brand hover:bg-brand/90 active:scale-95 text-white font-semibold shadow-lg shadow-brand/10 hover:shadow-brand/20 transition-all cursor-pointer"
            >
              <MdArrowBack className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </Link>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 font-semibold text-sm">
              <MdOutlineErrorOutline className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>Kindly contact Admin for assistance</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageNotFound;
