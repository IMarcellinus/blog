import Tippy from "@tippyjs/react";
import PropTypes from "prop-types";
import { AiOutlineEdit } from "react-icons/ai";
import { HiTrash } from "react-icons/hi";
import ReactPaginate from "react-paginate";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setCurrentPageBook } from "../../../services/store/reducers/Bookslice";

const BookList = ({
  authUser,
  isLoading,
  books,
  setModalIsOpen,
  totalPages,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { search, bookSearch, currentPageBook, deleteFail, message } =
    useSelector((state) => state.books);
  const { role } = authUser;

  const changePage = ({ selected }) => {
    dispatch(setCurrentPageBook(selected));
  };

  return (
    <div className="min-h-[470px]">
      <table className="w-full table-auto border-blue-500 ">
        <thead className="border-y border-slate-400">
          <tr className="bg-white text-sm uppercase  leading-normal text-gray-600">
            <th className="px-4 py-3 text-left">No</th>
            <th className="px-4 py-3 text-left">Nama Buku</th>
            <th className="px-4 py-3 text-left">Kode Buku</th>
            <th className="px-4 py-3 text-left">Tanggal Pengesahan</th>
            <th className="px-4 py-3 text-left">Action</th>
          </tr>
        </thead>
        <tbody className="border text-sm font-light">
          {!isLoading &&
            (search === "" ? books : bookSearch)?.map((book, index) => (
              <tr
                key={book.id}
                className={`cursor-pointer border-b border-gray-200 hover:bg-blue-100 ${
                  index % 2 === 0 ? "bg-slate-100" : "bg-white"
                }`}
              >
                <td className="p-4 text-left">{index + 1}</td>
                <td className="p-4 text-left">{book.nama_buku}</td>
                <td className="p-4 text-left">{book.kode_buku}</td>
                <td className="p-4 text-left">{book.tanggal_pengesahan}</td>
                <td className="relative flex h-full gap-3 px-4 py-3">
                  <Tippy content="Delete" followCursor>
                    <div className="size-6 text-slate-500 hover:cursor-pointer hover:text-slate-600">
                      <HiTrash className="size-full" />
                    </div>
                  </Tippy>
                  <Tippy content="Edit" followCursor>
                    <div className="size-6 text-slate-500 hover:cursor-pointer hover:text-slate-600">
                      <AiOutlineEdit className="size-full" />
                    </div>
                  </Tippy>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      {!isLoading && (bookSearch == null || books === null) && (
        <div className="flex justify-center py-4">
          <p>Data tidak ditemukan</p>
        </div>
      )}
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
