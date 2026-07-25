export function convertDateFormat(dateString) {
  return dateString.split("-").reverse().join("/");
}

export function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date?.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(date?.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getCurrentWeek() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  return {
    monday: formatDate(monday),
    sunday: formatDate(
      new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6),
    ),
  };
}

export function getFinancialYear(date) {
  return date.getMonth() < 3 ? date.getFullYear() - 1 : date.getFullYear();
}

export function getCurrentDate() {
  return formatDate(new Date());
}

export function getDateByDifference(days) {
  const currentDate = new Date();
  const differenceDate = new Date(currentDate);
  differenceDate?.setDate(currentDate?.getDate() - days);
  return differenceDate?.toISOString()?.split("T")[0]; // Returns the date in 'YYYY-MM-DD' format
}

export const formatUserDate = (date, symbolBetweenDate = "-") => {
  if (date) {
    const formattedDate = new Date(date);
    const day = formattedDate.getDate().toString().padStart(2, "0"); // Get day and pad with leading zero if necessary
    const month = (formattedDate.getMonth() + 1).toString().padStart(2, "0"); // Get month (zero-based index, hence +1) and pad with leading zero if necessary
    const year = formattedDate.getFullYear(); // Get full year (four digits)
    return `${day}${symbolBetweenDate}${month}${symbolBetweenDate}${year}`;
  } else {
    return "-";
  }
};

export function getDateRanges(dateString) {
  const date = new Date(dateString + "T00:00:00Z"); // Parsing the date in UTC format

  // Get week range (Monday to Sunday in UTC)
  const startOfWeek = new Date(date);
  startOfWeek.setUTCDate(date.getUTCDate() - date.getUTCDay() + 1); // Set to Monday (UTC)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 6); // Set to Sunday (UTC)

  // Get month range (1st to last day of the month in UTC)
  const startOfMonth = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1),
  ); // First day of the month in UTC
  const endOfMonth = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0),
  ); // Last day of the month in UTC

  // Get financial year range (April 1st to March 31st of the next year in UTC)
  let startOfYear, endOfYear;

  // If the date is between January 1st and March 31st, it's in the previous financial year
  if (date.getUTCMonth() < 3) {
    startOfYear = new Date(Date.UTC(date.getUTCFullYear() - 1, 3, 1)); // Previous year, April 1st
    endOfYear = new Date(Date.UTC(date.getUTCFullYear(), 2, 31)); // Current year, March 31st
  } else {
    startOfYear = new Date(Date.UTC(date.getUTCFullYear(), 3, 1)); // Current year, April 1st
    endOfYear = new Date(Date.UTC(date.getUTCFullYear() + 1, 2, 31)); // Next year, March 31st
  }

  return {
    today: [dateString, dateString],
    week: [
      startOfWeek.toISOString().split("T")[0],
      endOfWeek.toISOString().split("T")[0],
    ],
    month: [
      startOfMonth.toISOString().split("T")[0],
      endOfMonth.toISOString().split("T")[0],
    ],
    year: [
      startOfYear.toISOString().split("T")[0],
      endOfYear.toISOString().split("T")[0],
    ],
  };
}
