import Tippy from "@tippyjs/react";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import {
  AiOutlineDashboard,
  AiOutlineUser,
} from "react-icons/ai";
import { BsLayoutSidebarInset } from "react-icons/bs";
import { FaAngleRight } from "react-icons/fa";
import { GiBookshelf, GiSpellBook } from "react-icons/gi";
import { SiBookstack } from "react-icons/si";
import { NavLink, useNavigate } from "react-router-dom";
import { FaAddressBook } from "react-icons/fa6";
import { IoLogOutOutline } from "react-icons/io5";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";
import { logoutUser, reset } from "../../services/store/reducers/Authslice";
import Cookies from "js-cookie";

const navLinks = [
  { to: "/", icon: AiOutlineDashboard, label: "Dashboard", roles: ["admin", "user"] },
  { to: "/user", icon: AiOutlineUser, label: "User", roles: ["admin"] },
  { to: "/reservation", icon: FaAddressBook, label: "Reservation", roles: ["admin"] },
  { to: "/book", icon: GiBookshelf, label: "Book", labelUser: "Pengumpulan Buku", roles: ["admin", "user"] },
  { to: "/peminjaman", icon: GiSpellBook, label: "Peminjaman Buku", roles: ["admin", "user"] },
  { to: "/pengembalian", icon: SiBookstack, label: "Pengembalian Buku", roles: ["admin"] },
];

function Sidebar({
  sidebar,
  setSidebar,
  authUser,
  minSidebar,
  setMinSidebar,
  btnOpenSidebar,
  setBtnOpenSidebar,
}) {
  const [isScreenWide, setIsScreenWide] = useState(window.innerWidth >= 768);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = Cookies.get("token");

  useEffect(() => {
    const handleResize = () => {
      setIsScreenWide(window.innerWidth >= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const mouseEnter = () => {
    if (isScreenWide) {
      document.body.style.overflow = "hidden";
    }
    setBtnOpenSidebar(true);
  };

  const mouseLeave = () => {
    document.body.style.overflow = "auto";
    setBtnOpenSidebar(false);
  };

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
        dispatch(logoutUser())
          .then(() => {
            Cookies.remove("token");
            dispatch(resetStateBorrow());
            dispatch(reset());
            dispatch(resetStateBook());

            // Redirect to appropriate login page based on user role
            if (authUser.role === "admin") {
              navigate("/login");
            } else {
              navigate("/loginuser");
            }
          })
          .catch((error) => {
            console.error("Logout error:", error);
            Swal.fire({
              icon: "error",
              title: "Logout Failed",
              text: "Failed to logout. Please try again.",
            });
          });
      }
    });
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 691px)");
    function handleMinSidebar(mediaQuery) {
      if (mediaQuery.matches) {
        setMinSidebar(false);
      }
    }
    mediaQuery.addEventListener("change", handleMinSidebar);
    handleMinSidebar(mediaQuery);

    return () => {
      mediaQuery.removeEventListener("change", handleMinSidebar);
    };
  }, [setMinSidebar]);

  const renderNavLink = ({ to, icon: Icon, label, labelUser, roles }) => {
    if (!roles.includes(authUser.role)) return null;
    return (
      <NavLink
        key={to}
        to={to}
        className={({ isActive }) =>
          isActive
            ? "flex gap-3 rounded-md px-4 py-3 items-center group bg-blue-500 text-white active:bg-blue-600 md:gap-4"
            : "flex gap-3 rounded-md px-4 py-3 items-center text-slate-600 group hover:bg-blue-500 hover:text-white active:bg-blue-600 md:gap-4"
        }
      >
        {!minSidebar ? (
          <Icon className="size-5" />
        ) : (
          <Tippy content={labelUser && authUser.role === "user" ? labelUser : label}>
            <div>
              <Icon className="size-8" />
            </div>
          </Tippy>
        )}
        {!minSidebar && (
          <div className="text-sm font-medium tracking-wider">
            {labelUser && authUser.role === "user" ? labelUser : label}
          </div>
        )}
      </NavLink>
    );
  };

  return (
    <>
      <aside
        onMouseEnter={mouseEnter}
        onMouseLeave={mouseLeave}
        className={`${sidebar ? "fixed left-0" : "fixed -left-96"} ${
          !minSidebar ? "w-[250px] sm:w-[300px]" : btnOpenSidebar && "pr-6"
        } z-50 h-screen flex-col bg-white py-4 pb-20 shadow-lg transition-all duration-500 ease-out md:fixed md:left-0 md:py-0`}
      >
        {!minSidebar && (
          <div className="top-0 flex w-full justify-end bg-white p-2">
            <Tippy content="Minimize Sidebar">
              <button
                type="button"
                onClick={() => {
                  setMinSidebar(true);
                  setBtnOpenSidebar(false);
                }}
                className={`hidden rounded-full bg-white/80 md:block`}
              >
                <BsLayoutSidebarInset className="size-6" />
              </button>
            </Tippy>
          </div>
        )}
        {minSidebar && btnOpenSidebar && (
          <Tippy content="Open Sidebar">
            <button
              type="button"
              onClick={() => {
                setMinSidebar(false);
              }}
              className={`absolute right-0 top-[38%] hidden rounded-full bg-white/80 p-2 md:block`}
            >
              <FaAngleRight className="size-6" />
            </button>
          </Tippy>
        )}
        <nav
          className={`${
            minSidebar ? "px-4" : "px-6"
          } flex max-h-[80vh] flex-col gap-3 overflow-y-auto py-2 md:py-3`}
        >
          {navLinks.map(renderNavLink)}
          {!isScreenWide && (
            <div
              to="#"
              onClick={LogOut}
              className="flex gap-3 rounded-md px-4 py-3 items-center text-slate-600 group hover:bg-blue-500 hover:text-white active:bg-blue-600 md:gap-4"
            >
              {!minSidebar ? (
                <IoLogOutOutline className="size-5" />
              ) : (
                <Tippy content="Logout">
                  <div>
                    <IoLogOutOutline className="size-8" />
                  </div>
                </Tippy>
              )}
              {!minSidebar && (
                <div className="text-sm font-medium tracking-wider">
                  Logout
                </div>
              )}
            </div>
          )}
        </nav>
      </aside>
      <div
        onClick={() => {
          setSidebar(false);
        }}
        className={`${
          sidebar ? "fixed" : "hidden"
        } none-selection z-40 min-h-screen min-w-full cursor-pointer bg-black opacity-20 md:hidden`}
      ></div>
    </>
  );
}

Sidebar.propTypes = {
  sidebar: PropTypes.bool.isRequired,
  minSidebar: PropTypes.bool.isRequired,
  setMinSidebar: PropTypes.func.isRequired,
  btnOpenSidebar: PropTypes.bool.isRequired,
  setBtnOpenSidebar: PropTypes.func.isRequired,
  setSidebar: PropTypes.func.isRequired,
  authUser: PropTypes.shape({
    role: PropTypes.string.isRequired,
  }).isRequired,
};

export default Sidebar;
