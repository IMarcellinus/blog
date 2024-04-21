import Cookies from "js-cookie";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FetchUser } from "../services/store/reducers/Authslice";
import "./index.css";
import Header from "./layout/Header";
import Add from "./pages/Add";
import Blog from "./pages/Blog";
import Edit from "./pages/Edit";
import Home from "./pages/Home";
import Login from "./pages/Login";
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
    if(!token || token === undefined){
      navigate("/login")
    }
  }, [dispatch, navigate, token]);

  if (authUser === null) {
    return (
      <Routes>
        <Route path='/login' element={<Login />} />
      </Routes>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/*" element={<PageNotFound />} />
        <Route path="/" element={<Home />} />
        <Route path="/add" element={<Add />} />
        <Route path="/edit/:id" element={<Edit />} />
        <Route path="/blog/:id" element={<Blog />} />
        {/* <Route path="/login" element={<Login />} /> */}
      </Routes>
    </>
  );
}

export default App;
