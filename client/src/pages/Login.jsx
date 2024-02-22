import axios from "axios";
import { useForm } from "react-hook-form";
import CustomButton from "../components/CustomButton";

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const saveForm = async (data) => {
    console.log(data);
    try {
      const apiUrl = import.meta.env.VITE_DEV_URL 
      const response = await axios.post(apiUrl,data);
      if(response.status === 200){
        const data = await response.data;
        console.log(data)
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <section className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
            Sign in to your account
          </h1>
          <form
            className="space-y-4 md:space-y-6"
            onSubmit={handleSubmit(saveForm)}
          >
            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Your email
              </label>
              <input {...register("email")} />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Password
              </label>
              <input type="password" {...register("password")} />
            </div>
            <CustomButton title="Login" value="Login" btnType="submit" />
          </form>
        </div>
      </div>
    </section>
  );
}

export default Login;
