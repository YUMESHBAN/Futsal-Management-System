import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [username, setUsername] = useState("");
  const [userType, setUserType] = useState("");
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

  if (loading)
    return <div className="text-center mt-20 text-gray-500">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <span className="text-gray-600 hidden sm:block">
            Welcome, <strong>{username}</strong>!
          </span>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 justify-center items-center px-4">
        <div className="bg-white shadow rounded-lg p-6 w-full max-w-md text-center space-y-4">
          <p className="text-gray-700 text-lg">
            Logged in as <strong>{userType}</strong>
          </p>

          {/* Owner Dashboard */}
          {userType === "owner" ? (
            <>
              <button
                onClick={() => navigate("/create-futsal")}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Create Futsal
              </button>
              <button
                onClick={() => navigate("/my-futsal")}
                className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                View My Futsals
              </button>
              <button
                onClick={() => navigate("/generate-slots")}
                className="w-full bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
              >
                Generate Time Slots
              </button>
              <button
                onClick={() => navigate("/manage-slots")}
                className="w-full bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
              >
                Manage Time Slots
              </button>

              <button
                onClick={() => navigate("/time-slots")}
                className="w-full bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700"
              >
                View All Time Slots
              </button>
              <button
                onClick={() => navigate("/match-results")}
                className="w-full bg-pink-600 text-white px-4 py-2 rounded hover:bg-cyan-700"
              >
                Enter Match Results
              </button>
            </>
          ) : (
            <>
              <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
                <h2 className="text-2xl font-bold text-center mb-6">
                  Player Dashboard
                </h2>
                <div className="space-y-4">
                  {/* Player Dashboard */}
                  <button
                    onClick={() => navigate("/all-futsals")}
                    className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    View All Futsals
                  </button>
                  <button
                    onClick={() => navigate("/create-team")}
                    className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                  >
                    Create My Team
                  </button>
                  <button
                    onClick={() => navigate("/my-team")}
                    className="w-full bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
                  >
                    View My Team
                  </button>
                  <button
                    onClick={() => navigate("/invite-team")}
                    className="w-full bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                  >
                    Invite Team for Match
                  </button>

                  <button
                    onClick={() => navigate("/matches")}
                    className="w-full bg-orange-700 text-white px-4 py-2 rounded hover:bg-gray-800"
                  >
                    View My Matches
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
