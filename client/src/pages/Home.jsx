import axios from "axios";
import { useEffect, useState } from "react";
import { FaRegEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { PiWarningDiamondThin } from "react-icons/pi";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../../services/store/reducers/Authslice";
import CustomButton from "../components/CustomButton";
import Modal from "../components/Modal";

function Home() {
  const [apiDatas, setApiDatas] = useState(false);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // State Redux

  const handleDeleteButtonClick = (id) => {
    setDeleteId(id);
    setOpenModal(true);
    // Tambahkan logika lain yang perlu dijalankan ketika tombol delete ditekan
  };

  const handleConfirmDelete = (id) => {
    // Implementasi logika penghapusan di sini
    handleDelete(id);
    setOpenModal(false);
  };

  const handleCancelDelete = () => {
    setOpenModal(false);
  };

  const handleDelete = async (id) => {
    try {
      const apiUrl = `${import.meta.env.VITE_DEV_URL}/${id}`;
      const response = await axios.delete(apiUrl);

      if (response.status === 200) {
        console.log("Blog List Deleted");
        navigate("/");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchData = async () => {
    try {
      const apiUrl = import.meta.env.VITE_DEV_URL;
      const response = await axios.get(apiUrl);
      if (response.status === 200) {
        if (response?.data.statusText === "Ok") {
          setApiDatas(response?.data?.blog);
        }
      } else {
        console.log("Error bro!");
      }
      setLoading(false);
    } catch (error) {
      console.log(error.response);
    }
  };

  const Logout = (dispatch, navigate) => {
    // Async cleanup logic, if any
    // ...

    // Clear token from local storage
    window.localStorage.removeItem("token");

    // Dispatch the logoutUser action (assuming it is a Redux action)
    dispatch(logoutUser());

    // Navigate to the login page with a success message
    navigate("/login", {
      state: "Success Logout",
    });
  };

  const handleLogoutClick = () => {
    Logout(dispatch, navigate);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="text-center">
        <div role="status">
          <svg
            aria-hidden="true"
            className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex bg-red-300 flex-col ">
      <div className="overflow-x-auto">
        <div className="w-full justify-between flex flex-row">
          <Link to="/add">
            <CustomButton
              title="Add New"
              btnStyles="text-black bg-blue-300 rounded-lg py-4 "
              btnType="button"
            />
          </Link>
          <Link to="/login">
            <CustomButton
              title="Login"
              btnStyles="text-black bg-blue-300 rounded-lg py-4 "
              btnType="button"
            />
          </Link>
          <CustomButton
            title="Logout"
            btnStyles="text-black bg-blue-300 rounded-lg py-4 "
            btnType="button"
            onClick={handleLogoutClick}
          />
        </div>
        <table className="bg-blue-300 relative w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <caption className="text-2xl">Table Blog List</caption>
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th className="px-6 py-3">Id</th>
              <th className="px-6 py-3">Title</th>
              <th className="px-6 py-3">Post</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="overflow-x-auto relative">
            {apiDatas &&
              apiDatas.map((apiData, index) => (
                <tr
                  key={index}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                >
                  <th className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {apiData.id}
                  </th>
                  <th className="px-6 py-3">
                    <Link to={`blog/${apiData.id}`}>{apiData.title}</Link>
                  </th>
                  <th className="px-6 py-3">{apiData.post}</th>
                  <th className="px-6 py-3 flex gap-4">
                    <Link to={`edit/${apiData.id}`}>
                      <FaRegEdit className="h-6 w-6" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDeleteButtonClick(apiData.id)}
                    >
                      <MdDelete className="h-6 w-6" />
                    </button>
                    <Modal open={openModal} onClose={() => setOpenModal(false)}>
                      <div className="p-4 bg-white rounded-md flex flex-col items-center">
                        <PiWarningDiamondThin className="h-16 w-16" />
                        <p>Are you sure you want to delete this item?</p>
                        <div className="flex mt-4">
                          <button
                            onClick={() => handleConfirmDelete(apiData.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 mr-2 rounded"
                          >
                            Delete
                          </button>
                          <button
                            onClick={handleCancelDelete}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </Modal>
                  </th>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Home;
