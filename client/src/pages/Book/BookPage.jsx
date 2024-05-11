import PropTypes from 'prop-types';
import { useState } from 'react';
import { IoMdAddCircleOutline } from 'react-icons/io';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const BookPage = ({authUser}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const handleOpenModal = () => {
    setModalIsOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseModal = () => {
    setModalIsOpen(false);
    document.body.style.overflow = 'auto';
  };
  
  return (
    <main className="min-h-screen overflow-x-auto pb-14">
      <div className="inline-block min-w-full pl-4">
        <div className="rounded-b-lg">
          <div className="grid grid-cols-2 bg-white p-3 text-sm">
            <div>
              <p className="text-lg font-bold">Book List</p>
              <div className="mt-2">
                {/* <SearchBarSquad /> */}
              </div>
            </div>
            <div className="flex items-end justify-end ">
              {authUser && authUser.role === "admin" ? (
                <button
                  onClick={handleOpenModal}
                  className="flex items-center gap-1 rounded-md bg-sky-600 px-3 py-2 text-white"
                >
                  Add Squad
                  <IoMdAddCircleOutline className="h-6 w-6" />
                </button>
              ) : null}
              <ModalSquad
                handleCloseModal={handleCloseModal}
                modalIsOpen={modalIsOpen}
                setModalIsOpen={setModalIsOpen}
              />
            </div>
          </div>
          <div>
            {/* <SquadList
              totalPages={totalPagesSquad}
              currentPageSquad={currentPageSquad}
              isLoading={isLoading}
              squads={squads}
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

BookPage.propTypes = {
  authUser: PropTypes.shape(authUserShape).isRequired,
};

export default BookPage;
