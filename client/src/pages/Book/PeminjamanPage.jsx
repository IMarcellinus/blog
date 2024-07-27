import PropTypes from "prop-types";
import { useEffect, useState, useCallback } from "react";
import { IoMdAddCircleOutline } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getAllBookBorrow,
  getBorrowBook,
  setBookBorrowSearch,
  setCurrentPageBookBorrow,
  setKodeBuku,
  setMessage,
  setSearch,
  setIsAscending,
  getAllBookBorrowAsc,
  getAllBookBorrowDsc,
  getBorrowBookAsc,
  getBorrowBookDsc,
  setIsDescending,
} from "../../../services/store/reducers/Borrowslice";
import ModalPeminjaman from "./ModalPeminjaman";
import PeminjamanList from "./PeminjamanList";
import SearchBarPeminjaman from "./SearchBarPeminjaman";
import SkeletonTable from "../../components/Skeleton/SkeletonTable";

const PeminjamanPage = ({ authUser }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const {
    booksBorrows,
    isLoading,
    totalPagesBookBorrow,
    isSubmit,
    currentPageBookBorrow,
    search,
    bookBorrowSearch,
    isAscending,
    isDescending,
  } = useSelector((state) => state.borrowbooks);

  const handleOpenModal = () => {
    setModalIsOpen(true);
    document.body.style.overflow = "hidden";
  };

  const handleCloseModal = () => {
    setModalIsOpen(false);
    dispatch(setKodeBuku(""));
    dispatch(setMessage(""));
    document.body.style.overflow = "auto";
  };

  // Step awal untuk fetching data
  const fetchData = useCallback(() => {
    const currentPage = 1;
    dispatch(setIsAscending(false)); // Set isAscending to false before fetching data
    dispatch(setIsDescending(false)); // Set isDescending to false before fetching data
    if (search) {
      dispatch(
        getAllBookBorrow({
          currentPageBookBorrow: currentPage,
          search,
          role: authUser.role,
        })
      );
    } else {
      dispatch(
        getBorrowBook({
          currentPageBookBorrow: currentPage,
          role: authUser.role,
        })
      );
    }
    dispatch(setCurrentPageBookBorrow(0));
  }, [authUser.role, search, dispatch]);

  useEffect(() => {
    dispatch(setCurrentPageBookBorrow(0));
    dispatch(setBookBorrowSearch());
    dispatch(setSearch(""));
  }, [dispatch]);

  useEffect(() => {
    const delayedFetch = setTimeout(fetchData, 1000);

    return () => {
      clearTimeout(delayedFetch);
    };
  }, [search, fetchData]);

  // Step untuk main pagination
  useEffect(() => {
    const currentPage = currentPageBookBorrow + 1;
    if (search) {
      let action;
      if (isAscending) {
        action = getAllBookBorrowAsc;
      } else if (isDescending) {
        action = getAllBookBorrowDsc;
      } else {
        action = getAllBookBorrow;
      }
      dispatch(
        action({
          currentPageBookBorrow: currentPage,
          search,
          role: authUser.role,
        })
      );
    } else {
      let action;
      if (isAscending) {
        action = getBorrowBookAsc;
      } else if (isDescending) {
        action = getBorrowBookDsc;
      } else {
        action = getBorrowBook;
      }
      dispatch(
        action({
          currentPageBookBorrow: currentPage,
          role: authUser.role,
        })
      );
    }
  }, [currentPageBookBorrow, dispatch, search, isAscending, isDescending, authUser.role]);


  useEffect(() => {
    if (isSubmit) {
      handleCloseModal();
      toast.success("Create Borrow Book Success");
      fetchData();
    }
  }, [isSubmit, fetchData]);

  return (
    <main className="min-h-screen overflow-x-auto pb-14">
      <div className="inline-block min-w-full pl-4">
        <div className="rounded-b-lg">
          <div className="grid grid-cols-2 bg-white py-3 text-sm">
            <div>
              <p className="text-lg font-bold">Borrow Book List</p>
              <div className="mt-2">
                <SearchBarPeminjaman />
              </div>
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
            {isLoading ? (
              <SkeletonTable />
            ) : (
              <PeminjamanList
                totalPagesBookBorrow={totalPagesBookBorrow}
                currentPageBookBorrow={currentPageBookBorrow}
                isLoading={isLoading}
                booksBorrows={booksBorrows}
                setModalIsOpen={setModalIsOpen}
                authUser={authUser}
                bookBorrowSearch={bookBorrowSearch}
                search={search}
                isAscending={isAscending}
              />
            )}
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
