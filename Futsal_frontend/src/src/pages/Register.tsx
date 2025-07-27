import { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState(""); // if you use email
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("player");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/register/`, {
        username,
        email, // remove if you don't need email
        password,
        user_type: userType,
      });

      // Redirect to login page after successful registration
      navigate("/login");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.response && err.response.data) {
        const errorText =
          err.response.data.username?.[0] ||
          err.response.data.email?.[0] ||
          err.response.data.password?.[0] ||
          err.response.data.user_type?.[0] ||
          err.response.data.non_field_errors?.[0] ||
          "Registration failed.";
        setError(errorText);
      } else {
        setError("Server error or network issue.");
      }
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100 space-y-6">
      <form
        onSubmit={handleRegister}
        className="bg-white p-6 rounded-lg shadow w-96"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
        {error && <p className="text-red-500 mb-3">{error}</p>}

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
          required
        />

        <select
          value={userType}
          onChange={(e) => setUserType(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
        >
          <option value="player">Player</option>
          <option value="owner">Futsal Owner</option>
        </select>

        <button
          type="submit"
          className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
        >
          Register
        </button>
      </form>

      <button
        onClick={() => navigate("/")}
        className="text-blue-600 hover:underline"
      >
        &larr; Back to Home
      </button>
    </div>
  );
}
