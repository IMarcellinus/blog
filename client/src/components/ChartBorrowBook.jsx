import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { useSelector } from "react-redux";

const ChartBorrowBook = () => {
  const [options, setOptions] = useState({
    chart: {
      type: "bar",
      stacked: false,
      toolbar: {
        show: false,
        offsetX: 0,
        offsetY: 0,
        tools: {
          download: false,
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: true,
          customIcons: [],
        },
      },
    },
    stroke: { width: [0, 2, 5], curve: "smooth" },
    plotOptions: {
      bar: { columnWidth: "70%" },
    },
    fill: {
      opacity: [0.85, 0.25, 1],
      gradient: {
        inverseColors: false,
        shade: "light",
        type: "vertical",
        opacityFrom: 0.85,
        opacityTo: 0.55,
        stops: [0, 100, 100, 100],
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: function (y) {
          if (typeof y !== "undefined") {
            return y.toFixed(0) + " points";
          }
          return y;
        },
      },
    },
    xaxis: {
      categories: [], // Initialize categories
    },
    markers: {
      size: 0,
    },
  });

  const [series, setSeries] = useState([]);

  const { dataProdi } = useSelector((state) => state.dashboard);

  useEffect(() => {
    if (dataProdi?.length) {
      setOptions((prevOptions) => ({
        ...prevOptions,
        xaxis: {
          ...prevOptions.xaxis,
          categories: dataProdi.map((data) => data.prodi), // Set categories
        },
      }));
      setSeries([
        {
          name: "Total Books",
          data: dataProdi.map((data) => data.total_books),
        },
      ]);
    } else if (dataProdi === null) {
      setOptions((prevOptions) => ({
        ...prevOptions,
        xaxis: {
          ...prevOptions.xaxis,
          categories: [],
        },
      }));
      setSeries([]);
    }
  }, [dataProdi]);

  return (
    <div className="col-span-2 row-span-1 h-[550px] rounded-lg bg-white p-4 shadow-md lg:p-6">
      <h1 className="text-center text-base font-semibold lg:text-lg">
        Data Borrowed Book of Prodi
      </h1>
      <ReactApexChart
        options={options}
        series={series}
        type={"bar"}
        height={"75%"}
        className="m-auto h-full w-full"
      />
    </div>
  );
};

export default ChartBorrowBook;
