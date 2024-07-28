import React from "react";

const SkeletonChartProdi = () => {
  return (
    <div className="col-span-2 row-span-1 h-[550px] rounded-lg bg-white p-4 shadow-md lg:p-6 flex flex-col w-full">
      <div className="h-8 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4 mx-auto"></div>
      <div className="flex items-baseline space-x-4 justify-center">
        <div className="w-14 bg-gray-200 rounded-t-lg h-96 dark:bg-gray-700"></div>
        <div className="w-14 bg-gray-200 rounded-t-lg h-96 dark:bg-gray-700"></div>
        <div className="w-14 bg-gray-200 rounded-t-lg h-96 dark:bg-gray-700"></div>
        <div className="w-14 bg-gray-200 rounded-t-lg h-96 dark:bg-gray-700"></div>
        <div className="w-14 bg-gray-200 rounded-t-lg h-96 dark:bg-gray-700"></div>
        <div className="w-14 bg-gray-200 rounded-t-lg h-96 dark:bg-gray-700"></div>
        <div className="w-14 bg-gray-200 rounded-t-lg h-96 dark:bg-gray-700"></div>
      </div>
      <div></div>
    </div>
  );
};

export default SkeletonChartProdi;
