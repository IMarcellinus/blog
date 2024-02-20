import { Route, Routes } from "react-router-dom";
import "./index.css";
import Add from "./pages/Add";
import Blog from "./pages/Blog";
import Edit from "./pages/Edit";
import Home from "./pages/Home";

function App() {
  return (
    <div className="mx-auto max-w-[1280px] relative">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add" element={<Add />} />
        <Route path="/edit/:id" element={<Edit />} />
        <Route path="/blog/:id" element={<Blog />} />
      </Routes>
    </div>
  );
}

export default App;
