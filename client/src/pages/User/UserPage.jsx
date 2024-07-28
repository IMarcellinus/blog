import Cookies from "js-cookie";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { IoMdAddCircleOutline } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getAllUser,
  getUser,
  setActive,
  setBarcode,
  setCurrentPageUser,
  setEdit,
  setId,
  setIsDelete,
  setIsSucess,
  setJenisKelamin,
  setMessage,
  setNama,
  setNim,
  setPassword,
  setProdi,
  setQrCode,
  setRole,
  setSearch,
  setUrlQrCode,
  setUserSearch,
  setUsername,
} from "../../../services/store/reducers/Userslice";
import SearchBarUser from "./SearchBarUser";
import ModalUser from "./ModalUser";
import UserList from "./UserList";
import SkeletonTable from "../../components/Skeleton/SkeletonTable";

const UserPage = ({ authUser }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = Cookies.get("token");

  const {
    users,
    isLoading,
    totalPagesUser,
    isSubmit,
    isUpdate,
    isDelete,
    currentPageUser,
    search,
    userSearch,
  } = useSelector((state) => state.users);

  const handleOpenModal = () => {
    setModalIsOpen(true);
    document.body.style.overflow = "hidden";
  };

  const handleCloseModal = () => {
    setModalIsOpen(false);
    dispatch(setId(null));
    dispatch(setUsername(""));
    dispatch(setActive(false));
    dispatch(setPassword(""));
    dispatch(setJenisKelamin(""));
    dispatch(setProdi(""));
    dispatch(setRole(""));
    dispatch(setNama(""));
    dispatch(setNim(""));
    dispatch(setMessage(""));
    dispatch(setEdit(false));
    dispatch(setBarcode(false));
    dispatch(setQrCode(false))
    dispatch(setUrlQrCode(false));
    dispatch(setIsSucess(false));
    dispatch(setIsDelete(false));
    document.body.style.overflow = "auto";
  };

  const handleDeleteLogic = () => {
    const currentPage = currentPageUser + 1;

    if (
      users.length === 1 &&
      userSearch.length === 0 &&
      !search &&
      currentPageUser > 0
    ) {
      dispatch(getUser({ currentPageUser }));
      dispatch(setCurrentPageUser(currentPageUser - 1));
    } else if (users.length > 1 && userSearch.length === 0 && !search) {
      dispatch(getUser({ currentPageUser: currentPage }));
    } else if (
      users.length === 1 &&
      userSearch.length === 0 &&
      !search &&
      currentPageUser === 0
    ) {
      dispatch(getUser({ currentPageUser: currentPage }));
    } else if (
      users.length === 0 &&
      userSearch.length === 1 &&
      search &&
      currentPageUser > 0
    ) {
      dispatch(getAllUser({ currentPageUser, search }));
      dispatch(setCurrentPageUser(currentPageUser - 1));
    } else if (users.length === 0 && userSearch.length > 1 && search) {
      dispatch(getAllUser({ currentPageUser: currentPage, search }));
    } else if (
      users.length === 0 &&
      userSearch.length === 1 &&
      search &&
      currentPageUser === 0
    ) {
      dispatch(getAllUser({ currentPageUser: currentPage, search }));
    } else if (users.length === 0 && userSearch.length === 0 && !search) {
      // Jika tidak ada pengguna, tidak ada pencarian, dan tidak ada kata kunci pencarian
      // Tambahkan logika yang diperlukan di sini, misalnya:
      dispatch(getUser({ currentPageUser: currentPage }));
    }
  };

  useEffect(() => {
    if (isSubmit) {
      handleCloseModal();
      toast.success("Tambah User Berhasil");
      const currentPage = currentPageUser + 1;
      if (search) {
        dispatch(getAllUser({ currentPageUser: currentPage, search }));
      } else {
        dispatch(getUser({ currentPageUser: currentPage }));
      }
    }

    if (isDelete) {
      handleDeleteLogic();
      toast.error("Hapus User Berhasil !");
      dispatch(setIsDelete(false));
    }

    if (isUpdate) {
      handleCloseModal();
      toast.success("Update User Berhasil!");
      const currentPage = currentPageUser + 1;
      if (search) {
        dispatch(getAllUser({ currentPageUser: currentPage, search }));
      } else {
        dispatch(getUser({ currentPageUser: currentPage }));
      }
    }
  }, [currentPageUser, dispatch, isSubmit, isDelete, search, isUpdate]);

  useEffect(() => {
    dispatch(setCurrentPageUser(0));
    dispatch(setUserSearch());
    dispatch(setSearch(""))
  }, [dispatch]);

  useEffect(() => {
    let timeoutId;
    const fetchData = () => {
      const currentPage = 1;
      if (search) {
        dispatch(getAllUser({ currentPageUser: currentPage, search }));
      } else {
        dispatch(getUser({ currentPageUser: currentPage }));
      }
      dispatch(setCurrentPageUser(0));
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
    if (!isDelete) {
      const currentPage = currentPageUser + 1;
      if (search) {
        dispatch(getAllUser({ currentPageUser: currentPage, search }));
      } else {
        dispatch(getUser({ currentPageUser: currentPage }));
      }
    }
  }, [currentPageUser, dispatch, isDelete, search]);

  return (
    <main className="min-h-screen overflow-x-auto pb-14">
      <div className="inline-block min-w-full pl-4">
        <div className="rounded-b-lg">
          <div className="grid grid-cols-2 bg-white py-3 text-sm">
            <div>
              <p className="text-lg font-bold">User List</p>
              <div className="mt-2">
                <SearchBarUser />
              </div>
            </div>
            <div className="flex items-end justify-end ">
              <button
                onClick={handleOpenModal}
                className="flex items-center gap-1 rounded-md bg-sky-600 px-3 py-2 text-white"
              >
                Add User
                <IoMdAddCircleOutline className="h-6 w-6" />
              </button>
              <ModalUser
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
              <UserList
                totalPages={totalPagesUser}
                currentPageUser={currentPageUser}
                isLoading={isLoading}
                users={users}
                setModalIsOpen={setModalIsOpen}
                authUser={authUser}
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

UserPage.propTypes = {
  authUser: PropTypes.shape(authUserShape).isRequired,
};

export default UserPage;
