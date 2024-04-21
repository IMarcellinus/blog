import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Header from './Header';
import Sidebar from "./Sidebar";

const Layout = ({ authUser }) => {
  const [btnOpenSidebar, setBtnOpenSidebar] = useState(false);
  const [sidebar, setSidebar] = useState(false);
  const [minSidebar, setMinSidebar] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    const resetDropdownMenu = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdown(false);
      }
    };
    document.addEventListener('click', resetDropdownMenu);
    return () => {
      document.removeEventListener('click', resetDropdownMenu);
    };
  }, []);

  return (
    <>
      <Header {...{ dropdownRef, authUser, sidebar, setSidebar, dropdown, setDropdown, }} />
      <div className='relative flex w-full overflow-y-hidden'>
        <Sidebar {...{ sidebar, setSidebar, authUser, minSidebar, setMinSidebar, btnOpenSidebar, setBtnOpenSidebar }} />
        <div className={`relative h-full flex-1 p-4 ${!minSidebar ? 'md:pl-80' : !btnOpenSidebar ? 'md:pl-28' : 'md:pl-32'}`}>
          <ToastContainer />
          <Outlet />
        </div>
      </div>
    </>
  );
};

Layout.propTypes = {
  authUser: PropTypes.object,
};

export default Layout;
