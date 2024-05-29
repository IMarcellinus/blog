import Cookies from "js-cookie";
import PropTypes from "prop-types";
import UserList from "./UserList";

const UserPage = ({ authUser }) => {
  console.log(authUser);
  return (
    <main className="min-h-screen overflow-x-auto pb-14">
      <div className="inline-block min-w-full pl-4">
        <div className="rounded-b-lg">
          <div className="grid grid-cols-2 bg-white p-3 text-sm">
            <div>
              <p className="text-lg font-bold">User List</p>
              <div className="mt-2">{/* <SearchBarBook /> */}</div>
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
            <UserList
              // totalPages={totalPagesBook}
              // currentPageBook={currentPageBook}
              // isLoading={isLoading}
              // books={books}
              // setModalIsOpen={setModalIsOpen}
              authUser={authUser}
            />
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
