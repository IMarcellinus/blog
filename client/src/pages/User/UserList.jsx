import Tippy from "@tippyjs/react";
import PropTypes from "prop-types";
import { useEffect } from "react";
import { AiOutlineEdit } from "react-icons/ai";
import { BsQrCode } from "react-icons/bs";
import { HiTrash } from "react-icons/hi";
import { FaBarcode } from "react-icons/fa6";
import ReactPaginate from "react-paginate";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import {
  deleteUser,
  getBarCodeById,
  getQrCodeById,
  setBarcode,
  setCurrentPageUser,
  setDeleteFail,
  setEdit,
  setId,
  setJenisKelamin,
  setMessage,
  setNama,
  setNim,
  setProdi,
  setQrCode,
  setRole,
} from "../../../services/store/reducers/Userslice";
import { delay } from "../../../utils/api";

// Custom hook untuk menangani side effects
const useUserDelete = (deleteFail, message) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (deleteFail) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: message,
      });
      dispatch(setDeleteFail(false));
      dispatch(setMessage(""));
    }
  }, [deleteFail, message, dispatch]);
};

// Komponen terpisah untuk baris user
const UserRow = ({ user, index, role, handleShowBarCode, handleShowQrCode, handleEdit, handleDelete }) => {
  return (
    <tr
      className={`cursor-pointer border-b border-gray-200 hover:bg-blue-100 ${
        index % 2 === 0 ? "bg-slate-100" : "bg-white"
      }`}
    >
      <td className="p-4 text-left">{index + 1}</td>
      <td className="p-4 text-left">{user.nim}</td>
      <td className="p-4 text-left">{user.nama}</td>
      <td className="p-4 text-left">{user.jeniskelamin}</td>
      <td className="p-4 text-left">{user.prodi}</td>
      <td className="p-4 text-left">{user.role}</td>
      {role === "admin" && (
        <td className="relative flex h-full gap-3 px-4 py-3">
          <Tippy content="Show BarCode" followCursor>
            <div
              className="h-6 w-6 text-slate-500 hover:cursor-pointer hover:text-slate-600"
              onClick={() => handleShowBarCode(user.id)}
            >
              <FaBarcode className="h-full w-full" />
            </div>
          </Tippy>
          <Tippy content="Show QR Code" followCursor>
            <div
              className="h-6 w-6 text-slate-500 hover:cursor-pointer hover:text-slate-600"
              onClick={() => handleShowQrCode(user.id)}
            >
              <BsQrCode className="h-full w-full" />
            </div>
          </Tippy>
          <Tippy content="Edit" followCursor>
            <div
              className="h-6 w-6 text-slate-500 hover:cursor-pointer hover:text-slate-600"
              onClick={() => handleEdit(user)}
            >
              <AiOutlineEdit className="h-full w-full" />
            </div>
          </Tippy>
          <Tippy content="Delete" followCursor>
            <div
              className="h-6 w-6 text-slate-500 hover:cursor-pointer hover:text-slate-600"
              onClick={() => handleDelete(user.id)}
            >
              <HiTrash className="h-full w-full" />
            </div>
          </Tippy>
        </td>
      )}
    </tr>
  );
};

// PropTypes untuk UserRow
UserRow.propTypes = {
  user: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  role: PropTypes.string.isRequired,
  handleShowBarCode: PropTypes.func.isRequired,
  handleShowQrCode: PropTypes.func.isRequired,
  handleEdit: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
};

const UserList = ({ authUser, users, isLoading, setModalIsOpen, totalPages }) => {
  const dispatch = useDispatch();
  const { role } = authUser;
  const { search, userSearch, currentPageUser, deleteFail, message } =
    useSelector((state) => state.users);

  // Menggunakan custom hook untuk handle delete
  useUserDelete(deleteFail, message);

  const changePage = ({ selected }) => {
    dispatch(setCurrentPageUser(selected));
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(deleteUser({ id }));
      }
    });
  };

  const handleShowBarCode = async (id) => {
    dispatch(setQrCode(false));
    dispatch(getBarCodeById({ id }));
    await delay(100);
    dispatch(setEdit(false));
    setModalIsOpen(true);
  };

  const handleShowQrCode = async (id) => {
    dispatch(setBarcode(false));
    dispatch(getQrCodeById({ id }));
    await delay(100);
    dispatch(setEdit(false));
    setModalIsOpen(true);
  };

  const handleEdit = (user) => {
    dispatch(setId(user.id));
    dispatch(setNim(user.nim));
    dispatch(setBarcode(false));
    dispatch(setQrCode(false));
    dispatch(setJenisKelamin(user.jeniskelamin));
    dispatch(setNama(user.nama));
    dispatch(setProdi(user.prodi));
    dispatch(setRole(user.role));
    dispatch(setEdit(true));
    setModalIsOpen(true);
  };

  const renderUsers = () => {
    const userList = search === "" ? users : userSearch;
    if (!isLoading && userList?.length) {
      return userList.map((user, index) => (
        <UserRow
          key={user.id}
          user={user}
          index={index}
          role={role}
          handleShowBarCode={handleShowBarCode}
          handleShowQrCode={handleShowQrCode}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        />
      ));
    } else {
      return (
        <tr>
          <td colSpan="7" className="text-center py-4">
            Data tidak ditemukan
          </td>
        </tr>
      );
    }
  };

  return (
    <div className="min-h-[470px]">
      <table className="w-full table-auto border-blue-500">
        <thead className="border-y border-slate-400">
          <tr className="bg-white text-sm uppercase leading-normal text-gray-600">
            <th className="px-4 py-3 text-left">No</th>
            <th className="px-4 py-3 text-left">Nim</th>
            <th className="px-4 py-3 text-left">Nama</th>
            <th className="px-4 py-3 text-left">Jenis Kelamin</th>
            <th className="px-4 py-3 text-left">Prodi</th>
            <th className="px-4 py-3 text-left">Role</th>
            {role !== "user" && (
              <th className="px-4 py-3 text-left">Action</th>
            )}
          </tr>
        </thead>
        <tbody className="border text-sm font-light">
          {renderUsers()}
        </tbody>
      </table>
      <div className="mt-4">
        <ReactPaginate
          forcePage={currentPageUser}
          previousLabel={"< Prev"}
          nextLabel={"Next >"}
          pageCount={totalPages}
          onPageChange={changePage}
          containerClassName={
            "pagination flex justify-center items-center gap-4 none-selection"
          }
          previousLinkClassName={
            "px-2 py-1 rounded-md bg-gray-200 hover:bg-gray-300"
          }
          nextLinkClassName={
            "px-2 py-1 rounded-md bg-gray-200 hover:bg-gray-300"
          }
          disabledClassName={"opacity-50 cursor-not-allowed"}
          activeClassName={"bg-blue-500 text-white px-2 py-1 rounded-md"}
        />
      </div>
    </div>
  );
};

const authUserShape = {
  role: PropTypes.string.isRequired,
};

UserList.propTypes = {
  totalPages: PropTypes.number,
  isLoading: PropTypes.bool.isRequired,
  users: PropTypes.array,
  authUser: PropTypes.shape(authUserShape).isRequired,
  setModalIsOpen: PropTypes.func.isRequired,
};

export default UserList;
