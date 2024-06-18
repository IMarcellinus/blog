import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { IoMdAddCircleOutline } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import PeminjamanList from "./PeminjamanList";

const PeminjamanPage = ({ authUser }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const handleOpenModal = () => {
    setModalIsOpen(true);
    document.body.style.overflow = "hidden";
  };

  const handleCloseModal = () => {
    setModalIsOpen(false);
    document.body.style.overflow = "auto";
  };

  return (
    <main className="min-h-screen overflow-x-auto pb-14">
      <div className="inline-block min-w-full pl-4">
        <div className="rounded-b-lg">
          <div className="grid grid-cols-2 bg-white py-3 text-sm">
            <div>
              <p className="text-lg font-bold">Borrow Book List</p>
              <div className="mt-2">
                {/* <SearchBarBook /> */}
              </div>
            </div>
            <div className="flex items-end justify-end ">
              {/* <button
                onClick={handleOpenModal}
                className="flex items-center gap-1 rounded-md bg-sky-600 px-3 py-2 text-white"
              >
                Add Book
                <IoMdAddCircleOutline className="h-6 w-6" />
              </button>
              <ModalBook
                handleCloseModal={handleCloseModal}
                modalIsOpen={modalIsOpen}
                setModalIsOpen={setModalIsOpen}
              /> */}
            </div>
          </div>
          <div>
            {/* <PeminjamanList
              totalPages={totalPagesBook}
              currentPageBook={currentPageBook}
              isLoading={isLoading}
              books={books}
              setModalIsOpen={setModalIsOpen}
              authUser={authUser}
            /> */}
          </div>
        </div>
      </div>
    </main>
  );
};

const authUserShape = {
  role: PropTypes.string.isRequired,
};

PeminjamanPage.propTypes = {
  authUser: PropTypes.shape(authUserShape).isRequired,
};

export default PeminjamanPage;
