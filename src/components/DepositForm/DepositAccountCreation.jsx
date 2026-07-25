import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "sonner";
import { getServerData, postServerData } from "../../config/apiRequest";
import CustomerInformation from "./CustomerInformation";
import JointAndGaurdianInformation from "./JointAndGaurdianInformation";
import ProductInformation from "./ProductInformation";
import { SectionCard } from "../SectionCard";
import { CommonInput } from "../CommonInput";
import NomineeDetailsViewHelper from "./NomineeDetailsViewHelper";
import AccountConfirmation from "../AccountConfirmation";
import LoaderSpinner from "../LoaderSpinner";
import ModalMain from "../ModalMain";

const depositAccountType = {
  RECURRING_DEPOSIT_ACCOUNT: "recurringDepositProduct",
  FIX_ACCOUNT: "fixDepositProduct",
  DDS_ACCOUNT: "dailyDepositSchemeProduct",
  MIP_ACCOUNT: "monthlyIncomeProduct",
};

const navigateUrl = {
  RECURRING_DEPOSIT_ACCOUNT: "/recurring-deposit-account",
  FIX_ACCOUNT: "/fix-deposit-account",
  DDS_ACCOUNT: "/daily-deposit-account",
  MIP_ACCOUNT: "/mip-deposit-account",
};

