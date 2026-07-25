import { useEffect, useState } from "react";
import { getServerData } from "../../config/apiRequest";
import ModalMain from "../ModalMain";
import NomineeForm from "./NomineeForm";

const NomineeDetailsViewHelper = ({
  setNomineeData,
  NomineeData,
  customerData,
  onSelectedNomineesChange,
  mode,
}) => {
  const [selectedNominees, setSelectedNominees] = useState([]);
  const [nomineeAdd, setNomineeAdd] = useState(false);
  const [nomineeAdded, setNomineeAdded] = useState(false);

  const fetchNomineeDetails = async (customerId) => {
    try {
      const response = await getServerData(
        `nominee-details/customer/${customerId}`
      );
      setNomineeData(response?.data?.data || []);
    } catch (err) {
      setNomineeData([]);
      console.error("Error fetching nominee data:", err);
    }
  };

  useEffect(() => {
    if (customerData?.id) {
      fetchNomineeDetails(customerData.id);
    }
  }, [customerData?.id, nomineeAdded]);

  const handleNomineeSelection = (nomineeId) => {
    if (selectedNominees.includes(nomineeId)) {
      setSelectedNominees(selectedNominees.filter((id) => id !== nomineeId));
    } else {
      setSelectedNominees([...selectedNominees, nomineeId]);
    }
  };

  useEffect(() => {
    if (mode === "create" || mode === "edit") {
      onSelectedNomineesChange(selectedNominees);
    }
  }, [selectedNominees, mode]);

  return (
    <div className="bg-white dark:bg-dark-bg shadow-sm rounded-xl border border-black/10 dark:border-white/10 px-4 pt-2 pb-4 sm:px-5 sm:pt-2 sm:pb-5 text-black dark:text-white">
      <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 py-2">
        <h2 className="text-base sm:text-lg font-bold text-black dark:text-white">
          Nominee Details
        </h2>

        {((customerData && mode !== "view") || true) && (
          <button
            type="button"
            onClick={() => setNomineeAdd(true)}
            className="px-4 py-2 text-sm font-semibold text-white bg-brand hover:bg-brand/90 rounded-lg transition-colors cursor-pointer focus:outline-none"
          >
            + Add Nominee
          </button>
        )}
      </div>

      {/* Nominee Cards */}
      {NomineeData && NomineeData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {NomineeData.map((nominee, index) => (
            <div
              key={nominee.id}
              className="border border-black/10 dark:border-white/10 rounded-xl p-4 shadow-sm bg-white dark:bg-white/5 transition-all"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-black dark:text-white text-sm">
                  Nominee {index + 1}
                </h3>

                <input
                  type="checkbox"
                  className="w-4 h-4 accent-brand cursor-pointer"
                  onChange={() => handleNomineeSelection(nominee.id)}
                  disabled={mode === "view"}
                  checked={selectedNominees.includes(nominee.id)}
                />
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-black/60 dark:text-white/60 font-medium">Name</label>
                  <input
                    readOnly
                    value={nominee.nomineeName || ""}
                    className="w-full mt-1 p-2 border border-black/20 dark:border-white/20 rounded-lg bg-gray-50 dark:bg-white/5 text-black dark:text-white text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-black/60 dark:text-white/60 font-medium">Birth Date</label>
                  <input
                    type="date"
                    readOnly
                    value={nominee.nomineeBirthDate || ""}
                    className="w-full mt-1 p-2 border border-black/20 dark:border-white/20 rounded-lg bg-gray-50 dark:bg-white/5 text-black dark:text-white text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-black/60 dark:text-white/60 font-medium">Gender</label>
                  <input
                    readOnly
                    value={nominee.gender || ""}
                    className="w-full mt-1 p-2 border border-black/20 dark:border-white/20 rounded-lg bg-gray-50 dark:bg-white/5 text-black dark:text-white text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-black/60 dark:text-white/60 font-medium">Relation</label>
                  <input
                    readOnly
                    value={nominee.relationMaster?.relation || ""}
                    className="w-full mt-1 p-2 border border-black/20 dark:border-white/20 rounded-lg bg-gray-50 dark:bg-white/5 text-black dark:text-white text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-black/50 dark:text-white/50 text-sm text-center mt-6">
          No Nominee Details Found
        </p>
      )}

      {/* Modal */}
      {nomineeAdd && (
        <ModalMain
          isOpen={nomineeAdd}
          setIsOpen={setNomineeAdd}
          title="Add Nominee"
          content={
            <NomineeForm
              customerId={customerData?.id}
              addNominee={nomineeAdd}
              setNomineeAdd={setNomineeAdd}
              mode={mode}
              setNomineeAdded={setNomineeAdded}
            />
          }
        />
      )}
    </div>
  );
};

export default NomineeDetailsViewHelper;

