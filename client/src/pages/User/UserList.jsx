import Tippy from "@tippyjs/react";
import PropTypes from "prop-types";
import { useEffect } from "react";
import { AiOutlineEdit } from "react-icons/ai";
import { BsQrCode } from "react-icons/bs";
import { HiTrash } from "react-icons/hi";
import { IoMdEye } from "react-icons/io";
import ReactPaginate from "react-paginate";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { deleteUser, getUserById, setCurrentPageUser, setDeleteFail, setEdit, setId, setJenisKelamin, setMessage, setNama, setNim, setProdi, setRole } from "../../../services/store/reducers/Userslice";

const UserList = ({
  authUser,
  users,
  isLoading,
  setModalIsOpen,
  totalPages,
}) => {
  // console.log(users);
  const dispatch = useDispatch();
  const { role } = authUser;
  const { search, userSearch, currentPageUser, deleteFail, message, baseImage } =
    useSelector((state) => state.users);

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

  const handleShowBarcode = (id) => {
    dispatch(getUserById({id}));
    setModalIsOpen(true);
    console.log(id)
    console.log(baseImage)
  };

  const handleEdit = (id, nim, jeniskelamin, nama, prodi, role) => {
    dispatch(setId(id));
    dispatch(setNim(nim));
    dispatch(setJenisKelamin(jeniskelamin));
    dispatch(setNama(nama));
    dispatch(setProdi(prodi));
    dispatch(setRole(role));
    dispatch(setEdit(true));
    setModalIsOpen(true);
  };

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
  }, [deleteFail, dispatch, message]);

  return (
    <div className="min-h-[470px]">
      <table className="w-full table-auto border-blue-500 ">
        <thead className="border-y border-slate-400">
          <tr className="bg-white text-sm uppercase  leading-normal text-gray-600">
            <th className="px-4 py-3 text-left">No</th>
            <th className="px-4 py-3 text-left">Nim</th>
            <th className="px-4 py-3 text-left">Nama</th>
            <th className="px-4 py-3 text-left">Jenis Kelamin</th>
            <th className="px-4 py-3 text-left">Prodi</th>
            <th className="px-4 py-3 text-left">Role</th>
            {!isLoading && role !== "user" && (
              <th className="px-4 py-3 text-left">Action</th>
            )}
          </tr>
        </thead>
        <tbody className="border text-sm font-light">
          {!isLoading &&
            (search === "" ? users : userSearch)?.map((user, index) => (
              <tr
                key={user.id}
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
                {!isLoading && role == "admin" && (
                  <td className="relative flex h-full gap-3 px-4 py-3">
                    <Tippy content="Show Barcode" followCursor>
                      <div
                        className="size-6 text-slate-500 hover:cursor-pointer hover:text-slate-600"
                        onClick={() => handleShowBarcode(user.id)}
                      >
                        <BsQrCode className="size-full" />
                      </div>
                    </Tippy>
                    <Tippy content="Edit" followCursor>
                      <div className="size-6 text-slate-500 hover:cursor-pointer hover:text-slate-600">
                        <AiOutlineEdit
                          className="size-full"
                          onClick={() => {
                            handleEdit(
                              user.id,
                              user.nim,
                              user.jeniskelamin,
                              user.nama,
                              user.prodi,
                              user.role,
                            );
                          }}
                        />
                      </div>
                    </Tippy>
                    <Tippy content="Delete" followCursor>
                      <div
                        className="size-6 text-slate-500 hover:cursor-pointer hover:text-slate-600"
                        onClick={() => handleDelete(user.id)}
                      >
                        <HiTrash className="size-full" />
                      </div>
                    </Tippy>
                  </td>
                )}
              </tr>
            ))}
        </tbody>
      </table>
      {!isLoading && !userSearch?.length && !users?.length && (
        <div className="flex justify-center py-4">
          <p>Data tidak ditemukan</p>
        </div>
      )}
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
