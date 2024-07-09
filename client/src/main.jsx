import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import 'react-tippy/dist/tippy.css'; // Import CSS untuk tampilan default Tippy
import 'react-toastify/dist/ReactToastify.css';
import { store } from "../services/store/Store.js";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <App />
      </Provider>
    </BrowserRouter>
  </React.StrictMode>
);
