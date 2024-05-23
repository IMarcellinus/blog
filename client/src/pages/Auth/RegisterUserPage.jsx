import { useEffect, useState } from "react";
import { BiLock, BiUser } from "react-icons/bi";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  RegisterUser,
  setResetMessage,
} from "../../../services/store/reducers/Authslice";
import { SilaperLogo } from "../../assets/img";

function RegisterUserPage() {
  const { user, isError, isSuccess, isLoading, message } = useSelector(
    (state) => state.auth
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorUsername, setErrorUsername] = useState("");
  const [errorPassword, setErrorPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const [imageBarcode, setImageBarcode] = useState("");

  const handleRegister = (e) => {
    e.preventDefault();
    isLoading(true);
    // your form submission logic here
    setTimeout(() => {
      isLoading(false);
    }, 5000); // example timeout, change it to your needs
  };

  const Register = (e) => {
    e.preventDefault();
    dispatch(setResetMessage());
    dispatch(RegisterUser({ username, password }));
  };

  const handleDownload = () => {
    // Create an anchor element
    const link = document.createElement("a");
    // Set the href attribute to the image data
    link.href = `data:image/png;base64,${imageBarcode}`;
    // Set the download attribute to prompt download
    link.download = "barcode.png";
    // Simulate click event
    link.click();
  };

  const handleUsernameChange = (e) => {
    const inputValue = e.target.value;
    setUsername(inputValue);

    if (inputValue.trim() === "") {
      setErrorUsername("Required*");
    } else {
      setErrorUsername("");
    }
  };

  const handlePasswordChange = (e) => {
    const inputValue = e.target.value;
    setPassword(inputValue);

    if (inputValue.trim() === "") {
      setErrorPassword("Required*");
    } else {
      setErrorPassword("");
    }
  };

  useEffect(() => {
    if (isSuccess) {
      // Jika registrasi berhasil, tampilkan QR code
      setImageBarcode(user);
    }
    if (!isError) {
      dispatch(setResetMessage());
    }
  }, [isSuccess, user, dispatch, isError]);

  return (
    <section className="mx-auto max-w-[1280px] relative h-screen flex items-center justify-center">
      <div className="w-full space-y-2 md:space-y-6 bg-slate-300 rounded-xl shadow dark:border dark:bg-gray-800 dark:border-gray-700 p-4 m-2 lg:m-20 xl:m-24">
        <div className="flex items-center flex-col">
          <img src={SilaperLogo} className="h-28 sm:h-44 md:h-52"></img>
          <h1 className="text-lg font-bold leading-tight tracking-tight text-gray-900 md:text-xl dark:text-white text-center">
            Sistem Pelayanan Perpustakaan (SILAPER)
          </h1>
        </div>
        {isError && (
          <p className="text-center text-red-600 font-bold">{message}</p>
        )}
        <form onSubmit={Register}>
          {/* Input Username */}
          <div className="my-2">
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-medium text-gray-900 "
            >
              Username
            </label>
            <div className="relative ">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <BiUser />
              </div>
              <input
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={handleUsernameChange}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 "
                placeholder="masukkan username"
                required
              />
            </div>
          </div>
          {/* Input Password */}
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-900 "
          >
            Password
          </label>
          <div className="relative flex rounded-lg border border-gray-300 bg-gray-50 text-sm text-gray-900">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <BiLock />
            </div>
            <input
              type={!showPassword ? "password" : "text"}
              id="password"
              name="password"
              value={password}
              onChange={handlePasswordChange}
              className="block w-full p-2.5 pl-10 focus:border-blue-500 focus:ring-blue-500"
              placeholder="********"
              required
            />
            <div
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 grid h-full w-10 cursor-pointer place-items-center"
            >
              {!showPassword ? (
                <BsEyeSlash className="h-5 w-5" />
              ) : (
                <BsEye className="h-5 w-5" />
              )}
            </div>
          </div>
          <div className="flex">
            <button
              onSubmit={handleRegister}
              type="submit"
              className={`my-4 w-full items-center rounded-lg ${
                !username || !password || isLoading
                  ? "cursor-not-allowed bg-blue-400 text-white dark:bg-blue-500"
                  : "bg-blue-700 text-white hover:bg-blue-800"
              } rounded-lg px-5 py-2.5 text-center text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800`}
              disabled={!username || !password || isLoading}
            >
              {isLoading ? "Loading..." : "Submit"}
            </button>
          </div>
        </form>
        <div className="flex">
          {imageBarcode && isSuccess && (
            <div className="flex flex-col max-w-full justify-center items-center w-full">
              <img
                src={`data:image/png;base64,${imageBarcode}`}
                alt="QR Code"
                className="h-full"
              />
              <div className="flex justify-start flex-col">
                <button
                  onClick={handleDownload}
                  className="bg-blue-700 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
                >
                  Download Barcode
                </button>
                <p className="text-black mt-2">
                  Have a Barcode?{" "}
                  <i>
                    <Link
                      to="/loginuser"
                      className="hover:text-sky-900 hover:underline"
                    >
                      click here
                    </Link>
                  </i>{" "}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default RegisterUserPage;
