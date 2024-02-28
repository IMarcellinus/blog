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
  const hasToken = !!localStorage.getItem("token");

  return (
    <div className="mx-auto max-w-[1280px] relative">
      <Header />
      <Routes>
        {hasToken ? (
          <>
            <Route path="/" element={<Home />} />
            <Route path="/add" element={<Add />} />
            <Route path="/edit/:id" element={<Edit />} />
            <Route path="/blog/:id" element={<Blog />} />
          </>
        ) : (
          <Route path="/login" element={<Login />} />
        )}
      </Routes>
    </div>
  );
}

export default App;
