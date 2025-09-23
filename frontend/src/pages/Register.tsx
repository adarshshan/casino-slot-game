import React, { useState } from "react";
import axios from "axios";
import { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";
import { z } from "zod";
import EmailIcon from "../assets/svgIcons/EmailIcon"; // Reusing EmailIcon for username
import LockIcon from "../assets/svgIcons/LockIcon";

const formSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(50, { message: "Username must be less than 50 characters" }),
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

const Register = () => {
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

  const handleInputChange = (e: FormEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setApiError(null);
    try {
      const validationResult = formSchema.safeParse(formData);
      if (!validationResult.success) {
        const errors = validationResult.error.flatten().fieldErrors;
        setFormErrors({
          username: errors.username?.[0],
          password: errors.password?.[0],
        });
        setLoading(false);
        return;
      }

      const { data }: { data: ApiResponse } = await axios.post(
        `${import.meta.env.VITE_BASEURL}/api/auth/register`,
        formData
      );

      if (data.accessToken && data.refreshToken) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        navigate("/"); // Or navigate to a success page/dashboard
      } else {
        setApiError(data.message || "Registration failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Registration failed", error);
      setApiError(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        id="register"
        className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center p-4"
      >
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-sm sm:max-w-md">
          <div className="p-6 sm:p-8 md:p-10">
            <div className="mb-6 text-center sm:text-left">
              <h4 className="font-bold text-xl sm:text-3xl text-white">
                Register
              </h4>
              <h6 className="text-sm text-gray-400">to get started</h6>
            </div>
            <form
              className="flex flex-col gap-1"
              autoComplete="off"
              onSubmit={handleRegister}
            >
              <div className="relative">
                <EmailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 size-5 fill-gray-400" />
                <input
                  placeholder="Username"
                  autoComplete="new-username"
                  name="username"
                  value={formData?.username}
                  onChange={handleInputChange}
                  className={`login-input border border-gray-700 bg-gray-700 text-white p-2 pl-10 rounded-md w-full ${
                    formErrors?.username ? "input-error" : ""
                  }`}
                  type="text" // Changed from email to text for username
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
                  autoComplete="new-password" // Changed from current-password to new-password
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
                {loading ? "Loading..." : "Register"}
              </button>
            </form>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-y-2 text-white py-2">
              <p className="text-sm text-gray-400 whitespace-nowrap">
                Already have an account?
                <span
                  onClick={() => navigate("/login")}
                  className="underline text-yellow-400 cursor-pointer font-semibold ms-1"
                >
                  Login
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>{" "}
    </>
  );
};

export default Register;
