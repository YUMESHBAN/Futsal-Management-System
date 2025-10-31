import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import logo from "../assets/home/logo.png";

export default function Header() {
  const [username, setUsername] = useState("");
  const [userType, setUserType] = useState("");
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasFutsal, setHasFutsal] = useState(false);
  const [hasTeam, setHasTeam] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user_type = localStorage.getItem("user_type");
    const user_name = localStorage.getItem("username");

    if (!token) {
      navigate("/login");
    } else {
      setUsername(user_name || "");
      setUserType(user_type || "");

      if (user_type === "owner") {
        fetchOwnerFutsal(token);
      } else if (user_type === "player") {
        fetchPlayerTeam(token); // ✅ check if player has a team
      }

      setLoading(false);
    }
  }, [navigate]);

  const fetchOwnerFutsal = async (token: string) => {
    try {
      const res = await fetch("http://localhost:8000/api/my-futsals/", {
        headers: { Authorization: `Token ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch futsal");
      const data = await res.json();
      setHasFutsal(data && data.length > 0);
    } catch (err) {
      console.error(err);
      setHasFutsal(false);
    }
  };

  const fetchPlayerTeam = async (token: string) => {
    try {
      const res = await fetch("http://localhost:8000/api/my-team/", {
        headers: { Authorization: `Token ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch team");
      const data = await res.json();
      setHasTeam(data && Object.keys(data).length > 0);
    } catch (err) {
      console.error(err);
      setHasTeam(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const ownerOptions = [
    { label: "Dashboard", path: "/dashboard" },
    hasFutsal
      ? { label: "View My Futsals", path: "/my-futsal" }
      : { label: "Create Futsal", path: "/create-futsal" },
    { label: "Generate Time Slots", path: "/generate-slots" },
    { label: "Manage Time Slots", path: "/manage-slots" },
    { label: "View All Time Slots", path: "/time-slots" },
    { label: "Enter Match Results", path: "/match-results" },
    { label: "Finalize Matches", path: "/finalize-matches" },
  ];

  const playerOptions = [
    { label: "Dashboard", path: "/dashboard" },

    hasTeam
      ? { label: "View My Team", path: "/my-team" } // ✅ already has team
      : { label: "Create My Team", path: "/create-team" }, // ✅ no team yet
    { label: "View All Futsals", path: "/all-futsals" },
    { label: "Invite Team for Match", path: "/invite-team" },
    { label: "View My Matches", path: "/matches" },
    { label: "View My Team Rating", path: "/my-competitive-status" },
    { label: "Competitive Invitations", path: "/competitive-center" },
    { label: "Leaderboard", path: "/competitive-leaderboard" },
  ];

  const menuItems = userType === "owner" ? ownerOptions : playerOptions;

  const currentPage =
    menuItems.find((item) => item.path === location.pathname)?.label ||
    "Dashboard";

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 flex flex-col">
      <header className="bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-lg p-4 flex justify-between items-center relative">
        {/* Logo & Dashboard Title */}
        <div
          className="flex items-center cursor-pointer hover:scale-105 transition-transform"
          onClick={() => navigate("/dashboard")}
        >
          <img src={logo} alt="Logo" className="w-14 h-14 sm:w-16 sm:h-16" />
          <h1 className="text-lg sm:text-xl font-bold ml-2">
            HamroFutsal Dashboard
          </h1>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Welcome Badge */}
          <span className="hidden sm:inline-block bg-white/20 px-3 py-1 rounded-full text-sm font-medium transition-all hover:bg-white/30">
            Welcome, <strong>{username}</strong>!
          </span>

          {/* User Type Badge */}
          <span className="hidden sm:inline-block bg-emerald-800 px-3 py-1 rounded-full text-sm capitalize font-medium">
            {userType}
          </span>

          {/* Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="bg-white text-green-700 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition-all flex items-center focus:outline-none focus:ring-2 focus:ring-green-300"
            >
              {currentPage}
              <ChevronDown className="ml-2 h-4 w-4" />
            </button>

            {menuOpen && (
              <div className="absolute left-0 mt-2 w-52 bg-white rounded-lg shadow-lg text-gray-700 z-50 border border-gray-200 overflow-hidden mt-7">
                {menuItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      navigate(item.path);
                      setMenuOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm transition-colors font-medium ${
                      location.pathname === item.path
                        ? "bg-green-100 text-green-700"
                        : "hover:bg-green-100"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="bg-white text-green-700 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition-all flex items-center focus:outline-none focus:ring-2 focus:ring-green-300"
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
      </header>
    </div>
  );
}
