import { Route, Routes } from "react-router-dom";
import "./index.css";
import Blog from "./pages/Blog";
import Home from "./pages/Home";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/blog/:id" element={<Blog />} />
    </Routes>
  );
}

export default App;
