import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { IoMdAddCircleOutline } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import {
  getAllBookBorrow,
  getBorrowBook,
  setBookBorrowSearch,
  setCurrentPageBookBorrow,
  setKodeBuku,
  setMessage,
  setSearch,
} from "../../../services/store/reducers/Borrowslice";
import ModalPeminjaman from "./ModalPeminjaman";
import PeminjamanList from "./PeminjamanList";
import SearchBarPeminjaman from "./SearchBarPeminjaman";

const PeminjamanPage = ({ authUser }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const {
    booksBorrows,
    isLoading,
    totalPagesBookBorrow,
    isSubmit,
    isUpdate,
    isDelete,
    currentPageBookBorrow,
    status,
    search,
    bookBorrowSearch,
    idUser,
  } = useSelector((state) => state.borrowbooks);

  const {
    fetchUser,
  } = useSelector((state) => state.auth);

  // console.log("peminjaman page:",authUser.role)

  const handleOpenModal = () => {
    setModalIsOpen(true);
    document.body.style.overflow = "hidden";
  };

  const handleCloseModal = () => {
    setModalIsOpen(false);
    dispatch(setKodeBuku(""))
    dispatch(setMessage(""))
    document.body.style.overflow = "auto";
  };

  useEffect(() => {
    dispatch(setCurrentPageBookBorrow(0));
    dispatch(setBookBorrowSearch());
    dispatch(setSearch(""))
  }, [dispatch]);

  useEffect(() => {
    let timeoutId;
    const fetchData = () => {
      const currentPage = 1;
      if (search) {
        dispatch(
          getAllBookBorrow({ currentPageBookBorrow: currentPage, search, role: authUser.role })
        );
      } else {
        dispatch(getBorrowBook({ currentPageBookBorrow: currentPage, role: authUser.role }));
      }
      dispatch(setCurrentPageBookBorrow(0));
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
    const currentPage = currentPageBookBorrow + 1;
    if (search) {
      dispatch(getAllBookBorrow({ currentPageBookBorrow: currentPage, search, role: authUser.role }));
    } else {
      dispatch(getBorrowBook({ currentPageBookBorrow: currentPage, role: authUser.role }));
    }
  }, [currentPageBookBorrow, dispatch, search]);

  useEffect(() => {

    if (isSubmit) {
      handleCloseModal();
      toast.success("Create Borrow Book Success");
      const currentPage = currentPageBookBorrow + 1;
      if (search) {
        dispatch(getAllBookBorrow({ currentPageBookBorrow: currentPage, search, role: authUser.role }));
      } else {
        dispatch(getBorrowBook({ currentPageBookBorrow: currentPage, role: authUser.role }));
      }
    }

  }, [currentPageBookBorrow, dispatch, isUpdate, isSubmit, search]);

  return (
    <main className="min-h-screen overflow-x-auto pb-14">
      <div className="inline-block min-w-full pl-4">
        <div className="rounded-b-lg">
          <div className="grid grid-cols-2 bg-white py-3 text-sm">
            <div>
              <p className="text-lg font-bold">Borrow Book List</p>
              <div className="mt-2"><SearchBarPeminjaman /></div>
            </div>
            <div className="flex items-end justify-end ">
              <button
                onClick={handleOpenModal}
                className="flex items-center gap-1 rounded-md bg-sky-600 px-3 py-2 text-white"
              >
                Add Borrow Book
                <IoMdAddCircleOutline className="h-6 w-6" />
              </button>
              <ModalPeminjaman
                handleCloseModal={handleCloseModal}
                modalIsOpen={modalIsOpen}
                setModalIsOpen={setModalIsOpen}
              />
            </div>
          </div>
          <div>
            <PeminjamanList
              totalPagesBookBorrow={totalPagesBookBorrow}
              currentPageBookBorrow={currentPageBookBorrow}
              isLoading={isLoading}
              booksBorrows={booksBorrows}
              setModalIsOpen={setModalIsOpen}
              authUser={authUser}
              bookBorrowSearch={bookBorrowSearch}
              search={search}
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

PeminjamanPage.propTypes = {
  authUser: PropTypes.shape(authUserShape).isRequired,
};

export default PeminjamanPage;
