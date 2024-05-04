import PropTypes from "prop-types";
import { HiOutlineMenuAlt4 } from "react-icons/hi";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { logoutUser } from "../../services/store/reducers/Authslice";
import { SilaperLogo } from "../assets/img";

const Header = ({
  dropdownRef,
  authUser,
  sidebar,
  setSidebar,
  dropdown,
  setDropdown,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  console.log("header: " ,authUser.role)
  const LogOut = () => {
    Swal.fire({
      title: "Are you sure?",
      text: `Are you sure you want to log out?!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(logoutUser());
        if (authUser.role === "admin") {
          navigate("/login");
        } else {
          navigate("/loginuser");
        }
      }
    });
  };

  return (
    <header className="sticky left-0 top-0 z-[101] w-full border-b-2 bg-blue-500 text-white">
      <div className="flex items-center justify-between px-8">
        <div className="block py-4 md:py-0 text-xl font-bold lg:text-2xl">
          <div className="flex flex-row items-center">
            <img
              src={SilaperLogo}
              alt="Bluebird"
              className="hidden h-24 md:block"
            />
            <HiOutlineMenuAlt4
              className="h-6 w-6 cursor-pointer sm:h-8 sm:w-8 md:hidden"
              onClick={() => {
                setSidebar(!sidebar);
                setDropdown(false);
              }}
            />
            <h3 className="text-lg hidden md:block">Sistem Layanan Perpustakaan</h3>
          </div>
        </div>
        <div className="relative">
          <div
            ref={dropdownRef}
            className="flex h-full cursor-pointer items-center gap-4"
            onClick={() => {
              setDropdown(!dropdown);
              setSidebar(false);
            }}
          >
            <p className="hidden select-none sm:block">
              Welcome {authUser && authUser?.username}
            </p>
          </div>
          {dropdown && (
            <div className="absolute -right-4 top-12 z-50 flex w-52 flex-col gap-1 rounded-xl bg-white p-4 text-black shadow-lg">
              <button
                className="w-full cursor-pointer rounded p-2 text-left text-sm hover:bg-blue-500 hover:text-white"
                onClick={LogOut}
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

Header.propTypes = {
  sidebar: PropTypes.bool.isRequired,
  setSidebar: PropTypes.func.isRequired,
  dropdown: PropTypes.bool.isRequired,
  setDropdown: PropTypes.func.isRequired,
  authUser: PropTypes.shape({
    username: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
  }).isRequired,
  dropdownRef: PropTypes.shape({
    current: PropTypes.instanceOf(HTMLDivElement),
  }).isRequired,
};

export default Header;
