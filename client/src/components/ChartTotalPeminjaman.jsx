import React, { useEffect, useState } from "react";
import { MdOutlineBook } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { GetDataAvailableBooks } from "../../services/store/reducers/Dashboardslice";


const ChartTotalPeminjaman = () => {
  const { availabelBooks } = useSelector((state) => state.dashboard);

  return (
    <div className="w-full h-full rounded-md flex flex-col items-center p-4 justify-center shadow-md ">
      <span className="text-center text-base font-semibold text-black selection:font-semibold">Jumlah Buku Tersedia :</span>
      <div className="flex items-center text-center">
        <MdOutlineBook className="text-3xl text-black" />
        <span className="ml-1 text-lg font-bold">{availabelBooks}</span>
      </div>
    </div>
  );
};

export default ChartTotalPeminjaman;
