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

    if (!token || user_type !== "owner") {
      navigate("/login");
    } else {
      fetchMyFutsals(token);
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
      navigate("/login"); // fallback
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Futsals</h1>
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
              <button
                onClick={() => navigate(`/edit-futsal/${futsal.id}`)}
                className="text-sm text-blue-600 hover:underline mt-2"
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
