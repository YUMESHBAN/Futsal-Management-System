import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import logo from "../assets/home/logo.png"; // make sure this exists

export default function Footer() {
  const [username, setUsername] = useState("");
  const [, setUserType] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user_type = localStorage.getItem("user_type");
    const user_name = localStorage.getItem("username");

    if (!token) {
      navigate("/login");
    } else {
      setUsername(user_name || "");
      setUserType(user_type || "");
      setLoading(false);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading ...</p>
        </div>
      </div>
    );
  }

  return (
    <footer className="bg-gradient-to-r from-green-700 to-emerald-700 text-white relative px-8 md:px-20 py-12">
      <div className="grid md:grid-cols-2 gap-12">
        {/* Left Section: About + Quick Links */}
        <div>
          <h2 className="text-3xl font-bold mb-6 text-[#F1C40F]">
            HamroFutsal
          </h2>
          <p className="text-gray-300 mb-6 max-w-md">
            The complete futsal solution – manage matches, teams, and bookings
            effortlessly. One platform for players, organizers, and fans.
          </p>

          <div className="flex items-center space-x-4">
            <span className="hidden sm:block bg-white/10 px-3 py-1 rounded-full">
              Come again for your next match, <strong>{username}</strong>!
            </span>

            <button
              onClick={handleLogout}
              className="bg-white text-green-700 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition-all flex items-center"
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
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          </div>
        </div>

        {/* Right Section: Contact Info */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-[#F1C40F]">Contact Us</h3>

          <div className="flex items-center gap-3 text-gray-300">
            <Phone className="w-5 h-5 text-[#F1C40F]" />
            <p>+977-986******</p>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <Mail className="w-5 h-5 text-[#F1C40F]" />
            <p>hamrofutsal41@gmail.com</p>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <MapPin className="w-5 h-5 text-[#F1C40F]" />
            <p>Kathmandu, Nepal</p>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-12 border-t border-gray-700 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Logo & Description */}
        <div className="flex items-start gap-4 max-w-xl">
          <div>
            <img src={logo} alt="Logo" className="w-16 h-16" />
            <h4 className="font-semibold text-[#F1C40F] text-xl">
              HAMROFUTSAL
            </h4>
            <p className="text-sm text-gray-300">
              Complete solution in one click
            </p>
          </div>
        </div>

        {/* Credits */}
        <p className="text-sm text-gray-200 text-center md:text-right w-full md:w-auto">
          © 2025 HAMROFUTSAL.KTM , NEPAL <br />
          <span className="text-gray-400">
            Designed & Developed by{" "}
            <span className="font-bold">Sujal, Rupesh & Yumesh</span>
          </span>
        </p>
      </div>
    </footer>
  );
}