export default function DepositAccountCreation({
  accountType = "FIX_ACCOUNT",
}) {
  const navigate = useNavigate();
  const { userDetails, agentId } = useContext(AuthContext);
  const [customerData, setCustomerData] = useState(undefined);
  const [jointData, setJointData] = useState(undefined);
  const [isJoint, setIsJoint] = useState(false);
  const [savingAccount, setSavingAccount] = useState(undefined);
  const [productData, setProductData] = useState(undefined);
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dataModal, setDataModal] = useState(false);
  const [NomineeData, setNomineeData] = useState("");
  const [selectedNominees, setSelectedNominees] = useState([]);
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [selectedBranch, setSelectedBranch] = useState("");

  const ValidateFeild = () => {
    if (!customerData?.id) {
      toast.warning("PLEASE SELECT CUSTOMER !!");
      return false;
    }

    if (!savingAccount?.id) {
      toast.warning("PLEASE SELECT SAVING ACCOUNT !!");
      return false;
    }

    if (customerData?.isMinor) {
      if (!jointData?.id) {
        toast.warning(
          "PLEASE FILL GAURDIAN CUSTOMER DETAILS, IT IS MANDATORY FOR MINOR CUSTOMER !!"
        );
        return false;
      }
      if (jointData?.id === customerData?.id) {
        toast.warning(
          "GAURDIAN CUSTOMER AND MINOR CUSTOMER CANNOT BE THE SAME !!"
        );
        return false;
      }
      if (jointData?.isMinor) {
        toast.warning("GAURDIAN CANNOT BE A MINOR CUSTOMER !!");
        return false;
      }
    }

    if (isJoint) {
      if (!jointData?.id) {
        toast.warning(
          "PLEASE FILL JOINT CUSTOMER DETAILS, IF YOU SELECT JOINT ACCOUNT !!"
        );
        return false;
      }
      if (jointData?.id === customerData?.id) {
        toast.warning(
          "JOINT CUSTOMER AND PRIMARY CUSTOMER CANNOT BE THE SAME !!"
        );
        return false;
      }
    }

    if (selectedNominees?.length === 0) {
      toast.warning("PLEASE SELECT NOMINEE !!");
      return false;
    }

    if (!productData?.id) {
      toast.warning("PLEASE SELECT PRODUCT !!");
      return false;
    }

    if (!Number(amount) || Number(amount) <= 0) {
      toast.warning("AMOUNT SHOULD GREATER THAN 0 !");
      return false;
    }

    if (
      Number(
        productData?.minimumDepositAmmount ||
        productData?.minimumDepositAmount ||
        productData?.minimumOpeningBalance ||
        "0"
      ) > Number(amount)
    ) {
      toast.warning(
        "AMOUNT SHOULD GREATER THAN OR EQUAL TO MINIMUM OPENING BALANCE !"
      );
      return false;
    }

    let multipleOfValue = productData?.multipleOf || 10;
    if (accountType === "DDS_ACCOUNT") {
      multipleOfValue = 10;
    } else if (accountType === "MIP_ACCOUNT") {
      multipleOfValue = 10000;
    } else {
      multipleOfValue = productData?.multipleOf || 10;
    }

    if (
      Number(amount) >
      Number(
        productData?.minimumDepositAmmount ||
        productData?.minimumDepositAmount ||
        productData?.minimumOpeningBalance ||
        "0"
      ) &&
      Number(amount) %
      Number(
        multipleOfValue ||
        productData?.minimumDepositAmmount ||
        productData?.minimumOpeningBalance ||
        productData?.minimumDepositAmount ||
        50
      ) !==
      0
    ) {
      toast.warning(
        `AMOUNT SHOULD BE A MULTIPLE OF ${multipleOfValue ||
        productData?.minimumDepositAmmount ||
        productData?.minimumOpeningBalance ||
        productData?.minimumDepositAmount ||
        50
        } !`
      );
      return false;
    }

    if (Number(savingAccount?.balance || "0") < Number(amount)) {
      toast.warning("YOUR ACCOUNT HAS AN INSUFFICIENT BALANCE !");
      return false;
    }
    setDataModal(true);
  };

  const createAccount = async () => {
    let updatedTerm = Number(productData?.term);
    if (productData?.periodType === "YEARS") {
      updatedTerm = Number(productData?.term) * 12;
    }
    setLoading(true);
    const formData = {
      [depositAccountType?.[accountType]]: {
        id: productData?.id || null,
        name: productData?.name || null,
        shortName: productData?.shortName || null,
        interest: productData?.interest || null,
      },
      depositAccountType: accountType,
      savingAccount: { id: savingAccount?.id },
      agent: {
        id: agentId || null,
        agentUserName: userDetails?.agentUserName || null,
        agentNumber: userDetails?.agentNumber || null,
      },
      customer: {
        id: customerData.id || null,
        customerId: customerData?.customerId || null,
        customerName: customerData?.customerName || null,
        customerOfficeDetails: {
          branchCode: customerData?.customerOfficeDetails?.branchCode || null,
        },
      },
      paymentMode: paymentMode,
      term: updatedTerm,
      investedBalance: amount,
      nomineeDetails: selectedNominees,
      officeModifyResponse: {
        id: selectedBranch?.value || null,
        branchCode: selectedBranch?.branchCode || null,
      },
    };

    if (customerData?.isMinor || isJoint) {
      formData.jointCustomerDetails = {
        id: jointData.id || null,
        customerId: jointData?.customerId || null,
        customerName: jointData?.customerName || null,
        customerOfficeDetails: {
          branchCode: jointData?.customerOfficeDetails?.branchCode || null,
        },
        gender: jointData?.gender,
        email: jointData?.email,
      };
    }

    if (customerData?.isMinor) {
      formData.guardianDetail = {
        id: jointData?.id || null,
        guardianName: jointData?.customerName || null,
      };
    }
    setLoading(true);

    try {
      const response = await postServerData(
        "agents/deposit-account-creation",
        formData,
        {
          agentId: agentId,
        }
      );

      if (response?.status) {
        if (response?.status === 201 || response?.status === 200) {
          toast.success(
            response?.data?.message ||
            response?.message ||
            "ACCOUNT CREATED SUCCESSFULLY"
          );
          navigate(navigateUrl?.[accountType]);
        } else {
          toast.error(
            response?.message ||
            "FAILED TO CREATE ACCOUNT"
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
            "FAILED TO CREATE ACCOUNT"
          );
        }
      }
    } catch (error) {
      toast.error(
        `Error While Creating Account Error: ${error?.toISOString?.() || error}`
      );
    } finally {
      setLoading(false);
    }
  };

  const getData = async (customerId) => {
    const response = await getServerData(
      `saving-accounts/customer/${customerId}`
    );
    if (
      response?.value &&
      (response.status === 200 || response.status === 201)
    ) {
      const activeAccounts = response?.data?.data?.filter(
        (item) => item?.active === true && item?.accountType === "MAIN"
      );
      if (activeAccounts?.length > 0) {
        setSavingAccount(activeAccounts?.[0]);
      } else {
        setSavingAccount(undefined);
        setCustomerData({});
        setNomineeData([]);
        toast.warning(
          "NO ACTIVE MAIN SAVING ACCOUNT FOUND. PLEASE CREATE OR ACTIVATE IT FROM THE BRANCH."
        );
      }
    } else {
      setSavingAccount(undefined);
      toast.error(
        `${response?.message || ""} || Data Fetching Failed`
      );
    }
  };

  const handleSelectedNomineeChange = (ids) => {
    if (ids) {
      const nomineeObjects = ids.map((id) => ({ id }));
      setSelectedNominees(nomineeObjects);
    } else {
      toast.warning("NOMINEE ID NOT FOUND !!");
    }
  };

  useEffect(() => {
    if (customerData?.id) {
      if (!customerData?.isMinor) {
        getData(customerData?.id);
      } else {
        if (jointData?.id) {
          getData(jointData?.id);
        }
      }
    }
  }, [customerData?.id, jointData?.id]);

  useEffect(() => {
    if (productData?.id) {
      setAmount(
        productData?.minimumDepositAmmount ||
        productData?.minimumOpeningBalance ||
        productData?.minimumDepositAmount ||
        "0"
      );
    }
  }, [productData?.id]);

  return (
    <div className="p-3 sm:p-6 space-y-5 bg-white dark:bg-dark-bg min-h-screen text-black dark:text-white">
      {dataModal && (
        <ModalMain
          isOpen={dataModal}
          content={
            <>
              <AccountConfirmation
                message={`ARE YOU SURE YOU WANT TO CREATE ACCOUNT ?`}
                bodyData={{
                  customerId: customerData?.customerId || "",
                  customerName:
                    customerData?.customerName ||
                    `${customerData?.firstName || ""} ${customerData?.middleName || ""} ${customerData?.lastName || ""}`.trim() ||
                    "",
                  productName: productData?.name || "",
                  amount: `${amount || ""} ₹`,
                }}
              />
              <div className="flex flex-col space-y-4 mt-2">
                <div className="flex space-x-4 items-center justify-center">
                  {loading && <LoaderSpinner />}
                  <button
                    onClick={createAccount}
                    className="px-4 py-2 text-sm font-semibold text-white bg-brand hover:bg-brand/90 rounded-lg cursor-pointer focus:outline-none transition-colors"
                    disabled={loading}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => {
                      setDataModal(false);
                    }}
                    className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer focus:outline-none transition-colors"
                    disabled={loading}
                  >
                    No
                  </button>
                </div>
              </div>
            </>
          }
          setIsOpen={setDataModal}
          title={"Account Creation"}
        />
      )}
      <CustomerInformation
        customerData={customerData}
        setCustomerData={setCustomerData}
        savingData={savingAccount}
        selectedBranch={selectedBranch}
        setSelectedBranch={setSelectedBranch}
      />
      {!customerData?.isMinor && (
        <SectionCard>
          <div className="flex items-center gap-3">
            <label className="text-xs sm:text-base font-semibold text-black/70 dark:text-white/70">
              Joint Account :
            </label>
            <input
              type="checkbox"
              value={isJoint}
              className="w-4 h-4 accent-brand cursor-pointer"
              onChange={() => {
                setIsJoint((prev) => !prev);
              }}
            />
          </div>
        </SectionCard>
      )}

      {(isJoint || customerData?.isMinor) && (
        <JointAndGaurdianInformation
          jointData={jointData}
          setJointData={setJointData}
          isMinor={customerData?.isMinor || false}
          savingData={savingAccount}
        />
      )}
      <NomineeDetailsViewHelper
        setNomineeData={setNomineeData}
        NomineeData={NomineeData}
        customerData={customerData}
        customerId={customerData?.customerId}
        onSelectedNomineesChange={handleSelectedNomineeChange}
        mode={"create"}
      />
      <ProductInformation
        productData={productData}
        setProductData={setProductData}
        accountType={accountType}
      />

      {/* PAYMENT DETAILS */}
      <SectionCard title="Payment Details">
        <CommonInput
          label="Amount"
          placeholder="Enter Amount"
          value={amount}
          onChange={(e) => {
            const val = e.target.value;
            const numericRegex = /^[0-9]*$/;
            if (!numericRegex.test(val)) {
              return;
            }
            setAmount(val);
          }}
        />
        <CommonInput
          label="Minimum Opening Balance"
          placeholder="Enter Minimum Opening Balance"
          value={
            productData?.minimumDepositAmmount ||
            productData?.minimumOpeningBalance ||
            productData?.minimumDepositAmount ||
            "0"
          }
          disabled
        />
        <div className="flex flex-col gap-1">
          <label className="text-xs sm:text-sm font-semibold text-black/70 dark:text-white/70">
            Payment Mode <span className="text-red-600 dark:text-red-400">*</span>
          </label>
          <select
            className="border border-black/20 dark:border-white/20 rounded-lg px-3 py-2 w-full text-sm sm:text-base focus:ring-2 focus:ring-brand focus:outline-none bg-white dark:bg-white/5 text-black dark:text-white cursor-pointer"
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
          >
            <option value="CASH" className="bg-white dark:bg-dark-bg text-black dark:text-white">CASH</option>
            <option value="UPI" className="bg-white dark:bg-dark-bg text-black dark:text-white">UPI</option>
            <option value="NEFT" className="bg-white dark:bg-dark-bg text-black dark:text-white">NEFT</option>
            <option value="RTGS" className="bg-white dark:bg-dark-bg text-black dark:text-white">RTGS</option>
            <option value="CHEQUE" className="bg-white dark:bg-dark-bg text-black dark:text-white">CHEQUE</option>
          </select>
        </div>
      </SectionCard>

      {/* SUBMIT BUTTON */}
      <div className="flex">
        <button
          className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-white bg-brand hover:bg-brand/90 font-semibold transition-colors cursor-pointer focus:outline-none sm:w-[150px]"
          onClick={ValidateFeild}
        >
          Submit
        </button>
      </div>
    </div>
  );
}

