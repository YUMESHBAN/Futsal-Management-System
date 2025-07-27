import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Futsal {
  id: number;
  name: string;
  location: string;
  contact_number: string;
  price_per_hour: string;
  description: string;
}

export default function MyFutsals() {
  const [futsals, setFutsals] = useState<Futsal[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user_type = localStorage.getItem("user_type");

    if (token && user_type === "owner") {
      fetchMyFutsals(token);
    } else {
      console.log("token:", token);
      console.log("user_type:", user_type);
      navigate("/login");
    }
  }, [navigate]);

  const fetchMyFutsals = async (token: string) => {
    try {
      const response = await fetch("http://localhost:8000/api/my-futsals/", {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Unauthorized or failed to fetch.");
      }
      const data = await response.json();
      setFutsals(data);
    } catch (error) {
      console.error("Fetch error:", error);
      navigate("/login");
    }
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this futsal?"
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:8000/api/futsals/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (response.ok) {
        setFutsals((prev) => prev.filter((futsal) => futsal.id !== id));
      } else {
        alert("Failed to delete.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("An error occurred.");
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">My Futsals</h1>
        <button
          onClick={() => navigate("/create-futsal")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Create Futsal
        </button>
      </div>

      {futsals.length === 0 ? (
        <p className="text-gray-500">No futsals found.</p>
      ) : (
        <div className="space-y-4">
          {futsals.map((futsal) => (
            <div key={futsal.id} className="bg-white shadow rounded p-4 border">
              <h2 className="text-lg font-semibold">{futsal.name}</h2>
              <p>{futsal.location}</p>
              <p>Contact: {futsal.contact_number}</p>
              <p>Rs. {futsal.price_per_hour}/hr</p>
              <p>{futsal.description}</p>
              <div className="mt-2 space-x-4">
                <button
                  onClick={() => navigate(`/edit-futsal/${futsal.id}`)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(futsal.id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
