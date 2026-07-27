/**
 * Normalizes backend API responses for New and Group Renewal business:
 * 1. account-summary-child-fetchv2
 * 2. renewal-business-byDate-and-children-fetch-v3
 * 3. account-counted
 *
 * Supports both legacy nested object format and updated flat array format.
 */
export function normalizeAccountCountedData(responseData) {
  const result = {
    DDS_ACCOUNT: { details: {} },
    RECURRING_DEPOSIT_ACCOUNT: { details: {} },
    FIX_ACCOUNT: { details: {} },
    MIP_ACCOUNT: { details: {} },
  };

  if (!responseData) return result;

  const payload = Array.isArray(responseData?.data)
    ? responseData.data
    : Array.isArray(responseData)
    ? responseData
    : responseData?.data && typeof responseData.data === "object"
    ? responseData.data
    : responseData;

  if (Array.isArray(payload)) {
    for (const item of payload) {
      if (!item || typeof item !== "object") continue;
      const pType = String(item.productType || item.accountType || "").toUpperCase();
      const pName = item.productName || item.name || "Unknown Product";
      const amount = Number(item.totalInvestedBalance ?? item.totalAmount ?? 0);

      let targetKey = "RECURRING_DEPOSIT_ACCOUNT";
      if (pType.includes("DDS") || pType.includes("DAILY")) {
        targetKey = "DDS_ACCOUNT";
      } else if (pType.includes("RD") || pType.includes("RECURRING")) {
        targetKey = "RECURRING_DEPOSIT_ACCOUNT";
      } else if (pType.includes("FIX")) {
        targetKey = "FIX_ACCOUNT";
      } else if (pType.includes("MIP") || pType.includes("MONTHLY")) {
        targetKey = "MIP_ACCOUNT";
      }

      result[targetKey].details[pName] = (result[targetKey].details[pName] || 0) + amount;
    }
    return result;
  }

  if (typeof payload === "object" && payload !== null) {
    if (payload.DDS_ACCOUNT || payload.RECURRING_DEPOSIT_ACCOUNT || payload.FIX_ACCOUNT || payload.MIP_ACCOUNT) {
      return {
        DDS_ACCOUNT: { details: { ...(payload.DDS_ACCOUNT?.details || {}) } },
        RECURRING_DEPOSIT_ACCOUNT: { details: { ...(payload.RECURRING_DEPOSIT_ACCOUNT?.details || {}) } },
        FIX_ACCOUNT: { details: { ...(payload.FIX_ACCOUNT?.details || {}) } },
        MIP_ACCOUNT: { details: { ...(payload.MIP_ACCOUNT?.details || {}) } },
      };
    }
  }

  return result;
}

/**
 * Normalizes personal renewal responses from renewal-business-byDate.
 * Supports both legacy ACCOUNT_AND_PRODUCT_DETAILS object format and updated flat array format.
 */
export function normalizeRenewalBusinessData(responseData) {
  const result = {
    ACCOUNT_AND_PRODUCT_DETAILS: {
      DAILY_DEPOSIT: {},
      RECURRING_DEPOSIT: {},
      FIXED_DEPOSIT: {},
      MONTHLY_INCOME: {},
    },
    DDS_ACCOUNT: { details: {} },
    RECURRING_DEPOSIT_ACCOUNT: { details: {} },
    FIX_ACCOUNT: { details: {} },
    MIP_ACCOUNT: { details: {} },
  };

  if (!responseData) return result;

  const payload = Array.isArray(responseData?.data)
    ? responseData.data
    : Array.isArray(responseData)
    ? responseData
    : responseData?.data && typeof responseData.data === "object"
    ? responseData.data
    : responseData;

  if (Array.isArray(payload)) {
    for (const item of payload) {
      if (!item || typeof item !== "object") continue;
      const aType = String(item.accountType || item.productType || "").toUpperCase();
      const pName = item.productName || item.name || "Unknown Product";
      const amount = Number(item.totalAmount ?? item.totalInvestedBalance ?? 0);
      const txns = Number(item.transactionsCompleted || 0);

      let catKey = "RECURRING_DEPOSIT";
      let accountKey = "RECURRING_DEPOSIT_ACCOUNT";

      if (aType.includes("DAILY") || aType.includes("DDS")) {
        catKey = "DAILY_DEPOSIT";
        accountKey = "DDS_ACCOUNT";
      } else if (aType.includes("RECURRING") || aType.includes("RD")) {
        catKey = "RECURRING_DEPOSIT";
        accountKey = "RECURRING_DEPOSIT_ACCOUNT";
      } else if (aType.includes("FIX")) {
        catKey = "FIXED_DEPOSIT";
        accountKey = "FIX_ACCOUNT";
      } else if (aType.includes("MONTHLY") || aType.includes("MIP")) {
        catKey = "MONTHLY_INCOME";
        accountKey = "MIP_ACCOUNT";
      }

      result.ACCOUNT_AND_PRODUCT_DETAILS[catKey][pName] = {
        totalAmount: (result.ACCOUNT_AND_PRODUCT_DETAILS[catKey][pName]?.totalAmount || 0) + amount,
        transactionsCompleted: (result.ACCOUNT_AND_PRODUCT_DETAILS[catKey][pName]?.transactionsCompleted || 0) + txns,
      };

      result[accountKey].details[pName] = (result[accountKey].details[pName] || 0) + amount;
    }

    return result;
  }

  const detailsSource = payload?.ACCOUNT_AND_PRODUCT_DETAILS || payload;
  if (detailsSource && typeof detailsSource === "object") {
    const accDetails = {
      DAILY_DEPOSIT: { ...(detailsSource.DAILY_DEPOSIT || {}) },
      RECURRING_DEPOSIT: { ...(detailsSource.RECURRING_DEPOSIT || {}) },
      FIXED_DEPOSIT: { ...(detailsSource.FIXED_DEPOSIT || {}) },
      MONTHLY_INCOME: { ...(detailsSource.MONTHLY_INCOME || {}) },
    };

    result.ACCOUNT_AND_PRODUCT_DETAILS = accDetails;

    const mapCategoryToAccount = {
      DAILY_DEPOSIT: "DDS_ACCOUNT",
      RECURRING_DEPOSIT: "RECURRING_DEPOSIT_ACCOUNT",
      FIXED_DEPOSIT: "FIX_ACCOUNT",
      MONTHLY_INCOME: "MIP_ACCOUNT",
    };

    for (const [cat, products] of Object.entries(accDetails)) {
      const targetAcc = mapCategoryToAccount[cat];
      if (targetAcc && products && typeof products === "object") {
        for (const [pName, prodDetail] of Object.entries(products)) {
          const amt = typeof prodDetail === "number" ? prodDetail : Number(prodDetail?.totalAmount || 0);
          result[targetAcc].details[pName] = amt;
        }
      }
    }

    return result;
  }

  return result;
}
