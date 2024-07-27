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
  setDescription,
  setEdit,
  setId,
  setKategoriBuku,
  setKodeBuku,
  setMessage,
  setNamaBuku,
  setSearch,
  setTanggalPengesahan,
  setToggleDetail,
} from "../../../services/store/reducers/Bookslice";
import BookList from "./BookList";
import ModalBook from "./ModalBook";
import SearchBarBook from "./SearchBarBook";
import { setIsDelete } from "../../../services/store/reducers/Bookslice";
import SkeletonTable from "../../components/Skeleton/SkeletonTable";

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
    search,
    bookSearch,
  } = useSelector((state) => state.books);
  const {
    fetchUser,
  } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
    dispatch(setKategoriBuku(""));
    dispatch(setDescription(""));
    dispatch(setMessage(""));
    dispatch(setEdit(""));
    dispatch(setToggleDetail(false));
    document.body.style.overflow = "auto";
  };

  const handleDeleteLogic = () => {
    const currentPage = currentPageBook + 1;
    if (books.length === 1 && bookSearch.length === 0 && !search && currentPageBook > 0) {
      dispatch(getBook({ currentPageBook }));
      dispatch(setCurrentPageBook(currentPageBook - 1));
    } else if (books.length > 1 && bookSearch.length === 0 && !search) {
      dispatch(getBook({ currentPageBook: currentPage }));
    } else if (books.length === 1 && bookSearch.length === 0 && !search && currentPageBook === 0) {
      dispatch(getBook({ currentPageBook: currentPage }));
    } else if (books.length === 0 && bookSearch.length === 1 && search && currentPageBook > 0) {
      dispatch(getAllBook({ currentPageBook, search }));
      dispatch(setCurrentPageBook(currentPageBook - 1));
    } else if (books.length === 0 && bookSearch.length > 1 && search) {
      dispatch(getAllBook({ currentPageBook: currentPage, search }));
    } else if (books.length === 0 && bookSearch.length === 1 && search && currentPageBook === 0) {
      dispatch(getAllBook({ currentPageBook: currentPage, search }));
    } else if (books.length === 0 && bookSearch.length === 0 && !search) {
      dispatch(getBook({currentPageBook}))
    }
  };

  useEffect(() => {
    if (isSubmit) {
      handleCloseModal();
      toast.success("Tambah Buku Berhasil");
      const currentPage = currentPageBook + 1;
      if (search) {
        dispatch(getAllBook({ currentPageBook: currentPage, search }));
      } else {
        dispatch(getBook({ currentPageBook: currentPage }));
      }
    }

    if (isDelete) {
      handleDeleteLogic();
      toast.error("Hapus Buku Berhasil !");
      dispatch(setIsDelete(false))
    }

    if (isUpdate) {
      handleCloseModal();
      toast.success("Edit Buku Berhasil!");
      const currentPage = currentPageBook + 1;
      if (search) {
        dispatch(getAllBook({ currentPageBook: currentPage, search }));
      } else {
        dispatch(getBook({ currentPageBook: currentPage }));
      }
    }
  }, [currentPageBook, dispatch, isSubmit, search, isUpdate, isDelete]);

  useEffect(() => {
    dispatch(setCurrentPageBook(0));
    dispatch(setBookSearch());
    dispatch(setSearch(""))
  }, [dispatch]);

  useEffect(() => {
    let timeoutId;
    const fetchData = () => {
      handleCloseModal();
      const currentPage = 1;
      if (search) {
        dispatch(getAllBook({ currentPageBook: currentPage, search }));
      } else {
        dispatch(getBook({ currentPageBook: currentPage }));
      }
      dispatch(setCurrentPageBook(0));
    };

    const delayedFetch = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(fetchData, 1000);
    };

    delayedFetch();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [search, dispatch]);

  useEffect(() => {
    if (!isDelete) {
      const currentPage = currentPageBook + 1;
      if (search) {
        dispatch(getAllBook({ currentPageBook: currentPage, search }));
      } else {
        dispatch(getBook({ currentPageBook: currentPage }));
      }
    }
  }, [currentPageBook, dispatch, isDelete, search]);

  return (
    <main className="min-h-screen overflow-x-auto pb-14">
      <div className="inline-block min-w-full pl-4">
        <div className="rounded-b-lg">
          <div className="grid grid-cols-2 bg-white py-3 text-sm">
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
            {isLoading ? (<SkeletonTable />) : (<BookList
              totalPages={totalPagesBook}
              currentPageBook={currentPageBook}
              isLoading={isLoading}
              books={books}
              setModalIsOpen={setModalIsOpen}
              authUser={authUser}
            />)}
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
