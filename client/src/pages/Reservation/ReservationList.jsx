import Tippy from "@tippyjs/react";
import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { AiOutlineEdit } from "react-icons/ai";
import { HiTrash } from "react-icons/hi";
import ReactPaginate from "react-paginate";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { setCurrentPageReservation } from "../../../services/store/reducers/Reservationslice";

// Custom hook untuk menangani side effects
const useReservationActions = (message) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (message) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: message,
      });
    }
  }, [message, dispatch]);
};

// Komponen terpisah untuk baris reservasi
const ReservationRow = ({ reservation, index }) => {
  return (
    <tr
      className={`cursor-pointer border-b border-gray-200 hover:bg-blue-100 ${
        index % 2 === 0 ? "bg-slate-100" : "bg-white"
      }`}
    >
      <td className="p-4 text-left">{index + 1}</td>
      <td className="p-4 text-left">{reservation.nim}</td>
      <td className="p-4 text-left">{reservation.book.nama_buku}</td>
      <td className="p-4 text-left">{reservation.book.kode_buku}</td>
      <td className="p-4 text-left">{reservation.book.kategori_buku}</td>
      <td className="p-4 text-left">{reservation.book.tanggal_pengesahan}</td>
      <td className="p-4 text-left">{reservation.expired_at}</td>
      <td className="p-4 text-left">
        {reservation.is_reservation ? "Sedang Reservasi" : "Tidak Reservasi"}
      </td>
    </tr>
  );
};

// PropTypes untuk ReservationRow
ReservationRow.propTypes = {
  reservation: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
};

const ReservationList = ({
  authUser,
  isLoading,
  reservations,
  totalPages,
  currentPageReservation,
}) => {
  const dispatch = useDispatch();
  const { search, reservationSearch, message } = useSelector(
    (state) => state.reservations
  );

  // Menggunakan custom hook untuk handle actions
  // useReservationActions(message);

  const changePage = ({ selected }) => {
    dispatch(setCurrentPageReservation(selected));
  };

  const renderReservations = () => {
    const reservationList = search === "" ? reservations : reservationSearch;
    if (!isLoading && reservationList?.length) {
      return reservationList.map((reservation, index) => (
        <ReservationRow
          key={reservation.id}
          reservation={reservation}
          index={index}
        />
      ));
    } else {
      return (
        <tr>
          <td colSpan="8" className="text-center py-4">
            Data tidak ditemukan
          </td>
        </tr>
      );
    }
  };

  return (
    <div className="min-h-[470px]">
      <table className="w-full table-auto border-blue-500">
        <thead className="border-y border-slate-400">
          <tr className="bg-white text-sm uppercase leading-normal text-gray-600">
            <th className="px-4 py-3 text-left">No</th>
            <th className="px-4 py-3 text-left">Nim</th>
            <th className="px-4 py-3 text-left">Nama Buku</th>
            <th className="px-4 py-3 text-left">Kode Buku</th>
            <th className="px-4 py-3 text-left">Kategori Buku</th>
            <th className="px-4 py-3 text-left">Tanggal Pengesahan</th>
            <th className="px-4 py-3 text-left">Expired Reservasi</th>
            <th className="px-4 py-3 text-left">Status</th>
          </tr>
        </thead>
        <tbody className="border text-sm font-light">
          {renderReservations()}
        </tbody>
      </table>
      <div className="mt-4">
        <ReactPaginate
          forcePage={currentPageReservation}
          previousLabel={"< Prev"}
          nextLabel={"Next >"}
          pageCount={totalPages}
          onPageChange={changePage}
          containerClassName={
            "pagination flex justify-center items-center gap-4 none-selection"
          }
          previousLinkClassName={
            "px-2 py-1 rounded-md bg-gray-200 hover:bg-gray-300"
          }
          nextLinkClassName={
            "px-2 py-1 rounded-md bg-gray-200 hover:bg-gray-300"
          }
          disabledClassName={"opacity-50 cursor-not-allowed"}
          activeClassName={"bg-blue-500 text-white px-2 py-1 rounded-md"}
        />
      </div>
    </div>
  );
};

const authUserShape = {
  role: PropTypes.string.isRequired,
};

ReservationList.propTypes = {
  totalPages: PropTypes.number,
  isLoading: PropTypes.bool.isRequired,
  reservations: PropTypes.array,
  currentPageReservation: PropTypes.number,
  authUser: PropTypes.shape(authUserShape).isRequired,
};

export default ReservationList;
