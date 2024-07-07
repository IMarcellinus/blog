import React from "react";
import { useSelector } from "react-redux";
import { TbUserCode } from "react-icons/tb";

const ChartTotalUser = () => {
  const { totalUser } = useSelector((state) => state.dashboard);

  console.log(totalUser);

  return (
    <div className="w-full h-full rounded-md flex flex-col items-center p-4 justify-center shadow-md">
      <span className="text-black text-base font-thin">Jumlah User Tersedia :</span>
      <div className="flex items-center text-center justify-center">
        <TbUserCode className="text-3xl text-black" />
        <span className="ml-1 text-lg font-bold">{totalUser}</span>
      </div>
    </div>
  );
};

export default ChartTotalUser;
