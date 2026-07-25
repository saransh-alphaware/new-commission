import { useContext, useState } from "react";
import { FaDownload } from "react-icons/fa";
import { toast } from "sonner";
import {
  getCurrentDate,
  getDateByDifference,
  formatUserDate,
} from "../utils/dateUtil";
import { getServerData } from "../config/apiRequest";
import { AuthContext } from "../context/AuthContext";

const AgentWiseBusiness = () => {
  const { agentId } = useContext(AuthContext);
  const [fromDate, setFromDate] = useState(getDateByDifference(30));
  const [toDate, setToDate] = useState(getCurrentDate());
  const [searchLoading, setSearchLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleSearchSubmit = () => {
    if (!fromDate || !toDate) {
      toast.warning("Please Select From date and To date.");
      return false;
    }
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const todayLimit = new Date(getCurrentDate());

    if (from > todayLimit) {
      toast.warning(
        `From date cannot be after Date:${formatUserDate(getCurrentDate())}.`
      );
      return false;
    }
    if (to > todayLimit) {
      toast.warning(
        `To date cannot be after Date:${formatUserDate(getCurrentDate())}.`
      );
      return false;
    }
    if (from > to) {
      toast.warning("From date cannot be after To date.");
      return false;
    }
    return true;
  };

  const exportSelectedToXlsx = async () => {
    if (!handleSearchSubmit()) return;
    setExporting(true);
    setSearchLoading(true);

    const response = await getServerData("reports/agent-business-excel", {
      startDate: fromDate,
      endDate: toDate,
      agentId: agentId,
    });

    if (response?.value) {
      if (response?.status === 200) {
        const responseData = response?.data?.data;
        const base64Data = responseData?.content;
        const mimeType =
          responseData?.fileType || "application/octet-stream";
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length)
          .fill()
          .map((_, i) => byteCharacters.charCodeAt(i));
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });
        // Create download link
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `${formatUserDate(fromDate)} to ${formatUserDate(
          toDate
        )} Agent Wise Business Report.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
        toast.success(response?.data?.message || "File Downloaded.");
      } else {
        toast.error(response?.message || "Unable To Download File.");
      }
    } else {
      toast.error(response?.message || "Unable To Download File.");
    }
    setExporting(false);
    setSearchLoading(false);
  };

  return (
    <div className="flex justify-center items-center w-full min-h-[60vh] px-4 py-8 text-black dark:text-white">
      <div className="bg-white dark:bg-dark-bg p-8 rounded-xl border border-black/10 dark:border-white/10 shadow-sm max-w-lg w-full flex flex-col items-center">
        <h2 className="text-lg font-bold text-black dark:text-white mb-6 text-center">
          Agent Wise Business Report
        </h2>

        <div className="w-full flex flex-col items-center gap-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
            <div className="flex flex-col items-center sm:items-start w-full sm:w-auto">
              <label className="text-sm text-black/70 dark:text-white/70 font-medium mb-1">
                From Date :
              </label>
              <input
                type="date"
                className="w-full sm:w-auto px-3 py-1.5 text-sm text-center border border-black/20 dark:border-white/20 rounded-lg bg-white dark:bg-white/5 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-brand"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                max={getCurrentDate()}
              />
            </div>
            <div className="flex flex-col items-center sm:items-start w-full sm:w-auto">
              <label className="text-sm text-black/70 dark:text-white/70 font-medium mb-1">
                To Date :
              </label>
              <input
                type="date"
                className="w-full sm:w-auto px-3 py-1.5 text-sm text-center border border-black/20 dark:border-white/20 rounded-lg bg-white dark:bg-white/5 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-brand"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                max={getCurrentDate()}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              exportSelectedToXlsx();
            }}
            title={"Download Report"}
            disabled={exporting}
            className={`flex items-center justify-center gap-2 w-full sm:w-[220px] py-2.5 text-white font-semibold text-sm rounded-lg transition-all ${
              exporting
                ? "bg-gray-400 dark:bg-gray-700 cursor-not-allowed"
                : "bg-brand hover:bg-brand/90 cursor-pointer"
            } focus:outline-none`}
          >
            <FaDownload className="hover:text-white" />
            {exporting ? "Preparing..." : "Download Report"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentWiseBusiness;

