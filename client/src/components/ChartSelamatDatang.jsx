import React from "react";
import { useSelector } from "react-redux";
import { TbUserCode } from "react-icons/tb";

const ChartSelamatDatang = () => {
  const { totalUser } = useSelector((state) => state.dashboard);

  return (
    <div className="w-full h-full rounded-md flex flex-col items-center p-4 justify-top shadow-md">
      <span className="text-top text-2xl sm:text-3xl font-bold text-black selection:font-semibold">
        SELAMAT DATANG DI SILAPER
        </span>
      <div className="flex items-top text-top justify-top">
      </div>
    </div>
  );
};

export default ChartSelamatDatang;
