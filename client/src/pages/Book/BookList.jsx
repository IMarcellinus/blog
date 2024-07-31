import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { AiOutlineEdit, AiOutlineEye } from "react-icons/ai";
import { HiTrash } from "react-icons/hi";
import Tippy from "@tippyjs/react";
import ReactPaginate from "react-paginate";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteBook,
  setCurrentPageBook,
  setDeleteFail,
  setDescription,
  setEdit,
  setId,
  setKategoriBuku,
  setMessage,
  setNamaBuku,
  setTanggalPengesahan,
  setToggleDetail,
} from "../../../services/store/reducers/Bookslice";

// Custom hook untuk menangani side effects
const useBookDelete = (deleteFail, message) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (deleteFail) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: message,
      });
      dispatch(setDeleteFail(false));
      dispatch(setMessage(""));
    }
  }, [deleteFail, message, dispatch]);
};

// Komponen terpisah untuk baris buku
const BookRow = ({ book, index, role, handleDetail, handleEdit, handleDelete }) => {
  return (
    <tr
      className={`cursor-pointer border-b border-gray-200 hover:bg-blue-100 ${
        index % 2 === 0 ? "bg-slate-100" : "bg-white"
      }`}
    >
      <td className="p-4 text-left">{index + 1}</td>
      <td className="p-4 text-left">{book.nama_buku}</td>
      <td className="p-4 text-left">{book.kode_buku}</td>
      <td className="p-4 text-left">{book.kategori_buku}</td>
      <td className="p-4 text-left">{book.tanggal_pengesahan}</td>
      <td className="p-4 text-left">{book.book_prodi}</td>
      {role === "admin" && (
        <td className="relative flex h-full gap-3 px-4 py-3">
          <Tippy content="Show" followCursor>
            <div
              className="h-6 w-6 text-slate-500 hover:cursor-pointer hover:text-slate-600"
              onClick={() => handleDetail(book)}
            >
              <AiOutlineEye className="h-full w-full" />
            </div>
          </Tippy>
          <Tippy content="Edit" followCursor>
            <div
              className="h-6 w-6 text-slate-500 hover:cursor-pointer hover:text-slate-600"
              onClick={() => handleEdit(book)}
            >
              <AiOutlineEdit className="h-full w-full" />
            </div>
          </Tippy>
          <Tippy content="Delete" followCursor>
            <div
              className="h-6 w-6 text-slate-500 hover:cursor-pointer hover:text-slate-600"
              onClick={() => handleDelete(book.id)}
            >
              <HiTrash className="h-full w-full" />
            </div>
          </Tippy>
        </td>
      )}
    </tr>
  );
};

// PropTypes untuk BookRow
BookRow.propTypes = {
  book: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  role: PropTypes.string.isRequired,
  handleDetail: PropTypes.func.isRequired,
  handleEdit: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
};

const BookList = ({
  authUser,
  isLoading,
  books,
  setModalIsOpen,
  totalPages,
}) => {
  const dispatch = useDispatch();
  const { search, bookSearch, currentPageBook, deleteFail, message } =
    useSelector((state) => state.books);
  const { role } = authUser;

  // Menggunakan custom hook untuk handle delete
  useBookDelete(deleteFail, message);

  const changePage = ({ selected }) => {
    dispatch(setCurrentPageBook(selected));
  };

  const handleDetail = (book) => {
    setModalIsOpen(true);
    dispatch(setNamaBuku(book.nama_buku));
    dispatch(setTanggalPengesahan(book.tanggal_pengesahan));
    dispatch(setKategoriBuku(book.kategori_buku));
    dispatch(setDescription(book.description));
    dispatch(setToggleDetail(true));
    document.body.style.overflow = "hidden";
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteBook({ id }));
      }
    });
  };

  const handleEdit = (book) => {
    dispatch(setId(book.id));
    dispatch(setNamaBuku(book.nama_buku));
    dispatch(setTanggalPengesahan(book.tanggal_pengesahan));
    dispatch(setKategoriBuku(book.kategori_buku));
    dispatch(setDescription(book.description));
    dispatch(setEdit(true));
    setModalIsOpen(true);
  };

  const renderBooks = () => {
    const bookList = search === "" ? books : bookSearch;
    if (!isLoading && bookList?.length) {
      return bookList.map((book, index) => (
        <BookRow
          key={book.id}
          book={book}
          index={index}
          role={role}
          handleDetail={handleDetail}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        />
      ));
    } else {
      return (
        <tr>
          <td colSpan="6" className="text-center py-4">
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
            <th className="px-4 py-3 text-left">Nama Buku</th>
            <th className="px-4 py-3 text-left">Kode Buku</th>
            <th className="px-4 py-3 text-left">Kategori Buku</th>
            <th className="px-4 py-3 text-left">Tanggal Pengesahan</th>
            <th className="px-4 py-3 text-left">Buku Prodi</th>
            {role !== "user" && (
              <th className="px-4 py-3 text-left">Action</th>
            )}
          </tr>
        </thead>
        <tbody className="border text-sm font-light">
          {renderBooks()}
        </tbody>
      </table>
      <div className="mt-4">
        <ReactPaginate
          forcePage={currentPageBook}
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

BookList.propTypes = {
  totalPages: PropTypes.number,
  isLoading: PropTypes.bool.isRequired,
  books: PropTypes.array,
  authUser: PropTypes.shape(authUserShape).isRequired,
  setModalIsOpen: PropTypes.func.isRequired,
};

export default BookList;
