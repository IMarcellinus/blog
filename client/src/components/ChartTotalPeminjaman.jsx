import React, { useEffect, useState } from "react";
import { MdOutlineBook } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { GetDataAvailableBooks } from "../../services/store/reducers/Dashboardslice";


const ChartTotalPeminjaman = () => {
  const dispatch = useDispatch();
  const { dataAvailabelBooks } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(GetDataAvailableBooks());
  }, [dispatch]);


  return (
    <div className="w-full h-full rounded-md flex flex-col items-center p-4 justify-center shadow-md ">
      <span className="text-black text-base font-thin">Jumlah Buku Tersedia :</span>
      <div className="flex items-center text-center">
        <MdOutlineBook className="text-3xl text-black" />
        <span className="ml-1 text-lg font-bold">{dataAvailabelBooks}</span>
      </div>
    </div>
  );
};

export default ChartTotalPeminjaman;
