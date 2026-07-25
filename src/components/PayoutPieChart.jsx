import { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";

const EChartPie = ({ title, labels, dataValues }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return false;
  });

  useEffect(() => {
    const updateDarkState = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    updateDarkState();

    const observer = new MutationObserver(updateDarkState);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const pieData = labels.map((lbl, idx) => ({
      name: lbl,
      value: dataValues[idx] !== undefined ? dataValues[idx] : 0,
    }));

    const textColor = isDark ? "rgba(255, 255, 255, 0.9)" : "#474d58";
    const legendColor = isDark ? "rgba(255, 255, 255, 0.85)" : "#333333";

    const option = {
      title: {
        text: title,
        left: "center",
        top: 0,
        textStyle: {
          color: textColor,
          fontSize: 13,
          fontWeight: "bold",
          overflow: "truncate",
        },
      },
      tooltip: {
        trigger: "item",
        formatter: "{b}: {c} ({d}%)",
      },
      legend: {
        bottom: 0,
        left: "center",
        textStyle: {
          color: legendColor,
          fontSize: 11,
        },
      },
      color: [
        "#4E79A7",
        "#A0CBE8",
        "#F28E2B",
        "#FFBE7D",
        "#59A14F",
        "#8CD17D",
      ],
      series: [
        {
          name: title,
          type: "pie",
          radius: "72%",
          center: ["50%", "46%"],
          data: pieData,
          label: {
            show: false,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        },
      ],
    };

    chartInstance.current.setOption(option);

    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener("resize", handleResize);

    let resizeObserver;
    if (typeof ResizeObserver !== "undefined" && chartRef.current) {
      resizeObserver = new ResizeObserver(() => {
        chartInstance.current?.resize();
      });
      resizeObserver.observe(chartRef.current);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (resizeObserver && chartRef.current) {
        resizeObserver.unobserve(chartRef.current);
      }
    };
  }, [title, labels, dataValues, isDark]);

  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, []);

  return <div ref={chartRef} className="w-full h-full min-h-[250px] min-w-0" />;
};

const PayoutPieChart = ({ interval, grandTotal, data }) => {
  const allTotals = [];

  const ddsRaw = data?.dds ? Object.values(data.dds) : [];
  const ddsTotal = ddsRaw.length > 0 ? ddsRaw[ddsRaw.length - 1] : 0;
  const ddsData = ddsRaw.length > 0 ? ddsRaw.slice(0, ddsRaw.length - 1) : [];
  allTotals.push(ddsTotal);

  const rdsRaw = data?.rds ? Object.values(data.rds) : [];
  const rdsTotal = rdsRaw.length > 0 ? rdsRaw[rdsRaw.length - 1] : 0;
  const rdsData = rdsRaw.length > 0 ? rdsRaw.slice(0, rdsRaw.length - 1) : [];
  allTotals.push(rdsTotal);

  const fixRaw = data?.fixed ? Object.values(data.fixed) : [];
  const fixTotal = fixRaw.length > 0 ? fixRaw[fixRaw.length - 1] : 0;
  const fixData = fixRaw.length > 0 ? fixRaw.slice(0, fixRaw.length - 1) : [];
  allTotals.push(fixTotal);

  const yojnaData = [data?.yojna || 0];
  allTotals.push(yojnaData[0]);

  const mipData = [data?.mip || 0];
  allTotals.push(mipData[0]);

  const dds90 = (ddsData[0] || 0) + (ddsData[3] || 0);
  const dds180 = (ddsData[1] || 0) + (ddsData[4] || 0);
  const dds365 = (ddsData[2] || 0) + (ddsData[5] || 0);

  const labels = [
    [`90 Days:${dds90}`, `180 Days:${dds180}`, `365 Days:${dds365}`],
    [`New:${rdsData[0] || 0}`, `Renewal:${rdsData[1] || 0}`],
    [`Below 2 Years:${fixData[0] || 0}`, `2 years & Above:${fixData[1] || 0}`],
    [`XJSY/XUBY/XUY:${yojnaData[0]}`],
    [`MIP:${mipData[0]}`],
  ];

  const ddsValues = allTotals[0] > 0 ? [dds90, dds180, dds365] : [1];
  const rdsValues = allTotals[1] > 0 ? rdsData : [1];
  const fixValues = allTotals[2] > 0 ? fixData : [1];
  const yojnaValues = allTotals[3] > 0 ? yojnaData : [1];
  const mipValues = allTotals[4] > 0 ? mipData : [1];

  return (
    <div className="w-full flex flex-col mb-6">
      <h3 className="text-gray-700 dark:text-white/90 py-3 font-extrabold text-xl text-center transition-colors duration-300">
        {interval}`s Total Collection ₹{" "}
        <span className="text-gray-900 dark:text-white font-extrabold">{grandTotal}</span>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 lg:gap-4 w-full items-center justify-items-center">
        <div className="flex items-center justify-center h-[270px] w-full min-w-0">
          <EChartPie
            title={`DDS (Total:${allTotals[0]})`}
            labels={labels[0]}
            dataValues={ddsValues}
          />
        </div>
        <div className="flex items-center justify-center h-[270px] w-full min-w-0">
          <EChartPie
            title={`RD (Total:${allTotals[1]})`}
            labels={labels[1]}
            dataValues={rdsValues}
          />
        </div>
        <div className="flex items-center justify-center h-[270px] w-full min-w-0">
          <EChartPie
            title={`FD (Total:${allTotals[2]})`}
            labels={labels[2]}
            dataValues={fixValues}
          />
        </div>
        <div className="flex items-center justify-center h-[270px] w-full min-w-0">
          <EChartPie
            title={`XJSY/XUBY/XUY (Total:${allTotals[3]})`}
            labels={labels[3]}
            dataValues={yojnaValues}
          />
        </div>
        <div className="flex items-center justify-center h-[270px] w-full min-w-0">
          <EChartPie
            title={`MIP (Total:${allTotals[4]})`}
            labels={labels[4]}
            dataValues={mipValues}
          />
        </div>
      </div>
    </div>
  );
};

export default PayoutPieChart;