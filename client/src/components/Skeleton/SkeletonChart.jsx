const SkeletonChart = () => {
  return (
    <div className="col-span-2 h-[550px] w-full rounded-lg bg-white p-2 shadow-md lg:col-span-1 lg:row-span-1 animate-pulse">
      <div className="w-full h-full flex flex-col items-center py-10">
        <div className="h-6 bg-gray-200 rounded-full dark:bg-gray-700 w-36 mb-2.5 flex items-center justify-center mx-auto"></div>
        <div className="relative h-[220px] w-[220px] md:h-[320px] md:w-[300px] lg:h-[150px] lg:w-[150px] mt-4 bg-gray-200 rounded-full xl:h-[300px] xl:w-[300px]"></div>
        <div className="flex flex-col items-center justify-center mt-6 py-4 gap-2">
          <div className="flex flex-row items-center gap-4">
            <div className="w-5 h-5 text-gray-200 dark:text-gray-700 rounded-full bg-gray-200"></div>
            <div className="w-24 h-3 bg-gray-200 rounded-full dark:bg-gray-700"></div>
          </div>
          <div className="flex flex-row items-center gap-4">
            <div className="w-24 h-3 bg-gray-200 rounded-full dark:bg-gray-700"></div>
            <div className="w-5 h-5 text-gray-200 dark:text-gray-700 rounded-full bg-gray-200"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonChart;
