import { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";

const SpeedoMeter = ({ title, achivedValue, targetValue }) => {
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

  const formatValue = (value) => {
    if (value === undefined || value === null) return "0";
    const num = Number(value);
    if (isNaN(num)) return "0";
    if (num < 1000) return num.toString();
    if (num < 100000) return (num / 1000).toFixed(2) + "K";
    if (num < 10000000) return (num / 100000).toFixed(2) + "L";
    if (num < 1000000000) return (num / 10000000).toFixed(2) + "Cr";
    if (num < 100000000000) return (num / 1000000000).toFixed(2) + "Ar";
    return (num / 10000000000000).toFixed(2) + "Kharab";
  };

  const validValue = achivedValue || 0;
  const val = targetValue || 0;
  const maxValue = val <= 1 ? 5 : val;

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const labelColor = isDark ? "#CBD5E1" : "#334155";
    const tickColor = isDark ? "#94A3B8" : "#475569";
    const detailColor = isDark ? "#FFAB91" : "#EA580C";
    const mainProgressColor = isDark ? "#FFAB91" : "#FF7D54";
    const innerProgressColor = isDark ? "#FD7347" : "#E64A19";
    const trackColor = isDark ? "rgba(255, 255, 255, 0.1)" : "#E2E8F0";

    const option = {
      series: [
        {
          type: "gauge",
          center: ["50%", "60%"],
          startAngle: 200,
          endAngle: -20,
          min: 0,
          max: maxValue,
          splitNumber: 5,
          itemStyle: {
            color: mainProgressColor,
          },
          progress: {
            show: true,
            width: 24,
          },
          pointer: {
            show: false,
          },
          axisLine: {
            lineStyle: {
              width: 24,
              color: [[1, trackColor]],
            },
          },
          axisTick: {
            distance: -36,
            splitNumber: 5,
            lineStyle: {
              width: 2,
              color: tickColor,
            },
          },
          splitLine: {
            distance: -42,
            length: 12,
            lineStyle: {
              width: 3,
              color: tickColor,
            },
          },
          axisLabel: {
            distance: -16,
            color: labelColor,
            fontSize: 11,
            fontWeight: "600",
            formatter: (value) => formatValue(value),
          },
          anchor: {
            show: false,
          },
          title: {
            show: false,
          },
          detail: {
            valueAnimation: true,
            width: "60%",
            lineHeight: 40,
            borderRadius: 8,
            offsetCenter: [0, "-15%"],
            fontSize: 22,
            fontWeight: "bolder",
            formatter: (value) => formatValue(value),
            color: detailColor,
          },
          data: [
            {
              value: validValue,
            },
          ],
        },
        {
          type: "gauge",
          center: ["50%", "60%"],
          startAngle: 200,
          endAngle: -20,
          min: 0,
          max: maxValue,
          itemStyle: {
            color: innerProgressColor,
          },
          progress: {
            show: true,
            width: 6,
          },
          pointer: {
            show: false,
          },
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            show: false,
          },
          axisLabel: {
            show: false,
          },
          detail: {
            show: false,
          },
          data: [
            {
              value: validValue,
            },
          ],
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
  }, [validValue, maxValue, isDark]);

  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-between gap-3 p-3 sm:p-4 rounded-xl bg-white dark:bg-dark-bg shadow-sm transition-all duration-300 w-full min-w-0">
      <div className="text-center text-lg sm:text-xl font-bold text-black dark:text-white transition-colors truncate w-full">
        {title}
      </div>
      <div ref={chartRef} className="w-full h-56 sm:h-64" />
    </div>
  );
};

export default SpeedoMeter;
