import React from "react";

const SkeletonTable = () => {
  return (
    <div className="min-h-[470px]">
      <table className="w-full table-auto border-blue-500">
        <thead className="border-y border-slate-400">
          <tr>
            <th className="p-4">
              <div className="h-4 bg-gray-200 rounded"></div>
            </th>
            <th className="p-4">
              <div className="h-4 bg-gray-200 rounded"></div>
            </th>
            <th className="p-4">
              <div className="h-4 bg-gray-200 rounded"></div>
            </th>
            <th className="p-4">
              <div className="h-4 bg-gray-200 rounded"></div>
            </th>
            <th className="p-4">
              <div className="h-4 bg-gray-200 rounded"></div>
            </th>
            <th className="p-4">
              <div className="h-4 bg-gray-200 rounded"></div>
            </th>
          </tr>
        </thead>
        <tbody className="border">
          {[...Array(10)].map((_, index) => (
            <tr key={index} className="border-b border-slate-200">
              <td className="p-4">
                <div className="h-4 bg-gray-100 rounded"></div>
              </td>
              <td className="p-4">
                <div className="h-4 bg-gray-100 rounded"></div>
              </td>
              <td className="p-4">
                <div className="h-4 bg-gray-100 rounded"></div>
              </td>
              <td className="p-4">
                <div className="h-4 bg-gray-100 rounded"></div>
              </td>
              <td className="p-4">
                <div className="h-4 bg-gray-100 rounded"></div>
              </td>
              <td className="p-4">
                <div className="h-4 bg-gray-100 rounded"></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex justify-center gap-4">
        <div className="w-10 h-10 bg-gray-200 rounded"></div>
        <div className="w-10 h-10 bg-gray-200 rounded"></div>
        <div className="w-10 h-10 bg-gray-200 rounded"></div>
        <div className="w-10 h-10 bg-gray-200 rounded"></div>
        <div className="w-10 h-10 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};

export default SkeletonTable;
