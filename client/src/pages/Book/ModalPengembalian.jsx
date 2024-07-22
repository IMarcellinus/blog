import PropTypes from "prop-types";
import { FaWindowClose } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import {
  returnBorrowBook,
  setMessage,
  setRating,
} from "../../../services/store/reducers/Borrowslice";
import Swal from "sweetalert2";

const ModalPengembalian = ({ modalIsOpen, handleCloseModal }) => {
  const dispatch = useDispatch();
  const { rating, id, message, edit } = useSelector(
    (state) => state.borrowbooks
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      dispatch(setMessage("Rating harus diisi."));
      return; // Early return to prevent Swal from showing
    }
    Swal.fire({
      title: "Are you sure?",
      text: `Are you sure you want to return the book?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(returnBorrowBook({ id, rating })).catch((error) => {
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
  };

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
                  Pengembalian Buku
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
                    className="flex h-full flex-col gap-y-2 pt-1"
                    action=""
                  >
                    <div className="flex flex-col">
                      <label className="font-medium">Kategori Buku</label>
                      <select
                        name="rating"
                        value={rating}
                        onChange={(e) => {
                          dispatch(setRating(Number(e.target.value)));
                        }}
                        className="rounded-md border-2 border-sky-700 p-2 text-sm"
                      >
                        <option value="">Pilih Rating</option>
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                        <option value={5}>5</option>
                      </select>
                    </div>
                    <div className="flex flex-row-reverse pt-2">
                      <button
                        type="submit"
                        className="w-full rounded-md bg-sky-600 py-2 text-white"
                      >
                        Return
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

ModalPengembalian.propTypes = {
  modalIsOpen: PropTypes.bool.isRequired,
  handleCloseModal: PropTypes.func.isRequired,
};

export default ModalPengembalian;
