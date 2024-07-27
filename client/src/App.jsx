import Cookies from "js-cookie";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, Routes, useNavigate, NavLink } from "react-router-dom";
import { FetchUser } from "../services/store/reducers/Authslice";
import "./index.css";
import Layout from "./layout/Layout";
import ChangePassword from "./pages/Auth/ChangePassword";
import Login from "./pages/Auth/Login";
import LoginUserPage from "./pages/Auth/LoginUser";
import RegisterUserPage from "./pages/Auth/RegisterUserPage";
import BookPage from "./pages/Book/BookPage";
import PeminjamanPage from "./pages/Book/PeminjamanPage";
import PengembalianPage from "./pages/Book/PengembalianPage";
import DashboardPage from "./pages/DashboardPage";
import PageNotFound from "./pages/PageNotFound";
import UserPage from "./pages/User/UserPage";
import Swal from "sweetalert2";
import ReservationPage from "./pages/Reservation/ReservationPage";
import DashboardPageUser from "./pages/DashboardPageUser";

function App() {
  const {
    authUser,
    status,
    isLogin,
    messageFetchUser,
    isPreload = false,
  } = useSelector((state) => state.auth);
  const token = Cookies.get("token");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(FetchUser());
  }, [dispatch]);

  useEffect(() => {
    if (
      window.location.pathname !== "/login"
    ) {
      if (status == 401) {
        navigate("/loginuser");
        Swal.fire({
          icon: "error",
          text: "Sesi Telah Habis, Silahkan Login Kembali :)",
        });
      }
      if (status == 401) {
        Cookies.remove("token");
      }
    }
  }, [navigate, status]);

  useEffect(() => {
    if (!token || token === undefined) {
      dispatch(FetchUser());
    }
  }, [dispatch, token]);

  if (authUser === null) {
    return (
      <Routes>
        <Route path="/loginuser" element={<LoginUserPage />} />
        {/* <Route path="/register" element={<RegisterUserPage />} /> */}
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<PageNotFound />} />
      </Routes>
    );
  }

  return (
    <div>
      <Routes>
        <Route path="/*" element={<PageNotFound />} />
        <Route path="/" element={<Layout authUser={authUser} />}>
          {authUser && authUser.role === "user" &&(
          <>
            <Route index element={<DashboardPageUser authUser={authUser} />} />
            <Route path="/user" element={<UserPage authUser={authUser} />} />
          </>
          )}
          {/* Gunakan Outlet untuk menampilkan komponen-komponen di bawahnya */}
          {authUser && authUser.role === "admin" && (
            <>
              <Route index element={<DashboardPage authUser={authUser} />} />
              <Route path="/user" element={<UserPage authUser={authUser} />} />
              <Route
                path="/reservation"
                element={<ReservationPage authUser={authUser} />}
              />
            </>
          )}
          <Route path="/book" element={<BookPage authUser={authUser} />} />
          <Route
            path="/peminjaman"
            element={<PeminjamanPage authUser={authUser} />}
          />
          <Route
            path="/pengembalian"
            element={<PengembalianPage authUser={authUser} />}
          />
          <Route path="/changepassword" element={<ChangePassword />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
