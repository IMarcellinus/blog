import axios from "axios";
import Cookies from "js-cookie";
import Swal from "sweetalert2";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080/api",
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      Cookies.remove("token");
      Swal.fire({
        icon: "error",
        text: "Sesi Telah Habis, Silahkan Login Kembali :)",
      }).then(() => {
        setTimeout(() => {
          window.location.href = "/loginuser";
        }, 3000); // Delay 5 detik
      });
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
