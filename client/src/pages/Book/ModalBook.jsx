import PropTypes from "prop-types";
import { FaWindowClose } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { store } from "../../../services/store/Store";
import {
    createBook,
    setNamaBuku,
    setTanggalPengesahan,
} from "../../../services/store/reducers/Bookslice";

const ModalBook = ({ modalIsOpen, handleCloseModal }) => {
  const { nama_buku, tanggal_pengesahan, id, message, edit } =
    useSelector((state) => state.books);

  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(createBook({ nama_buku, tanggal_pengesahan }));
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
                  {edit ? "Edit Book" : "Create New Book"}
                </h2>
                <button onClick={handleCloseModal}>
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
                      <label className="font-medium">Book Name</label>
                      <input
                        required
                        value={nama_buku}
                        onChange={(e) => {
                          dispatch(setNamaBuku(e.target.value));
                        }}
                        className="rounded-md border-2 border-sky-700 p-2 text-sm"
                        type="text"
                      />
                    </div>
                    <div className="flex h-full flex-col">
                      <label className="font-medium">Tanggal Pengesahan</label>
                      <textarea
                        value={tanggal_pengesahan}
                        onChange={(e) => {
                          dispatch(setTanggalPengesahan(e.target.value));
                        }}
                        className="size-full rounded-md border-2 border-sky-700 p-2 text-sm"
                        name=""
                        id=""
                        rows="3"
                      ></textarea>
                    </div>
                    <div className="flex flex-row-reverse pt-2">
                      <button
                        type="submit"
                        className="w-full rounded-md bg-sky-600 py-2 text-white"
                      >
                        {edit ? "Update" : "Create"}
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

ModalBook.propTypes = {
  modalIsOpen: PropTypes.bool.isRequired,
  handleCloseModal: PropTypes.func.isRequired,
};

export default ModalBook;
