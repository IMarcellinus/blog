import Cookies from "js-cookie";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { IoMdAddCircleOutline } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getAllBook,
  getBook,
  setActive,
  setBookSearch,
  setCurrentPageBook,
  setEdit,
  setId,
  setKodeBuku,
  setMessage,
  setNamaBuku,
  setTanggalPengesahan,
} from "../../../services/store/reducers/Bookslice";
import BookList from "./BookList";
import ModalBook from "./ModalBook";
import SearchBarBook from "./SearchBarBook";

const BookPage = ({ authUser }) => {
  // console.log(authUser.role);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const {
    books,
    isLoading,
    totalPagesBook,
    isSubmit,
    isUpdate,
    isDelete,
    currentPageBook,
    status,
    search,
    bookSearch,
    idUser,
  } = useSelector((state) => state.books);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = Cookies.get("token");

  const handleOpenModal = () => {
    setModalIsOpen(true);
    document.body.style.overflow = "hidden";
  };

  const handleCloseModal = () => {
    setModalIsOpen(false);
    dispatch(setId(null));
    dispatch(setNamaBuku(""));
    dispatch(setActive(false));
    dispatch(setKodeBuku(""));
    dispatch(setTanggalPengesahan(""));
    dispatch(setMessage(""));
    dispatch(setEdit(""));
    document.body.style.overflow = "auto";
  };

  useEffect(() => {
    if(isSubmit === true){
      handleCloseModal();
      toast.success('Tambah Buku Berhasil');
      if (search !== '') {
        dispatch(getAllBook({ currentPageBook: currentPageBook + 1, search }));
      } else {
        dispatch(getBook({ currentPageBook: currentPageBook + 1 }));
      }
    }
    if (isDelete === true) {
      toast.error('Hapus Berhasil !');
      if (books.length == 1 && bookSearch.length == 0 && search == '' && currentPageBook > 0) {
        dispatch(getBook({ currentPageBook }));
        dispatch(setCurrentPageBook(currentPageBook - 1));
      } else if (books.length > 1 && bookSearch.length == 0 && search == '') {
        dispatch(getBook({ currentPageBook: currentPageBook + 1 }));
      } else if (books.length == 1 && bookSearch.length == 0 && search == '' && currentPageBook == 0) {
        dispatch(getBook({ currentPageBook: currentPageBook + 1 }));
      } else if (books.length == 0 && bookSearch.length == 1 && search !== '' && currentPageBook > 0) {
        dispatch(getAllBook({ currentPageBook, search }));
        dispatch(setCurrentPageBook(currentPageBook - 1));
      } else if (books.length == 0 && bookSearch.length > 1 && search !== '') {
        dispatch(getAllBook({ currentPageBook: currentPageBook + 1, search }));
      } else if (books.length == 0 && bookSearch.length == 1 && search !== '' && currentPageBook == 0) {
        dispatch(getAllBook({ currentPageBook: currentPageBook + 1, search }));
      }
    }
    if (isUpdate === true) {
      handleCloseModal();
      toast.success('Edit Buku Berhasil!');
      if (search !== '') {
        dispatch(getAllBook({ currentPageBook: currentPageBook + 1, search }));
      } else {
        dispatch(getBook({ currentPageBook: currentPageBook + 1 }));
      }
    }
  }, [currentPageBook, dispatch, isSubmit, search, isUpdate, isDelete])

  useEffect(() => {
    dispatch(setCurrentPageBook(0));
    dispatch(setBookSearch());
  }, [dispatch]);

  useEffect(() => {
    let timeoutId;

    const fetchData = () => {
      if (search !== "") {
        dispatch(getAllBook({ currentPageBook: 1, search }));
      } else if (search == "") {
        dispatch(getBook({ currentPageBook: 1 }));
      }
      dispatch(setCurrentPageBook(0));
    };

    const delayedFetch = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fetchData();
      }, 1000);
      // Menjalankan fetchData setelah jeda 3 detik
    };

    delayedFetch();

    return () => {
      clearTimeout(timeoutId);
      // Membersihkan timeout jika komponen unmount sebelum jeda 3 detik selesai
    };
  }, [search, dispatch]);

  useEffect(() => {
    if (!isDelete && search !== "") {
      dispatch(getAllBook({ currentPageBook: currentPageBook + 1, search }));
    } else if (!isDelete && search == "") {
      dispatch(getBook({ currentPageBook: currentPageBook + 1 }));
    }
  }, [currentPageBook, dispatch, isDelete, search]);

  return (
    <main className="min-h-screen overflow-x-auto pb-14">
      <div className="inline-block min-w-full pl-4">
        <div className="rounded-b-lg">
          <div className="grid grid-cols-2 bg-white p-3 text-sm">
            <div>
              <p className="text-lg font-bold">Book List</p>
              <div className="mt-2">
                <SearchBarBook />
              </div>
            </div>
            <div className="flex items-end justify-end ">
              <button
                onClick={handleOpenModal}
                className="flex items-center gap-1 rounded-md bg-sky-600 px-3 py-2 text-white"
              >
                Add Book
                <IoMdAddCircleOutline className="h-6 w-6" />
              </button>
              <ModalBook
                handleCloseModal={handleCloseModal}
                modalIsOpen={modalIsOpen}
                setModalIsOpen={setModalIsOpen}
              />
            </div>
          </div>
          <div>
            <BookList
              totalPages={totalPagesBook}
              currentPageBook={currentPageBook}
              isLoading={isLoading}
              books={books}
              setModalIsOpen={setModalIsOpen}
              authUser={authUser}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

const authUserShape = {
  role: PropTypes.string.isRequired,
};

BookPage.propTypes = {
  authUser: PropTypes.shape(authUserShape).isRequired,
};

export default BookPage;
