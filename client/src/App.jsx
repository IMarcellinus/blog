import Cookies from "js-cookie";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, Routes, useNavigate } from "react-router-dom";
import { FetchUser } from "../services/store/reducers/Authslice";
import "./index.css";
import Layout from "./layout/Layout";
import Add from "./pages/Add";
import Login from "./pages/Auth/Login";
import Blog from "./pages/Blog";
import DashboardPage from "./pages/DashboardPage";
import Edit from "./pages/Edit";
import PageNotFound from "./pages/PageNotFound";

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
    if (!token || token === undefined) {
      navigate("/login");
    }
  }, [dispatch, navigate, token]);

  if (authUser === null) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/*" element={<PageNotFound />} />
      <Route path="/" element={<Layout authUser={authUser} />}>
        {/* Gunakan Outlet untuk menampilkan komponen-komponen di bawahnya */}
        <Route index element={<DashboardPage />} />
        <Route path="/add" element={<Add />} />
        <Route path="/edit/:id" element={<Edit />} />
        <Route path="/blog/:id" element={<Blog />} />
      </Route>
    </Routes>
  );
}

export default App;
