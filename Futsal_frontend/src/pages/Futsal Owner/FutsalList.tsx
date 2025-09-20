import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../utils/api";

interface Futsal {
  id: number;
  name: string;
  location: string;
  contact_number: string;
  price_per_hour: string;
  description: string;
}

export default function FutsalList() {
  const [futsals, setFutsals] = useState<Futsal[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user_type = localStorage.getItem("user_type");

    if (!token || user_type !== "owner") {
      navigate("/login");
      return;
    }

    axios
      .get(`${API_BASE_URL}/my-futsals/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      })
      .then((res) => {
        setFutsals(res.data);
      })
      .catch((err) => {
        console.error("Failed to load futsals", err);
        navigate("/login");
      });
  }, [navigate]);

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this futsal?"
    );
    if (!confirmDelete) return;

    try {
      const response = await axios.delete(`${API_BASE_URL}/futsals/${id}/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (response.status === 204) {
        setFutsals((prev) => prev.filter((futsal) => futsal.id !== id));
      } else {
        alert("Failed to delete.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("An error occurred while deleting.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-green-600">🏟️ My Futsals</h1>
        <button
          onClick={() => navigate("/create-futsal")}
          className="bg-green-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-green-700 transition duration-300"
        >
          + Create Futsal
        </button>
      </div>

      {futsals.length === 0 ? (
        <p className="text-gray-600 text-center text-lg bg-white py-6 rounded-lg shadow">
          No futsals found. 🚫
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {futsals.map((futsal) => (
            <div
              key={futsal.id}
              className="bg-white border border-green-200 shadow-lg rounded-xl p-6 hover:shadow-xl transition duration-300"
            >
              <h2 className="text-xl font-bold text-green-700 mb-2">
                {futsal.name}
              </h2>
              <p className="text-gray-700 mb-1">📍 {futsal.location}</p>
              <p className="text-gray-700 mb-1">📞 {futsal.contact_number}</p>
              <p className="text-gray-700 font-medium mb-2">
                💰 Rs. {futsal.price_per_hour}/hr
              </p>
              <p className="text-gray-600 text-sm mb-4">{futsal.description}</p>

              <div className="flex justify-between">
                <button
                  onClick={() => navigate(`/edit-futsal/${futsal.id}`)}
                  className="text-green-600 font-semibold hover:underline"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(futsal.id)}
                  className="text-red-600 font-semibold hover:underline"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
