import React from "react";
import ReactApexChart from "react-apexcharts";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

const ChartTotalDataManagement = () => {
  const [options, setOptions] = useState({
    chart: {
      type: "pie",
    },
    series: [],
    labels: [],
    legend: {
      position: "bottom",
      fontSize: "16px",
      markers: {
        radius: 8,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5,
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            position: "bottom",
          },
        },
      },
    ],
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val.toFixed(0) + "%";
      },
      style: {
        fontSize: "12px",
        colors: ["#333"],
      },
    },
    colors: [
      "#3b93f7",
      "#68D391",
      "#60A5FA",
      "#A78BFA",
      "#FBBF24",
      "#4FD1C5",
      "#F472B6",
    ],
  });

  const { dataAvailabelBooks } = useSelector((state) => state.dashboard);

  useEffect(() => {
    function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
    if (dataAvailabelBooks.length) {
      setOptions((prevOptions) => ({
        ...prevOptions,
        series: dataAvailabelBooks?.map((data) => data.total),
        labels: dataAvailabelBooks?.map((data) => capitalizeFirstLetter(data.name)),
      }));
    }
  }, [dataAvailabelBooks]);

  return (
    <div className="col-span-2 h-[550px] w-full rounded-lg bg-white p-2 text-sm shadow-md lg:col-span-1 lg:row-span-1">
      <h1 className="my-3 text-center text-base font-semibold text-black selection:font-semibold lg:text-lg">
        Data Management Book
      </h1>
      <ReactApexChart
        options={options}
        series={options.series}
        type={"pie"}
        height={"80%"}
        className="h-full w-full"
      />
    </div>
  );
};

export default ChartTotalDataManagement;
