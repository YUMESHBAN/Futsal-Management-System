import { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../utils/api";
import { useNavigate, Link } from "react-router-dom";
import logo from "../../assets/home/logo.png";
import Footer from "../../components/Footer";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API_BASE_URL}/login/`, {
        username,
        password,
      });
      const { token, user_type } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user_type", user_type);
      localStorage.setItem("username", username);
      navigate("/dashboard");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Invalid username or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-green-600 to-emerald-700 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div
          className="text-2xl font-bold cursor-pointer flex items-center"
          onClick={() => navigate("/")}
        >
          <img src={logo} alt="Logo" className="w-16 h-16" />
        </div>
        <div className="space-x-6">
          <button
            onClick={() => navigate("/about")}
            className="font-medium px-3 py-1 rounded-lg transition-all hover:bg-white/10"
          >
            About Us
          </button>
          <button
            onClick={() => navigate("/contact")}
            className="font-medium px-3 py-1 rounded-lg transition-all hover:bg-white/10"
          >
            Contact Us
          </button>
          <button
            onClick={() => navigate("/register")}
            className="font-medium px-3 py-1 rounded-lg transition-all hover:bg-white/10"
          >
            Register
          </button>
          <button
            onClick={() => navigate("/login")}
            className="font-semibold px-3 py-1 rounded-lg bg-white/10 backdrop-blur-sm transition-all hover:bg-white/20"
          >
            Login
          </button>
        </div>
      </nav>

      {/* Main Login Form */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 rounded-full shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600">Sign in to your HamroFutsal account</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden pb-5">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 h-2 w-full"></div>

            <form onSubmit={handleLogin} className="p-8 space-y-5">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-3 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  required
                />
              </div>

              {/* Password */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-3 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-green-600 transition-colors"
                >
                  {showPassword ? "👁️" : "🙈"}
                </button>
              </div>

              {/* Remember Me / Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <a
                    href="/contact"
                    className="font-medium text-green-600 hover:text-green-500"
                  >
                    Forgot password?
                  </a>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-600 mt-4">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-green-600 hover:text-green-700"
              >
                Register here
              </Link>
            </p>
          </div>

          {/* Return to Home */}
          <div className="text-center mt-6" mb-10>
            <button
              onClick={() => navigate("/")}
              className="text-green-600 hover:text-green-700 font-medium flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Return to Home
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
