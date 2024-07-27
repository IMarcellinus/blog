import React from "react";
import Tippy from "@tippyjs/react";
import PropTypes from "prop-types";
import { TbBooksOff } from "react-icons/tb";
import ReactPaginate from "react-paginate";
import { useDispatch, useSelector } from "react-redux";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import {
  getAllBookBorrowAsc,
  getAllBookBorrowDsc,
  getBorrowBookAsc,
  getBorrowBookDsc,
  setCurrentPageBookBorrow,
  setId,
  setRating,
} from "../../../services/store/reducers/Borrowslice";
import RatingStar from "../../components/RatingStar";

const PeminjamanList = ({
  authUser,
  booksBorrows,
  totalPagesBookBorrow,
  currentPageBookBorrow,
  setModalIsOpen,
  bookBorrowSearch,
  isLoading,
  search,
}) => {
  const dispatch = useDispatch();
  const isPengembalianPage = location.pathname === "/pengembalian";
  const { isAscending } = useSelector((state) => state.borrowbooks);

  const handleReturnBook = (id) => {
    dispatch(setId(id));
    dispatch(setRating(""));
    setModalIsOpen(true);
  };

  const handleSort = (order) => (e) => {
    e.preventDefault();
    const currentPage = currentPageBookBorrow + 1;
    const sortAction = search
      ? order === "asc"
        ? getAllBookBorrowAsc
        : getAllBookBorrowDsc
      : order === "asc"
      ? getBorrowBookAsc
      : getBorrowBookDsc;
    console.log(isAscending);

    dispatch(
      sortAction({
        currentPageBookBorrow: currentPage,
        search,
        role: authUser.role,
      })
    );
  };

  const changePage = ({ selected }) => {
    dispatch(setCurrentPageBookBorrow(selected));
  };

  const filteredBooksBorrows = search ? bookBorrowSearch : booksBorrows;
  const noBooksBorrowed = !isLoading && filteredBooksBorrows.length === 0;

  return (
    <div className="min-h-[470px]">
      <table className="w-full table-auto border-blue-500">
        <thead className="border-y border-slate-400">
          <tr className="bg-white text-sm uppercase leading-normal text-gray-600">
            <th className="px-4 py-3 text-left">No</th>
            <th className="px-4 py-3 text-left">Nama Buku</th>
            <th className="px-4 py-3 text-left">Kode Buku</th>
            <th className="px-4 py-3 text-left">Tanggal Pengesahan</th>
            <th className="px-4 py-3 text-left">Nim</th>
            <th className="px-4 py-3 text-left">Rating</th>
            <th className="px-4 py-3 text-left">
              <div className="flex items-center space-x-2">
                <span>Status</span>
                <div className="flex flex-col items-center">
                  <Tippy content="Dipinjam" placement="top" inertia={true}>
                    <div className="cursor-pointer hover:text-black">
                      <IoIosArrowUp onClick={handleSort("asc")} />
                    </div>
                  </Tippy>
                  <Tippy content="Tidak Dipinjam" placement="bottom">
                    <div className="cursor-pointer hover:text-black">
                      <IoIosArrowDown onClick={handleSort("dsc")} />
                    </div>
                  </Tippy>
                </div>
              </div>
            </th>
            {isPengembalianPage && (
              <th className="px-4 py-3 text-left">Action</th>
            )}
          </tr>
        </thead>
        <tbody className="border text-sm font-light">
          {!isLoading &&
            filteredBooksBorrows?.map((booksBorrow, index) => (
              <PeminjamanRow
                key={booksBorrow.id}
                index={index}
                booksBorrow={booksBorrow}
                isPengembalianPage={isPengembalianPage}
                handleReturnBook={handleReturnBook}
              />
            ))}
        </tbody>
      </table>
      {noBooksBorrowed && (
        <div className="flex justify-center py-4">
          <p>Data tidak ditemukan</p>
        </div>
      )}
      <Pagination
        currentPage={currentPageBookBorrow}
        totalPages={totalPagesBookBorrow}
        onPageChange={changePage}
      />
    </div>
  );
};

const PeminjamanRow = ({
  index,
  booksBorrow,
  isPengembalianPage,
  handleReturnBook,
}) => (
  <tr
    className={`cursor-pointer border-b border-gray-200 hover:bg-blue-100 ${
      index % 2 === 0 ? "bg-slate-100" : "bg-white"
    }`}
  >
    <td className="p-4 text-left">{index + 1}</td>
    <td className="p-4 text-left">{booksBorrow.book?.nama_buku}</td>
    <td className="p-4 text-left">{booksBorrow.book?.kode_buku}</td>
    <td className="p-4 text-left">{booksBorrow.book?.tanggal_pengesahan}</td>
    <td className="p-4 text-left">{booksBorrow.nim}</td>
    <td className="p-4 text-left">
      <RatingStar rating={booksBorrow.rating} />
    </td>
    <td className="p-4 text-left">
      {booksBorrow.is_pinjam ? "sedang dipinjam" : "tidak dipinjam"}
    </td>
    {isPengembalianPage && booksBorrow.is_pinjam && (
      <td className="relative flex h-full gap-3 px-4 py-3">
        <Tippy content="Return Book" followCursor>
          <div
            className="size-6 text-slate-500 hover:cursor-pointer hover:text-slate-600"
            onClick={() => handleReturnBook(booksBorrow.id)}
          >
            <TbBooksOff className="size-full" />
          </div>
        </Tippy>
      </td>
    )}
  </tr>
);

const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <div className="mt-4">
    <ReactPaginate
      forcePage={currentPage}
      previousLabel={"< Prev"}
      nextLabel={"Next >"}
      pageCount={totalPages}
      onPageChange={onPageChange}
      containerClassName={
        "pagination flex justify-center items-center gap-4 none-selection"
      }
      previousLinkClassName={
        "px-2 py-1 rounded-md bg-gray-200 hover:bg-gray-300"
      }
      nextLinkClassName={"px-2 py-1 rounded-md bg-gray-200 hover:bg-gray-300"}
      disabledClassName={"opacity-50 cursor-not-allowed"}
      activeClassName={"bg-blue-500 text-white px-2 py-1 rounded-md"}
    />
  </div>
);

const authUserShape = {
  role: PropTypes.string.isRequired,
};

PeminjamanList.propTypes = {
  totalPagesBookBorrow: PropTypes.number,
  currentPageBookBorrow: PropTypes.number,
  isLoading: PropTypes.bool.isRequired,
  booksBorrows: PropTypes.array,
  bookBorrowSearch: PropTypes.array,
  authUser: PropTypes.shape(authUserShape).isRequired,
  setModalIsOpen: PropTypes.func.isRequired,
  search: PropTypes.string,
};

export default PeminjamanList;
