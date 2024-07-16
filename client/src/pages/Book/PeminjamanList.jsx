import Tippy from "@tippyjs/react";
import PropTypes from "prop-types";
import { useEffect } from "react";
import { TbBooksOff } from "react-icons/tb";
import ReactPaginate from "react-paginate";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import {
  returnBorrowBook,
  setCurrentPageBookBorrow,
  setId,
  setRating,
} from "../../../services/store/reducers/Borrowslice";

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
  const changePage = ({ selected }) => {
    dispatch(setCurrentPageBookBorrow(selected));
  };

  const isPengembalianPage = location.pathname === "/pengembalian";

  const handleReturnBook = (id) => {
    // console.log(id)
    dispatch(setId(id));
    dispatch(setRating(""))
    setModalIsOpen(true)
  };

  // Filter booksBorrows to only include those with is_pinjam set to true
  // Apply filter only if authUser.role is admin
  const filteredBooksBorrows =
    authUser.role !== "admin"
      ? (search === "" ? booksBorrows : bookBorrowSearch)?.filter(
          (booksBorrow) => booksBorrow.is_pinjam
        )
      : search === ""
      ? booksBorrows
      : bookBorrowSearch;

  const noBooksBorrowed = !isLoading && filteredBooksBorrows.length === 0;

  return (
    <div className="min-h-[470px]">
      <table className="w-full table-auto border-blue-500 ">
        <thead className="border-y border-slate-400">
          <tr className="bg-white text-sm uppercase  leading-normal text-gray-600">
            <th className="px-4 py-3 text-left">No</th>
            <th className="px-4 py-3 text-left">Nama Buku</th>
            <th className="px-4 py-3 text-left">Kode Buku</th>
            <th className="px-4 py-3 text-left">Tanggal Pengesahan</th>
            <th className="px-4 py-3 text-left">Nim</th>
            <th className="px-4 py-3 text-left">Status</th>
            {isPengembalianPage && (
              <th className="px-4 py-3 text-left">Action</th>
            )}
          </tr>
        </thead>
        <tbody className="border text-sm font-light">
          {!isLoading &&
            filteredBooksBorrows?.map((booksBorrow, index) => (
              <tr
                key={booksBorrow.id}
                className={`cursor-pointer border-b border-gray-200 hover:bg-blue-100 ${
                  index % 2 === 0 ? "bg-slate-100" : "bg-white"
                }`}
              >
                <td className="p-4 text-left">{index + 1}</td>
                <td className="p-4 text-left">{booksBorrow.book?.nama_buku}</td>
                <td className="p-4 text-left">{booksBorrow.book?.kode_buku}</td>
                <td className="p-4 text-left">
                  {booksBorrow.book?.tanggal_pengesahan}
                </td>
                <td className="p-4 text-left">
                  {booksBorrow.nim}
                </td>
                <td className="p-4 text-left">
                  {booksBorrow.is_pinjam ? "sedang dipinjam" : "tidak dipinjam"}
                </td>
                {isPengembalianPage && booksBorrow.is_pinjam && (
                  <td className="relative flex h-full gap-3 px-4 py-3">
                    <Tippy content="Return Book" followCursor>
                      <div
                        className="size-6 text-slate-500 hover:cursor-pointer hover:text-slate-600"
                        onClick={() =>
                          handleReturnBook(
                            booksBorrow.id,
                          )
                        }
                      >
                        <TbBooksOff className="size-full" />
                      </div>
                    </Tippy>
                  </td>
                )}
              </tr>
            ))}
        </tbody>
      </table>
      {noBooksBorrowed && (
        <div className="flex justify-center py-4">
          <p>Data tidak ditemukan</p>
        </div>
      )}
      <div className="mt-4">
        <ReactPaginate
          forcePage={currentPageBookBorrow}
          previousLabel={"< Prev"}
          nextLabel={"Next >"}
          pageCount={totalPagesBookBorrow}
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
