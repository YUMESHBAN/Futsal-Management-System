import { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
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
      setError("Invalid credentials");
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100 space-y-4">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded-lg shadow w-96"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
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
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Login
        </button>
      </form>

      <div className="flex flex-col space-y-2 w-96">
        <button
          onClick={() => navigate("/register")}
          className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
        >
          Register Here!!!
        </button>

        <button
          onClick={() => navigate("/")}
          className="text-blue-600 hover:underline"
        >
          &larr; Back to Home
        </button>
      </div>
    </div>
  );
}
