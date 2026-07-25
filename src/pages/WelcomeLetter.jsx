import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { formatUserDate } from "../utils/dateUtil";

function WelcomeLetter() {
  const { userDetails } = useContext(AuthContext);
  return (
    <div className="flex flex-col mx-4 sm:mx-8 md:mx-12 lg:mx-16 text-black dark:text-white">
      <div className="flex flex-col items-center justify-center">
        <div className="flex flex-col items-center w-full sm:w-4/5 mt-4">
          <div className="justify-center border w-full text-center text-black dark:text-white py-2 border-black/10 dark:border-white/10">
            <div className="text-lg sm:text-xl font-semibold">
              HEARTIEST CONGRATULATIONS TO {userDetails?.agentUserName?.trim()}
            </div>
            <div className="mt-1">
              WELCOME TO DHANLAXMI MULTISTATE CO-OPERATIVE CREDIT SOCIETY
              LIMITED FAMILY
            </div>
          </div>

          <div className="p-4 sm:p-6 border justify-center text-black dark:text-white w-full border-black/10 dark:border-white/10">
            <div className="ml-4">
              <div className="font-bold capitalize">
                {userDetails?.agentUserName?.toLowerCase()?.trim()}
              </div>
              <div>{userDetails?.office?.countryToOffice || ""}</div>
              <div>
                {userDetails?.office?.districtToOffice || ""}{" "}
                {userDetails?.office?.stateToOffice || ""}
              </div>
              <div>Email: {userDetails?.customer?.email || ""}</div>
              <div>Phone: +91 {userDetails?.customer?.mobileNumber || ""}</div>
            </div>

            <p className="text-justify text-[#828BB2] dark:text-white/60 mt-4">
              Your application dated {formatUserDate(userDetails?.joiningDate) || ""} is
              received. After scrutinizing the same, you are found to be a
              competent person. Given below are the Advisor Id No. along with
              other details for accessing your account & any related information
              at our Official website: https://login.dhan-laxmi.co.in. Last but not
              least, you are a very important pillar of our Dhanlaxmi Multistate
              Co-Op. Credit Society Ltd. It is very important that whoever works
              will be rewarded with maximum returns, and it is very necessary
              for all advisors including you to work hard to promote our
              products and earn maximum income and assured payouts.
            </p>

            <p className="text-center text-brand dark:text-cyan-400 my-4 font-bold">
              DHANLAXMI MULTISTATE CO-OPERATIVE CREDIT SOCIETY LIMITED
            </p>

            <div className="ml-4">
              <div className="font-bold capitalize">
                ADVISOR NAME :{" "}
                {userDetails?.agentUserName?.toLowerCase()?.trim()}
              </div>
              <div className="font-bold">
                ADVISOR CODE : {userDetails?.agentNumber || ""}
              </div>
              <div className="font-bold">
                JOIN DATE : {formatUserDate(userDetails?.joiningDate) || ""}
              </div>
              <div className="font-bold">
                SPONSOR ID : {userDetails?.referAgentId || ""}
              </div>
              <div className="font-bold">
                Phone: +91 {userDetails?.customer?.mobileNumber || ""}
              </div>
            </div>

            <p className="text-[#828BB2] dark:text-white/60 mt-3">
              Please be sure to change your Password using the Change Pin Link
              to ensure the security of your Advisor Account. Yours sincerely,
              DHANLAXMI MULTISTATE CO-OPERATIVE CREDIT SOCIETY LIMITED
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomeLetter;

