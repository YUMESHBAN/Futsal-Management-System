import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../utils/api";

interface Futsal {
  id: number;
  name: string;
  location: string;
  contact_number: string;
  price_per_hour: string;
  description: string;
}

export default function AllFutsals() {
  const [futsals, setFutsals] = useState<Futsal[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    axios
      .get(`${API_BASE_URL}/futsals/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      })
      .then((res) => {
        setFutsals(res.data);
      })
      .catch((err) => {
        console.error("Failed to load futsals", err);
      });
  }, [navigate]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Futsal Venues</h1>

      {futsals.length === 0 ? (
        <p className="text-gray-500">No futsals available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {futsals.map((futsal) => (
            <div key={futsal.id} className="bg-white p-4 rounded shadow border">
              <h2 className="text-lg font-semibold">{futsal.name}</h2>
              <p>{futsal.location}</p>
              <p>Contact: {futsal.contact_number}</p>
              <p>Rs. {futsal.price_per_hour}/hr</p>
              <p className="text-sm text-gray-600">{futsal.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
