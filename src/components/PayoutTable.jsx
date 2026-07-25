import { convertDateFormat, getDateRanges } from "../utils/dateUtil";

function TableCell({ label, value, colspan }) {
  return (
    <td
      colSpan={colspan}
      className="border border-gray-300 dark:border-gray-600 text-center p-1 md:p-2"
    >
      <div className="grid grid-cols-1 place-items-center">
        <div className="whitespace-normal text-xs text-black dark:text-white min-w-[100px]">
          ₹ {value}
        </div>
        {label && (
          <div className="whitespace-normal text-xs text-black dark:text-gray-300 min-w-[100px]">
            {label}
          </div>
        )}
      </div>
    </td>
  );
}

function DDSTable({ ddsValues }) {
  return (
    <table className="w-full border border-gray-300 dark:border-gray-600">
      <tbody>
        <tr>
          <TableCell value={(ddsValues?.ninety + ddsValues?.reNinety) || 0} label="90 Days" />
          <TableCell value={(ddsValues?.oneEighty + ddsValues?.reOneEighty) || 0} label="180 Days" />
          <TableCell value={(ddsValues?.threeSixtyFive + ddsValues?.reThreeSixtyFive) || 0} label="365 Days" />
        </tr>
        <tr>
          <TableCell value={ddsValues?.total} colspan={3} />
        </tr>
      </tbody>
    </table>
  );
}

function RDSTable({ rdsValues }) {
  return (
    <table className="w-full border border-gray-300 dark:border-gray-600">
      <tbody>
        <tr>
          <TableCell value={rdsValues?.new} label="(New)" />
          <TableCell value={rdsValues?.renewal} label="(Renewal)" />
        </tr>
        <tr>
          <TableCell value={rdsValues?.total} colspan={2} />
        </tr>
      </tbody>
    </table>
  );
}

function FixedTable({ fixValues }) {
  return (
    <table className="w-full border border-gray-300 dark:border-gray-600">
      <tbody>
        <tr>
          <TableCell value={fixValues?.below} label="(Below 2 years)" />
          <TableCell value={fixValues?.above} label="(Above 2 years)" />
        </tr>
        <tr>
          <TableCell value={fixValues?.total} colspan={2} />
        </tr>
      </tbody>
    </table>
  );
}

function PayoutTable({ data, today }) {
  const rangeData = getDateRanges(today);
  const periods = [
    {
      label: "Today Collection",
      range: convertDateFormat(rangeData.today[0]),
      data: data.today,
    },
    {
      label: "Week Collection",
      range: `${convertDateFormat(rangeData.week[0])} - ${convertDateFormat(rangeData.week[1])}`,
      data: data.week,
    },
    {
      label: "Month Collection",
      range: `${convertDateFormat(rangeData.month[0])} - ${convertDateFormat(rangeData.month[1])}`,
      data: data.month,
    },
    {
      label: "Year Collection",
      range: `${convertDateFormat(rangeData.year[0])} - ${convertDateFormat(rangeData.year[1])}`,
      data: data.year,
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-900 dark:text-gray-400 bg-brand">
          <tr>
            <th className="text-center p-1 text-white min-w-[170px] bg-white dark:bg-dark-bg"></th>
            <th className="border border-gray-300 dark:border-gray-600 text-center p-1 text-white min-w-[300px]">DDS</th>
            <th className="border border-gray-300 dark:border-gray-600 text-center p-1 text-white min-w-[200px]">RD</th>
            <th className="border border-gray-300 dark:border-gray-600 text-center p-1 text-white min-w-[200px]">FD</th>
            <th className="border border-gray-300 dark:border-gray-600 text-center p-1 text-white min-w-[100px]">XJSY/XUBY/XUY</th>
            <th className="border border-gray-300 dark:border-gray-600 text-center p-1 text-white min-w-[100px]">MIP</th>
            <th className="border border-gray-300 dark:border-gray-600 text-center p-1 text-white min-w-[100px]">TOTAL COLLECTION</th>
          </tr>
        </thead>
        <tbody>
          {periods.map((period) => (
            <tr key={period?.label} className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
              <th className="border border-gray-300 dark:border-gray-600 h-16 p-1 text-xs bg-brand dark:bg-[#252f66] text-white">
                <div className="grid grid-cols-1 place-items-center">
                  <div className="whitespace-normal">{period?.label}</div>
                  <div className="whitespace-normal">{period?.range}</div>
                </div>
              </th>
              <td className="p-0">
                <DDSTable ddsValues={period?.data?.dds} />
              </td>
              <td className="p-0">
                <RDSTable rdsValues={period?.data?.rds} />
              </td>
              <td className="p-0">
                <FixedTable fixValues={period?.data?.fixed} />
              </td>
              <td className="border border-gray-300 dark:border-gray-600 h-16 text-xs p-1">
                <div className="grid grid-cols-1 place-items-center">
                  <p className="text-black dark:text-white whitespace-normal">₹ {period?.data?.yojna}</p>
                </div>
              </td>
              <td className="border border-gray-300 dark:border-gray-600 h-16 text-xs p-1">
                <div className="grid grid-cols-1 place-items-center">
                  <p className="text-black dark:text-white whitespace-normal">₹ {period?.data?.mip}</p>
                </div>
              </td>
              <td className="border border-gray-300 dark:border-gray-600 h-16 text-xs p-1">
                <div className="grid grid-cols-1 place-items-center">
                  <p className="text-black dark:text-white whitespace-normal">₹ {period?.data?.grandTotal}</p>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PayoutTable;
