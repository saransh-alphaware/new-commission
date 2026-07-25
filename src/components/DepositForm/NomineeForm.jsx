import { useEffect, useRef, useState } from "react";
import {
  cleanAndFormatInput,
  cleanAndFormatInputNoSpecialChar,
} from "../../utils/formatInput";
import { calculateAge } from "../../utils/calculateAge";
import { getServerData, postServerData } from "../../config/apiRequest";
import { toast } from "sonner";
import { SectionCard } from "../SectionCard";
import { CommonInput } from "../CommonInput";

const NomineeForm = ({
  mode,
  addNominee,
  setNomineeAdd,
  customerId,
  setNomineeAdded,
}) => {
  const [nomineeName, setNomineeName] = useState("");
  const [isMinor, setIsMinor] = useState(true);
  const [nomineRelationList, setNomineRelationList] = useState([]);
  const [selectedNomineeRelation, setSelectedNomineeRelation] = useState("");
  const [selectedDateOfBirth, setSelectedDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [currentAge, setCurrentAge] = useState("");
  const [loading, setLoading] = useState(false);
  const nomineeRef = useRef(false);

  const getNomineeRelationsList = async () => {
    nomineeRef.current = true;
    const response = await getServerData(
      "relation-masters", { pageNumber: 0, pageSize: 50 }
    );
    setNomineRelationList(response?.data?.data || []);
  };

  const handleDateOfBirth = (e) => {
    const selectedDate = e.target.value;
    const currentDate = new Date().toISOString().split("T")[0];

    if (selectedDate <= currentDate) {
      setSelectedDateOfBirth(selectedDate);
      const age = calculateAge(selectedDate);
      setCurrentAge(age);
      if (age <= 18) {
        setIsMinor(true);
      } else {
        setIsMinor(false);
      }
    } else {
      toast.warning("Please select Valid Date.");
    }
  };

  const handleNomineeSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      customerToNominee: {
        id: customerId,
      },
      relationMasterId: { id: selectedNomineeRelation || null },
      nomineeBirthDate: selectedDateOfBirth,
      nomineeAge: currentAge,
      guardianName,
      gender,
      nomineeName,
    };
    setLoading(true);

    try {
      const response = await postServerData(
        `nominee-details`,
        formData
      );

      if (response?.status) {
        if (response?.status === 201 || response?.status === 200) {
          toast.success(
            response?.data?.message ||
            response?.message ||
            "NOMINEE CREATED SUCCESSFULLY"
          );
          setNomineeAdded((prev) => !prev);
          setNomineeAdd(false);
        } else {
          toast.error(
            response?.message ||
            "FAILED TO ADD NOMINEE"
          );
        }
      } else {
        if (
          response?.status === 400 ||
          response?.status === 401 ||
          response?.status === 403
        ) {
          toast.error(
            response?.message ||
            "FAILED TO ADD NOMINEE"
          );
        }
      }
    } catch (error) {
      toast.error(`Error While Creating Nominee Error: ${error?.toISOString?.() || error}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!nomineeRef.current) {
      getNomineeRelationsList();
    }
  }, [addNominee]);

  return (
    <SectionCard>
      {/* Nominee Name */}
      <CommonInput
        label="Nominee Name"
        placeholder="Enter Nominee Name"
        value={nomineeName}
        onChange={(e) =>
          setNomineeName(
            cleanAndFormatInputNoSpecialChar(e.target.value.toUpperCase())
          )
        }
        onBlur={(e) => setNomineeName(cleanAndFormatInput(e.target.value))}
        readOnly={mode === "view"}
      />

      <div className="flex flex-col gap-1">
        <label className="text-xs sm:text-sm font-semibold text-black/70 dark:text-white/70">
          Nominee Relation <span className="text-red-600 dark:text-red-400">*</span>
        </label>

        <select
          name="relationMasterId"
          value={selectedNomineeRelation}
          disabled={mode === "view"}
          onChange={(e) => setSelectedNomineeRelation(e.target.value)}
          required
          className="border border-black/20 dark:border-white/20 rounded-lg px-3 py-2 w-full text-sm sm:text-base focus:ring-2 focus:ring-brand focus:outline-none bg-white dark:bg-white/5 text-black dark:text-white cursor-pointer"
        >
          <option value="" className="bg-white dark:bg-dark-bg text-black dark:text-white">Select Relation</option>
          {nomineRelationList?.map((realtion) => (
            <option key={realtion?.id} value={realtion?.id} className="bg-white dark:bg-dark-bg text-black dark:text-white">
              {realtion?.relation}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs sm:text-sm font-semibold text-black/70 dark:text-white/70">
          Date of Birth <span className="text-red-600 dark:text-red-400">*</span>
        </label>

        <input
          type="date"
          name="nomineeBirthDate"
          value={selectedDateOfBirth}
          readOnly={mode === "view"}
          onChange={handleDateOfBirth}
          required
          className="border border-black/20 dark:border-white/20 rounded-lg px-3 py-1.5 w-full text-sm sm:text-base focus:ring-2 focus:ring-brand focus:outline-none bg-white dark:bg-white/5 text-black dark:text-white cursor-pointer"
        />
      </div>
      <CommonInput
        label="Nominee Age"
        placeholder="Enter Nominee Age"
        value={currentAge || "0"}
        readOnly
      />
      {isMinor && (
        <CommonInput
          label="Guardian Name"
          placeholder="Enter Guardian Name"
          readOnly={mode === "view"}
          value={guardianName}
          onChange={(e) =>
            setGuardianName(
              cleanAndFormatInputNoSpecialChar(e.target.value.toUpperCase())
            )
          }
          onBlur={(e) => setGuardianName(cleanAndFormatInput(e.target.value))}
        />
      )}

      <div className="flex flex-col gap-1">
        <label className="text-xs sm:text-sm font-semibold text-black/70 dark:text-white/70">
          Gender <span className="text-red-600 dark:text-red-400">*</span>
        </label>

        <select
          name="gender"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          disabled={mode === "view"}
          className="border border-black/20 dark:border-white/20 rounded-lg px-3 py-2 w-full text-sm sm:text-base focus:ring-2 focus:ring-brand focus:outline-none bg-white dark:bg-white/5 text-black dark:text-white cursor-pointer"
        >
          <option value="" className="bg-white dark:bg-dark-bg text-black dark:text-white">Select Gender</option>
          <option value="MALE" className="bg-white dark:bg-dark-bg text-black dark:text-white">Male</option>
          <option value="FEMALE" className="bg-white dark:bg-dark-bg text-black dark:text-white">Female</option>
          <option value="OTHER" className="bg-white dark:bg-dark-bg text-black dark:text-white">Other</option>
        </select>
      </div>

      {mode !== "view" && (
        <div className="flex flex-col w-full sm:w-auto">
          <label className="text-sm text-transparent select-none">{"Search"}</label>
          <button
            type="button"
            onClick={handleNomineeSubmit}
            disabled={loading}
            className={`w-full sm:w-auto px-4 py-2 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer focus:outline-none ${
              loading
                ? "bg-gray-400 dark:bg-gray-700 cursor-not-allowed"
                : "bg-brand hover:bg-brand/90"
            }`}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      )}
    </SectionCard>
  );
};

export default NomineeForm;

