import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { IoMdAddCircleOutline } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ModalPengembalian from "./ModalPengembalian";

import {
  getAllBookBorrow,
  getBorrowBook,
  setBookBorrowSearch,
  setCurrentPageBookBorrow,
  setKodeBuku,
  setMessage,
  setSearch,
} from "../../../services/store/reducers/Borrowslice";
import PeminjamanList from "./PeminjamanList";
import SearchBarPeminjaman from "./SearchBarPeminjaman";
import SkeletonTable from "../../components/Skeleton/SkeletonTable";

const PengembalianPage = ({ authUser }) => {
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

  const { fetchUser } = useSelector((state) => state.auth);

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

  useEffect(() => {
    dispatch(setCurrentPageBookBorrow(0));
    dispatch(setBookBorrowSearch());
    dispatch(setSearch(""));
  }, [dispatch]);

  useEffect(() => {
    let timeoutId;
    const fetchData = () => {
      const currentPage = 1;
      if (search) {
        dispatch(
          getAllBookBorrow({ currentPageBookBorrow: currentPage, search })
        );
      } else {
        dispatch(getBorrowBook({ currentPageBookBorrow: currentPage }));
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
      dispatch(
        getAllBookBorrow({ currentPageBookBorrow: currentPage, search })
      );
    } else {
      dispatch(getBorrowBook({ currentPageBookBorrow: currentPage }));
    }
  }, [currentPageBookBorrow, dispatch, search]);

  useEffect(() => {
    if (isUpdate) {
      handleCloseModal();
      toast.success("Return Book Berhasil");
      const currentPage = currentPageBookBorrow + 1;
      if (search) {
        dispatch(
          getAllBookBorrow({ currentPageBookBorrow: currentPage, search })
        );
      } else {
        dispatch(getBorrowBook({ currentPageBookBorrow: currentPage }));
      }
    }
  }, [currentPageBookBorrow, dispatch, isUpdate, search]);

  return (
    <main className="min-h-screen overflow-x-auto pb-14">
      <div className="inline-block min-w-full pl-4">
        <div className="rounded-b-lg">
          <div className="grid grid-cols-2 bg-white py-3 text-sm">
            <div>
              <p className="text-lg font-bold">Return Book List</p>
              <div className="mt-2">
                <SearchBarPeminjaman />
              </div>
            </div>
            <ModalPengembalian
              handleCloseModal={handleCloseModal}
              modalIsOpen={modalIsOpen}
              setModalIsOpen={setModalIsOpen}
            />
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

PengembalianPage.propTypes = {
  authUser: PropTypes.shape(authUserShape).isRequired,
};

export default PengembalianPage;
