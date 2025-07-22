import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [username, setUsername] = useState("");
  const [userType, setUserType] = useState("");
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
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow w-96 text-center">
        <h2 className="text-2xl font-bold mb-4">Welcome, {username}!</h2>
        <p className="mb-4 text-gray-700">
          You are logged in as <strong>{userType}</strong>.
        </p>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
