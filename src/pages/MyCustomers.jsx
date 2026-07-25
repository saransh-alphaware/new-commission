import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import LoaderSpinner from "../components/LoaderSpinner";
import { toast } from "sonner";
import { getServerData } from "../config/apiRequest";
import { useAbortableEffect } from "../hooks/useAbortableEffect";
import CommonTable from "../components/CommonTable";

function MyCustomers() {
  const [loading, setLoading] = useState(false);
  const { agentId } = useContext(AuthContext);
  const [customerData, setCustomerData] = useState([]);

  const tableHeading = [
    "Customer Name",
    "Customer Id",
    "Mobile Number",
    "Address",
  ];

  const getCustomersAccounts = async (options) => {
    setLoading(true);
    let response = await getServerData(`customers/by-agent/${agentId}`, null, options);
    if (response?.cancelled) return;
    if (response?.value) {
      if (response?.status === 200 || response?.status === 201) {
        const customerSet = new Set();
        let initialSize = customerSet.size;
        const responseCustomerData = response?.data?.data;
        const customerDataResponse = responseCustomerData
          ?.map((customer) => {
            customerSet.add(customer?.customerId);
            if (customerSet.size > initialSize) {
              initialSize++;
              return {
                customerName: customer?.customerName,
                customerId: customer?.customerId,
                mobileNumber: customer?.mobileNumber,
                address: [
                  customer?.line1,
                  customer?.houseNumber,
                  customer?.buildingName,
                  customer?.taluka,
                  customer?.district,
                  customer?.state,
                  customer?.country,
                  customer?.zip,
                ]
                  .filter(Boolean)
                  .join(", "),
              };
            }
          })
          .filter((item) => item !== undefined);
        setCustomerData(customerDataResponse);
      } else {
        toast.error(`${response?.message || ""} || Data Fetching Failed`);
        setCustomerData([]);
      }
    } else {
      setCustomerData([]);
      toast.error(`${response?.message || ""} || Data Fetching Failed`);
    }
    setLoading(false);
  };

  useAbortableEffect((signal) => {
    getCustomersAccounts({ signal });
  }, []);

  return (
    <div className="flex flex-col mx-4 bg-white dark:bg-dark-bg text-black dark:text-white relative min-h-75">
      {loading ? (
        <LoaderSpinner />
      ) : (
        <div className="mt-4">
          <CommonTable headItems={tableHeading} bodyData={customerData} loading={loading} />
        </div>
      )}
    </div>
  );
}

export default MyCustomers;

