import React, { useEffect, useState } from "react";
import { FaWindowClose } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import { BottomScrollListener } from "react-bottom-scroll-listener";
import {
  createBorrowBook,
  setMessage,
} from "../../../services/store/reducers/Borrowslice";
import {
  getAllBook,
  getBook,
  setFetchBook,
  setFetchBookSearch,
  setId,
  setIsLoadingBook,
} from "../../../services/store/reducers/Bookslice";
import Swal from "sweetalert2";

const ModalPeminjaman = ({ modalIsOpen, handleCloseModal }) => {
  const dispatch = useDispatch();
  const { message } = useSelector((state) => state.borrowbooks);
  const {
    currentPageBook,
    isLoading,
    books,
    fetchBook,
    fetchBookSearch,
    totalPages,
  } = useSelector((state) => state.books);

  const [data, setData] = useState([]);
  const [searchQuery, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [currentPage, setPage] = useState(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Check if searchQuery is empty
    if (!searchQuery.trim()) {
      dispatch(setMessage("Kode Buku harus diisi."));
      return;
    }
  
    Swal.fire({
      title: "Are you sure?",
      text: `Are you sure you want to borrow book?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(createBorrowBook({ kode_buku: searchQuery }))
          .catch((error) => {
            console.error("Borrow Book error:", error);
            Swal.fire({
              icon: "error",
              title: "Borrow Book Failed",
              text: "Failed to borrow book. Please try again.",
            });
          });
      }
    });
  };
  

  const modalClose = () => {
    handleCloseModal();
    setQuery("");
    setOpen(false);
  };

  const openKodeBuku = () => {
    dispatch(setId(null));
    setOpen(true);
    setQuery("");
  };

  const handleClick = (id) => {
    setQuery(id.kode_buku);
    setOpen(false);
    dispatch(setId(id));
  };

  const handleScrollBottom = () => {
    if (currentPage === totalPages) {
      return;
    }
    // console.log(currentPage)
    dispatch(setIsLoadingBook(true));
    setTimeout(() => {
      setPage(currentPage + 1);
      dispatch(setFetchBook(false));
      dispatch(setFetchBookSearch(false));
    }, 1500);
  };

  useEffect(() => {
    if (currentPage > 1 && searchQuery === "") {
      dispatch(getBook({ currentPageBook: currentPage }));
    } else if (currentPage > 1 && searchQuery !== "") {
      dispatch(getAllBook({ currentPageBook: currentPage, search: searchQuery }));
    }
  }, [currentPage]);

  useEffect(() => {
    let timeout;
    setData([]);
    dispatch(setFetchBook(false));
    dispatch(setFetchBookSearch(false));
    dispatch(setIsLoadingBook(true));

    const fetchData = () => {
      setPage(1);
      if (searchQuery === "") {
        dispatch(setFetchBook(false));
        dispatch(getBook({ currentPageBook: 1 }));
      } else if (searchQuery !== "") {
        dispatch(setFetchBookSearch(false));
        dispatch(getAllBook({ currentPageBook: 1, search: searchQuery }));
      }
    };

    const delayedFetch = () => {
      timeout = setTimeout(() => {
        fetchData();
      }, 1500);
    };

    delayedFetch();

    return () => {
      clearTimeout(timeout);
    };
  }, [searchQuery]);

  useEffect(() => {
    if (fetchBook && books !== null && !isLoading) {
      setData((prev) => [...prev, ...books]);
    }
    if (fetchBookSearch && books !== null && !isLoading) {
      setData((prev) => [...prev, ...books]);
    }
  }, [fetchBook, fetchBookSearch]);

  return (
    <>
      {modalIsOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex h-full items-center justify-center">
            <div
              className="fixed inset-0 z-50 bg-gray-500/75 transition-opacity"
              aria-hidden="true"
            ></div>
            <div className="relative z-50 flex h-auto w-2/5 min-w-[250px] flex-col rounded-lg bg-white p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">
                  Create Peminjaman Buku
                </h2>
                <button onClick={modalClose}>
                  <FaWindowClose className="text-3xl text-red-500" />
                </button>
              </div>
              <div className="flex h-full flex-col pt-1">
                <p className="text-red-600">{message}</p>
                <div className="h-full">
                  <form
                    onSubmit={handleSubmit}
                    className="flex h-full flex-col gap-y-2 pt-3"
                    action=""
                  >
                    <div className="flex flex-col">
                      <label className="font-medium">Kode Buku</label>
                      <input
                        className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5"
                        id="input"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setQuery(e.target.value)}
                        onClick={openKodeBuku}
                      />
                      {open && (
                        <BottomScrollListener onBottom={handleScrollBottom}>
                          {(scrollRef) => (
                            <div
                              ref={scrollRef}
                              className="mt-2 max-h-32 overflow-auto rounded-md border-2 border-black p-2"
                            >
                              {(data.length > 0 || data == null) &&
                                data.map((datas, index) => (
                                  <div
                                    onClick={() => handleClick(datas)}
                                    className="cursor-pointer border-b-2 border-gray-500 p-2"
                                    key={index}
                                  >
                                    <div>{datas.kode_buku}</div>
                                  </div>
                                ))}
                              {isLoading && <p>Loading ...</p>}
                              {!isLoading && data.length === 0 && (
                                <p>Data Tidak Ada</p>
                              )}
                            </div>
                          )}
                        </BottomScrollListener>
                      )}
                    </div>
                    <div className="flex flex-row-reverse pt-2">
                      <button
                        type="submit"
                        className="w-full rounded-md bg-sky-600 py-2 text-white"
                      >
                        Create
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

ModalPeminjaman.propTypes = {
  modalIsOpen: PropTypes.bool.isRequired,
  handleCloseModal: PropTypes.func.isRequired,
};

export default ModalPeminjaman;
