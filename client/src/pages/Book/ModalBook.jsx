import PropTypes from "prop-types";
import { FaWindowClose } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import {
  createBook,
  setBookProdi,
  setDescription,
  setKategoriBuku,
  setMessage,
  setNamaBuku,
  setTanggalPengesahan,
  updateBook,
} from "../../../services/store/reducers/Bookslice";

const ModalBook = ({ modalIsOpen, handleCloseModal }) => {
  const {
    nama_buku,
    tanggal_pengesahan,
    kategori_buku,
    id,
    message,
    edit,
    description,
    toggleDetail,
    book_prodi,
  } = useSelector((state) => state.books);
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Check if all required fields are filled
    if (
      !nama_buku.trim() ||
      !tanggal_pengesahan.trim() ||
      !kategori_buku.trim() ||
      !description.trim() ||
      !book_prodi.trim()
    ) {
      dispatch(
        setMessage(
          "Nama buku, tanggal pengesahan, kategori, description, dan book prodi buku harus diisi."
        )
      );
      return;
    }
    
    if (!id) {
      dispatch(
        createBook({
          nama_buku,
          tanggal_pengesahan,
          kategori_buku,
          description,
          book_prodi,
        })
      );
    } else {
      dispatch(
        updateBook({
          id,
          nama_buku,
          tanggal_pengesahan,
          kategori_buku,
          description,
          book_prodi,
        })
      );
    }
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
                  {toggleDetail
                    ? "Detail Book"
                    : edit
                    ? "Edit Book"
                    : "Create New Book"}
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
                      <label className="font-medium">Nama Buku</label>
                      <input
                        value={nama_buku}
                        onChange={(e) => {
                          dispatch(setNamaBuku(e.target.value));
                        }}
                        className="rounded-md border-2 border-sky-700 p-2 text-sm"
                        type="text"
                        disabled={toggleDetail === true}
                      />
                    </div>
                    <div className="flex h-full flex-col">
                      <label className="font-medium">Tanggal Pengesahan</label>
                      <input
                        name="tanggal_pengesahan"
                        value={tanggal_pengesahan}
                        onChange={(e) => {
                          dispatch(setTanggalPengesahan(e.target.value));
                        }}
                        className="rounded-md border border-sky-600 px-2 py-3 text-xs focus:border-[2px] focus:border-sky-500 focus:outline-none sm:py-2 sm:text-base"
                        type="date"
                        disabled={toggleDetail === true}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="font-medium">Kategori Buku</label>
                      <select
                        name="kategori_buku"
                        value={kategori_buku}
                        onChange={(e) => {
                          dispatch(setKategoriBuku(e.target.value));
                        }}
                        className="rounded-md border-2 border-sky-700 p-2 text-sm"
                        disabled={toggleDetail === true}
                      >
                        <option value="">Pilih Kategori</option>
                        <option value="laporan magang">Laporan Magang</option>
                        <option value="laporan skripsi">Laporan Skripsi</option>
                        <option value="keteknikan">Keteknikan</option>
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <label className="font-medium">Book Prodi</label>
                      <select
                          value={book_prodi}
                          onChange={(e) =>
                            dispatch(setBookProdi(e.target.value))
                          }
                          className="rounded-md border-2 border-sky-700 p-2 text-sm"
                        >
                          <option value="">Pilih Jenis Prodi</option>
                          <option value="D3 - Teknik Listrik">D3 - Teknik Listrik</option>
                          <option value="D3 - Teknik Elektronika">D3 - Teknik Elektronika</option>
                          <option value="D3 - Teknik Informatika">D3 - Teknik Informatika</option>
                          <option value="D3 - Teknik Telekomunikasi">D3 - Teknik Telekomunikasi</option>
                          <option value="S.Tr - Teknologi Rekayasa Komputer">S.Tr - Teknologi Rekayasa Komputer</option>
                          <option value="S.Tr - Teknologi Rekayasa Instalasi Listrik">S.Tr - Teknologi Rekayasa Instalasi Listrik</option>
                          <option value="S.Tr - Teknologi Rekayasa Elektronika">S.Tr - Teknologi Rekayasa Elektronika</option>
                          <option value="S.Tr - Teknik Telekomunikasi">S.Tr - Teknik Telekomunikasi</option>
                        </select>
                    </div>
                    <div className="flex h-full flex-col">
                      <label className="font-medium">Book Description</label>
                      <textarea
                        value={description}
                        onChange={(e) => {
                          dispatch(setDescription(e.target.value));
                        }}
                        className="h-full w-full rounded-md border-2 border-sky-700 p-2 text-sm"
                        name=""
                        id=""
                        rows="3"
                        disabled={toggleDetail === true}
                      ></textarea>
                    </div>
                    {!toggleDetail && (
                      <div className="flex flex-row-reverse pt-2">
                        <button
                          type="submit"
                          className={`w-full rounded-md bg-sky-600 py-2 text-white`}
                        >
                          {edit ? "Update" : "Create"}
                        </button>
                      </div>
                    )}
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
