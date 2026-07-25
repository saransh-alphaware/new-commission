import { useContext } from "react";
import { Route, Routes } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Homepage from "../pages/Homepage";
import OptimizedHomePage from "../pages/OptimizedHomePage";
import ProductwiseBusiness from "../pages/ProductwiseBusiness";
import CommissionData from "../pages/CommissionData";
import WelcomeLetter from "../pages/WelcomeLetter";
import MyCustomers from "../pages/MyCustomers";
import MyMembers from "../pages/MyMembers";
import RenewalPendingList from "../pages/RenewalPendingList";
import UpcomingMaturityList from "../pages/UpcomingMaturityList";
import InvestmentProductList from "../pages/InvestmentProductList";
import SavingAcccounts from "../pages/SavingAccounts";
import DepositAccounts from "../pages/DepositAccounts";
import ShareAcccounts from "../pages/ShareAccounts";
import PageNotFound from "../pages/PageNotFound";
import Breadcrumbs from "../components/Breadcrumbs";
import ChangePassword from "../pages/ChangePassword";
import AgentWiseBusiness from "../pages/AgentWiseBusiness";
import {
  FixedDepositAccountList,
  FixedDepositAccountCreate,
} from "../pages/deposit/fixDepositAccount";
import {
  RecurringDepositAccountList,
  RecurringDepositAccountCreate,
} from "../pages/deposit/recurringDepositAccount";
import {
  DDSDepositAccountList,
  DailyDepositAccountCreate,
} from "../pages/deposit/dailyDepositAccount";
import {
  MIPDepositAccountList,
  MIPDepositAccountCreate,
} from "../pages/deposit/monthlyDepositAccount";
import DepositAccountView from "../components/DepositForm/DepositAccountView";

const AllRoutes = () => {
  const { isCustomer } = useContext(AuthContext);
  return (
    <div className="w-full">
      <Breadcrumbs />
      <Routes>
        {isCustomer === false && (
          <>
            <Route path="/" element={<Homepage />} />
            <Route path="/optimizedHomePage" element={<OptimizedHomePage/>} /> 
            <Route path="/productwiseBusiness" element={<ProductwiseBusiness />} />
            <Route path="/commissionData" element={<CommissionData />} /> 
            <Route path="/welcomeLetter" element={<WelcomeLetter />} />
            <Route path="/myCustomers" element={<MyCustomers />} />
            <Route path="/myMembers" element={<MyMembers />} />
            <Route path="/renewalPendingList" element={<RenewalPendingList />} />
            <Route path="/upcomingMaturityList" element={<UpcomingMaturityList />} />
            <Route path="/agentwiseBusiness" element={<AgentWiseBusiness />} /> 
            <Route path="/investmentProduct" element={<InvestmentProductList />} />
            <Route path="/fix-deposit-account" element={<FixedDepositAccountList />} />
            <Route path="/fix-deposit-account/create" element={<FixedDepositAccountCreate />} />
            <Route path="/fix-deposit-account/view" element={<DepositAccountView />} />
            <Route path="/recurring-deposit-account" element={<RecurringDepositAccountList />} />
            <Route path="/recurring-deposit-account/create" element={<RecurringDepositAccountCreate />} />
            <Route path="/recurring-deposit-account/view" element={<DepositAccountView />} />
            <Route path="/daily-deposit-account" element={<DDSDepositAccountList />} />
            <Route path="/daily-deposit-account/create" element={<DailyDepositAccountCreate />} />
            <Route path="/daily-deposit-account/view" element={<DepositAccountView />} />
            <Route path="/mip-deposit-account" element={<MIPDepositAccountList />} />
            <Route path="/mip-deposit-account/create" element={<MIPDepositAccountCreate />} />
            <Route path="/mip-deposit-account/view" element={<DepositAccountView />} /> 
          </>
        )}
        <Route path="/savingAccount" element={<SavingAcccounts />} />
        <Route path="/depositAccount" element={<DepositAccounts />} />*
        <Route path="/shareAcccounts" element={<ShareAcccounts />} />
        <Route path="/changePassword" element={<ChangePassword />} />  
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </div>
  );
};

export default AllRoutes;
