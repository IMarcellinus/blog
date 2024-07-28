import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { BiLock } from "react-icons/bi";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { FetchUser, LoginUser, reset } from "../../../services/store/reducers/Authslice";
import { SilaperLogo } from "../../assets/img";

function LoginUserPage() {
  const { user, isError, isSuccess, isLoading, message } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [codeqr, setCodeqr] = useState("");
  const [showCodeQr, setShowCodeQr] = useState(false);
  const [errorCodeQr, setErrorCodeQr] = useState("");
  const submitButtonRef = useRef(null);

  useEffect(() => {
    const webSocket = new WebSocket('ws://192.168.1.11:81');

    webSocket.onopen = function(event) {
      console.log('WebSocket connection established');
    };

    webSocket.onmessage = function(event) {
      const qrCode = event.data;
      console.log('Received QR Code:', qrCode); // Log received QR code
      setCodeqr(qrCode);
    };

    webSocket.onerror = function(event) {
      console.error('WebSocket error: ', event);
    };

    webSocket.onclose = function(event) {
      console.log('WebSocket connection closed');
    };

    return () => {
      webSocket.close();
    };
  }, []);

  useEffect(() => {
    if (codeqr && submitButtonRef.current) {
      console.log("Clicking submit button");
      submitButtonRef.current.click();
    }
  }, [codeqr]);

  useEffect(() => {
    if (user !== null && isSuccess) {
      navigate("/");
      dispatch(reset());
      dispatch(FetchUser());
    }
  }, [user, isSuccess, dispatch, navigate]);

  useEffect(() => {
    document.body.style.overflow = "auto";
  }, []);

  const Auth = (e) => {
    e.preventDefault();
    dispatch(LoginUser({ codeqr }));
  };

  const handleCodeQrChange = (e) => {
    const inputValue = e.target.value;
    setCodeqr(inputValue);

    if (inputValue.trim() === "") {
      setErrorCodeQr("Required*");
    } else {
      setErrorCodeQr("");
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Form submitted with QR Code:", codeqr);
  };

  return (
    <section className="mx-auto max-w-[1280px] relative h-screen flex items-center justify-center">
      <div className="w-full space-y-6 md:space-y-6 bg-slate-300 rounded-xl shadow dark:border dark:border-gray-700 dark:bg-white p-4 m-2 lg:m-20 xl:m-24">
        <div className="flex items-center flex-col">
          <img src={SilaperLogo} className="h-28 sm:h-44 md:h-52" alt="Silaper Logo"></img>
          <h1 className="text-lg font-bold leading-tight tracking-tight text-gray-900 md:text-xl dark:text-black text-center">
            Sistem Layanan Perpustakaan (SILAPER)
          </h1>
          <h1 className="text-lg font-bold leading-tight tracking-tight text-gray-900 md:text-xl dark:text-black text-center">
            Jurusan Teknik Elektro
          </h1>
          <h1 className="text-lg font-bold leading-tight tracking-tight text-gray-900 md:text-xl dark:text-black text-center">
            Politeknik Negeri Semarang
          </h1>
        </div>
        {isError && (
          <p className="text-center text-red-600 font-bold">{message}</p>
        )}
        <form onSubmit={Auth}>
          {/* Input Kode Qr */}
          <label htmlFor="username" className="block text-sm font-medium text-gray-900 uppercase">
            SILAHKAN SCAN QR CODE PADA KARTU ANDA
          </label>
          <div className="relative flex rounded-lg border border-gray-300 bg-gray-50 text-sm text-gray-900 mt-2">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <BiLock />
            </div>
            <input
              type={!showCodeQr ? "password" : "text"}
              id="password"
              name="password"
              value={codeqr}
              onChange={handleCodeQrChange}
              className="block w-full p-2.5 pl-10 focus:border-blue-500 focus:ring-blue-500"
              placeholder="********"
              required
            />
            <div onClick={() => setShowCodeQr(!showCodeQr)} className="absolute right-0 grid h-full w-10 cursor-pointer place-items-center">
              {!showCodeQr ? <BsEyeSlash className="h-5 w-5" /> : <BsEye className="h-5 w-5" />}
            </div>
          </div>
          <div className="flex">
            <button
              ref={submitButtonRef}
              type="submit"
              className={`my-4 w-full items-center rounded-lg ${
                !codeqr || isLoading
                  ? "cursor-not-allowed bg-blue-400 text-white dark:bg-blue-500"
                  : "bg-blue-700 text-white hover:bg-blue-800"
              } rounded-lg px-5 py-2.5 text-center text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800`}
              disabled={!codeqr || isLoading}
            >
              {isLoading ? "Loading..." : "Submit"}
            </button>
          </div>
          {/* <div className="flex justify-start">
            <p className="text-black">
              New Account?{" "}
              <i>
                <Link to="/register" className="hover:text-sky-900 hover:underline">
                  Click here
                </Link>
              </i>
            </p>
          </div> */}
        </form>
      </div>
    </section>
  );
}

export default LoginUserPage;
