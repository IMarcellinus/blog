import PropTypes from "prop-types";
import { FaWindowClose } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import {
  createUser,
  setJenisKelamin,
  setMessage,
  setNama,
  setNim,
  setPassword,
  setProdi,
  setRole,
  setUsername,
  updateUser,
} from "../../../services/store/reducers/Userslice";

const ModalUser = ({ modalIsOpen, handleCloseModal }) => {
  const {
    username,
    password,
    id,
    nim,
    nama,
    jeniskelamin,
    prodi,
    message,
    role,
    edit,
    barcode,
    urlbarcode,
  } = useSelector((state) => state.users);

  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (edit) {
      // Update user logic
      if (!nim || !nama || !jeniskelamin || !prodi || !role) {
        dispatch(
          setMessage("NIM, nama, jenis kelamin, prodi, dan role harus diisi.")
        );
      } else {
        dispatch(
          updateUser({
            id,
            nim,
            nama,
            jeniskelamin,
            prodi,
            role,
          })
        );
      }
    } else {
      // Create user logic
      if (
        !username.trim() ||
        !password.trim() ||
        !nim ||
        !nama ||
        !jeniskelamin ||
        !prodi ||
        !role
      ) {
        dispatch(
          setMessage(
            "Username, password, NIM, nama, jenis kelamin, dan prodi harus diisi."
          )
        );
      } else {
        dispatch(
          createUser({
            username,
            password,
            nim,
            nama,
            jeniskelamin,
            prodi,
            role,
          })
        );
      }
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
            <div className={`relative z-50 flex h-auto ${barcode ? 'w-fit' : 'w-2/5'} min-w-[250px] flex-col rounded-lg bg-white p-4`}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">
                  {barcode
                    ? "Barcode User"
                    : edit
                    ? "Edit User"
                    : "Create New User"}
                </h2>
                <button onClick={handleCloseModal}>
                  <FaWindowClose className="text-3xl text-red-500" />
                </button>
              </div>
              <div className="flex h-full flex-col pt-1">
                <p className="text-red-600">{message}</p>
                <div className="h-full">
                  {barcode ? (
                    <img
                      src={`data:image/png;base64,${urlbarcode}`}
                      alt="QR Code"
                      className="h-full w-full"
                    />
                  ) : (
                    <form
                      onSubmit={handleSubmit}
                      className="flex h-full flex-col gap-y-2 pt-3"
                      action=""
                    >
                      {!edit && (
                        <>
                          <div className="flex flex-col">
                            <label className="font-medium">Username</label>
                            <input
                              required
                              value={username}
                              onChange={(e) =>
                                dispatch(setUsername(e.target.value))
                              }
                              className="rounded-md border-2 border-sky-700 p-2 text-sm"
                              type="text"
                            />
                          </div>
                          <div className="flex flex-col">
                            <label className="font-medium">Password</label>
                            <input
                              required
                              value={password}
                              onChange={(e) =>
                                dispatch(setPassword(e.target.value))
                              }
                              className="rounded-md border-2 border-sky-700 p-2 text-sm"
                              type="text"
                            />
                          </div>
                        </>
                      )}
                      <div className="flex flex-col">
                        <label className="font-medium">NIM</label>
                        <input
                          required
                          value={nim}
                          onChange={(e) => dispatch(setNim(e.target.value))}
                          className="rounded-md border-2 border-sky-700 p-2 text-sm"
                          type="text"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="font-medium">Nama</label>
                        <input
                          required
                          value={nama}
                          onChange={(e) => dispatch(setNama(e.target.value))}
                          className="rounded-md border-2 border-sky-700 p-2 text-sm"
                          type="text"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="font-medium">Jenis Kelamin</label>
                        <select
                          required
                          value={jeniskelamin}
                          onChange={(e) =>
                            dispatch(setJenisKelamin(e.target.value))
                          }
                          className="rounded-md border-2 border-sky-700 p-2 text-sm"
                        >
                          <option value="">Pilih Jenis Kelamin</option>
                          <option value="laki-laki">Laki-Laki</option>
                          <option value="perempuan">Perempuan</option>
                        </select>
                      </div>
                      <div className="flex flex-col">
                        <label className="font-medium">Prodi</label>
                        <input
                          required
                          value={prodi}
                          onChange={(e) => dispatch(setProdi(e.target.value))}
                          className="rounded-md border-2 border-sky-700 p-2 text-sm"
                          type="text"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="font-medium">Role</label>
                        <select
                          required
                          value={role}
                          onChange={(e) => dispatch(setRole(e.target.value))}
                          className="rounded-md border-2 border-sky-700 p-2 text-sm"
                        >
                          <option value="">Pilih Role</option>
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
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
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

ModalUser.propTypes = {
  modalIsOpen: PropTypes.bool.isRequired,
  handleCloseModal: PropTypes.func.isRequired,
};

export default ModalUser;