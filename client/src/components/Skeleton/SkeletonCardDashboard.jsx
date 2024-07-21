const SkeletonCardDashboard = () => {
  return (
    <div className="w-full h-full rounded-md flex flex-col items-center p-4 justify-center shadow-md">
      <div className="h-8 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
      <div className="flex items-center text-center justify-center">
        <div className="h-8 bg-gray-200 rounded dark:bg-gray-700 w-8 mb-4 mr-4"></div>
        <div className="h-8 bg-gray-200 rounded dark:bg-gray-700 w-8 mb-4"></div>
      </div>
    </div>
  );
};

export default SkeletonCardDashboard;
