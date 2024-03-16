import axios from "axios";
import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import "./index.css";
import Header from "./layout/Header";
import Add from "./pages/Add";
import Blog from "./pages/Blog";
import Edit from "./pages/Edit";
import Home from "./pages/Home";
import Login from "./pages/Login";

function App() {
  const token = window.localStorage.getItem("token");

  useEffect(() => {
    const timestamp = 1000 * 60 * 3 - 5;
    // const timestamp = 10000;

    let interval = setInterval(() => {
      if (token !== null) {
        updateToken();
      }
    }, timestamp);

    return () => {
      clearInterval(interval);
    };
  }, [token]);

  const updateToken = async () => {
    try {
      const apiUrl = import.meta.env.VITE_TOKEN_URL;

      const response = await axios.get(apiUrl, {
        headers: {
          token: window.localStorage.getItem("token"),
        },
      });

      if (response.status === 200) {
        const data = await response.data;

        window.localStorage.setItem("token", data.token);
      }
    } catch (error) {
      console.log(error);

      window.localStorage.removeItem("token");
    }

    console.log("Inside update token");
  };
  
  return (
    <div className="mx-auto max-w-[1280px] relative">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add" element={<Add />} />
        <Route path="/login" element={<Login />} />
        <Route path="/edit/:id" element={<Edit />} />
        <Route path="/blog/:id" element={<Blog />} />
      </Routes>
    </div>
  );
}

export default App;
