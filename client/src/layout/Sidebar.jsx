import Tippy from "@tippyjs/react";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { AiOutlineDashboard, AiOutlineTeam, AiOutlineUser } from "react-icons/ai";
import { BsLayoutSidebarInset } from "react-icons/bs";
import { FaAngleRight, FaBookDead } from "react-icons/fa";
import { GiBookshelf, GiSpellBook } from "react-icons/gi";
import { SiBookstack } from "react-icons/si";
import { NavLink } from "react-router-dom";

function Sidebar({
  sidebar,
  setSidebar,
  authUser,
  minSidebar,
  setMinSidebar,
  btnOpenSidebar,
  setBtnOpenSidebar,
}) {
  const [isOpenUnit, setIsOpenUnit] = useState(false);
  const [isOpenAttendance, setIsOpenAttendance] = useState(false);
  const [isActiveUnit, setIsActiveUnit] = useState(false);
  const [isActiveAttendance, setIsActiveAttendance] = useState(false);

  console.log("role::", authUser.role);

  const mouseEnter = () => {
    if (window.matchMedia("(min-width: 768px)").matches) {
      document.body.style.overflow = "hidden";
    }
    setBtnOpenSidebar(true);
  };

  const mouseLeave = () => {
    document.body.style.overflow = "auto";
    setBtnOpenSidebar(false);
  };

  const toggleDropdownUnit = () => {
    setIsOpenUnit(!isOpenUnit);
    setIsActiveUnit(!isActiveUnit);
    setMinSidebar(false);
  };

  const toggleDropdownAttendance = () => {
    setIsOpenAttendance(!isOpenAttendance);
    setIsActiveAttendance(!isActiveAttendance);
    setMinSidebar(false);
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
                  setIsOpenUnit(false);
                  setIsOpenAttendance(false);
                  setBtnOpenSidebar(false);
                  setIsActiveUnit(false);
                  setIsActiveAttendance(false);
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
          <>
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive
                  ? "flex gap-3 rounded-md px-4 py-3 items-center group bg-blue-500 text-white active:bg-blue-600 md:gap-4"
                  : "flex gap-3 rounded-md px-4 py-3 items-center text-slate-600 group hover:bg-blue-500 hover:text-white  active:bg-blue-600 md:gap-4"
              }
            >
              {!minSidebar ? (
                <AiOutlineDashboard className="size-5" />
              ) : (
                <Tippy content="Dashboard">
                  <div>
                    <AiOutlineDashboard className="size-8" />
                  </div>
                </Tippy>
              )}
              {!minSidebar && (
                <div className="text-sm font-medium tracking-wider">
                  Dashboard
                </div>
              )}
            </NavLink>
            <NavLink
              to="/user"
              className={({ isActive }) =>
                isActive
                  ? "flex gap-3 rounded-md px-4 py-3 items-center group bg-blue-500 text-white active:bg-blue-600 md:gap-4"
                  : "flex gap-3 rounded-md px-4 py-3 items-center text-slate-600 group hover:bg-blue-500 hover:text-white  active:bg-blue-600 md:gap-4"
              }
            >
              {!minSidebar ? (
                <AiOutlineUser className="size-5" />
              ) : (
                <Tippy content="User">
                  <div>
                    <AiOutlineUser className="size-8" />
                  </div>
                </Tippy>
              )}
              {!minSidebar && (
                <div className="text-sm font-medium tracking-wider">
                  User
                </div>
              )}
            </NavLink>
            <NavLink
              to="/book"
              className={({ isActive }) =>
                isActive
                  ? "flex gap-3 rounded-md px-4 py-3 items-center group bg-blue-500 text-white active:bg-blue-600 md:gap-4"
                  : "flex gap-3 rounded-md px-4 py-3 items-center text-slate-600 group hover:bg-blue-500 hover:text-white  active:bg-blue-600 md:gap-4"
              }
            >
              {!minSidebar ? (
                <GiBookshelf className="size-5" />
              ) : (
                <Tippy content="Management Book">
                  <div>
                    <GiBookshelf className="size-8" />
                  </div>
                </Tippy>
              )}
              {!minSidebar && (
                <div className="text-sm font-medium tracking-wider">
                  {authUser.role === "user" ? "Pengumpulan Buku" : "Book"}
                </div>
              )}
            </NavLink>
            <NavLink
              to="/peminjaman"
              className={({ isActive }) =>
                isActive
                  ? "flex gap-3 rounded-md px-4 py-3 items-center group bg-blue-500 text-white active:bg-blue-600 md:gap-4"
                  : "flex gap-3 rounded-md px-4 py-3 items-center text-slate-600 group hover:bg-blue-500 hover:text-white  active:bg-blue-600 md:gap-4"
              }
            >
              {!minSidebar ? (
                <GiSpellBook className="size-5" />
              ) : (
                <Tippy content="Management Book">
                  <div>
                    <GiSpellBook className="size-8" />
                  </div>
                </Tippy>
              )}
              {!minSidebar && (
                <div className="text-sm font-medium tracking-wider">
                  Peminjaman Buku
                </div>
              )}
            </NavLink>
            <NavLink
              to="/pengembalian"
              className={({ isActive }) =>
                isActive
                  ? "flex gap-3 rounded-md px-4 py-3 items-center group bg-blue-500 text-white active:bg-blue-600 md:gap-4"
                  : "flex gap-3 rounded-md px-4 py-3 items-center text-slate-600 group hover:bg-blue-500 hover:text-white  active:bg-blue-600 md:gap-4"
              }
            >
              {!minSidebar ? (
                <SiBookstack className="size-5" />
              ) : (
                <Tippy content="Management Book">
                  <div>
                    <SiBookstack className="size-8" />
                  </div>
                </Tippy>
              )}
              {!minSidebar && (
                <div className="text-sm font-medium tracking-wider">
                  Pengembalian Buku
                </div>
              )}
            </NavLink>
          </>
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
