import Cookies from "js-cookie";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, Routes, useNavigate } from "react-router-dom";
import { FetchUser } from "../services/store/reducers/Authslice";
import "./index.css";
import Layout from "./layout/Layout";
import Add from "./pages/Add";
import Login from "./pages/Auth/Login";
import LoginUserPage from "./pages/Auth/LoginUser";
import RegisterUserPage from "./pages/Auth/RegisterUserPage";
import Blog from "./pages/Blog";
import BookPage from "./pages/Book/BookPage";
import DashboardPage from "./pages/DashboardPage";
import Edit from "./pages/Edit";
import PageNotFound from "./pages/PageNotFound";
import UserPage from "./pages/User/UserPage";

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
  // console.log(authUser);

  useEffect(() => {
    dispatch(FetchUser());
  }, [dispatch]);

  useEffect(() => {
    if (!token && window.location.pathname !== "/login" && window.location.pathname !== "/register") {
      navigate("/loginuser");
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!token || token === undefined) {
      dispatch(FetchUser());
    }
  }, [dispatch, token]);

  if (authUser === null) {
    return (
      <Routes>
        <Route path="/loginuser" element={<LoginUserPage />} />
        <Route path="/register" element={<RegisterUserPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<PageNotFound />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/*" element={<PageNotFound />} />
      <Route path="/" element={<Layout authUser={authUser} />}>
        {/* Gunakan Outlet untuk menampilkan komponen-komponen di bawahnya */}
        <Route index element={<DashboardPage authUser={authUser} />} />
        <Route path="/book" element={<BookPage authUser={authUser}/>}/>
        <Route path="/user" element={<UserPage authUser={authUser}/>}/>
        <Route path="/add" element={<Add />} />
        <Route path="/edit/:id" element={<Edit />} />
        <Route path="/blog/:id" element={<Blog />} />
      </Route>
    </Routes>
  );
}

export default App;
