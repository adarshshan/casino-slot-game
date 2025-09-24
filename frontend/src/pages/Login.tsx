import React, { useEffect, useState } from "react";
import axios from "axios";

///new codee.....
import { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";
import { z } from "zod";
import EmailIcon from "../assets/svgIcons/EmailIcon";
import LockIcon from "../assets/svgIcons/LockIcon";

const formSchema = z.object({
  username: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(5, { message: "Password must be at least 5 characters" })
    .max(50, { message: "Password must be less than 50 characters" }),
});

interface FormData {
  username: string;
  password: string;
}

interface ApiResponse {
  status: string;
  accessToken?: string;
  refreshToken?: string;
  message?: string;
}

const Login = () => {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof FormData, string>>
  >({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("accessToken")) navigate("/");
  }, [navigate]);

  const handleInputChange = (e: FormEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validationResult = formSchema.safeParse(formData);
      if (!validationResult?.success) {
        const errors = validationResult.error.flatten().fieldErrors;
        setFormErrors({
          username: errors?.username?.[0],
          password: errors?.password?.[0],
        });
        setLoading(false);
        return;
      }
      const { data }: { data: ApiResponse } = await axios.post(
        `${import.meta.env.VITE_BASEURL}/api/auth/login`,
        formData
      );

      if (data.accessToken && data.refreshToken) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        navigate("/");
      } else {
        console.log("its here..");
        setApiError("Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Login failed...", error);
      setApiError(
        (error as any).response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        id="login"
        className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center p-4"
      >
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-sm sm:max-w-md">
          <div className="p-6 sm:p-8 md:p-10">
            <div className="mb-6 text-center sm:text-left">
              <h4 className="font-bold text-xl sm:text-3xl text-white">
                Login
              </h4>
              <h6 className="text-sm text-gray-400">to get started</h6>
            </div>
            <form
              className="flex flex-col gap-1"
              autoComplete="off"
              onSubmit={handleLogin}
            >
              <div className="relative">
                <EmailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 size-5 fill-gray-400" />
                <input
                  placeholder="Email address or Username"
                  autoComplete="username"
                  name="username"
                  value={formData?.username}
                  onChange={handleInputChange}
                  className={`login-input border border-gray-700 bg-gray-700 text-white p-2 pl-10 rounded-md w-full ${
                    formErrors?.username ? "input-error" : ""
                  }`}
                  type="text"
                  required
                />
              </div>
              <p className="text-red-500 text-sm h-2 mb-3">
                {formErrors?.username && formErrors.username}
              </p>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 size-5 fill-gray-400" />
                <input
                  placeholder="Password"
                  autoComplete="current-password"
                  name="password"
                  value={formData?.password}
                  onChange={handleInputChange}
                  className={`login-form-input login-input border border-gray-700 bg-gray-700 text-white p-2 pl-10 pr-10 rounded-md w-full ${
                    formErrors?.password ? "input-error" : ""
                  }`}
                  type={showPassword ? "text" : "password"}
                  required
                />
                <i
                  className={`fas ${
                    showPassword ? "fa-eye-slash" : "fa-eye"
                  } absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer`}
                  onClick={() => setShowPassword(!showPassword)}
                ></i>
              </div>
              <p className="text-red-500 text-sm h-2 mb-3">
                {formErrors?.password && formErrors.password}
              </p>
              {apiError && (
                <p className="text-red-500 text-sm text-left w-full -mt-2">
                  {apiError?.charAt(0).toUpperCase() + apiError?.slice(1)}
                </p>
              )}
              <button
                type="submit"
                className="w-full disabled:bg-gray-600 hover:bg-yellow-600 text-gray-50 bg-yellow-500 font-bold rounded-md py-2 mt-2 cursor-pointer transition duration-300 ease-in-out transform hover:scale-105"
                disabled={loading || !formData?.username || !formData?.password}
              >
                {loading ? "Loading..." : "Login"}
              </button>
            </form>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-y-2 text-white py-2">
              <p className="text-sm text-gray-400 whitespace-nowrap">
                Don't have an account?
                <span
                  onClick={() => navigate("/signup")}
                  className="underline text-yellow-400 cursor-pointer font-semibold ms-1"
                >
                  Sign Up
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>{" "}
    </>
  );
};

export default Login;
