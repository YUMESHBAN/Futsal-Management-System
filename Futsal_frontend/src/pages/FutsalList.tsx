import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../utils/api";

interface Futsal {
  id: number;
  name: string;
  location: string;
}

export default function FutsalList() {
  const [futsals, setFutsals] = useState<Futsal[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
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
      });
  }, [navigate]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Your Futsals</h2>
      <ul>
        {futsals.map((futsal) => (
          <li
            key={futsal.id}
            className="p-4 mb-3 bg-white rounded shadow cursor-pointer hover:bg-gray-100"
            onClick={() => navigate(`/edit-futsal/${futsal.id}`)}
          >
            <h3 className="text-xl font-semibold">{futsal.name}</h3>
            <p className="text-gray-600">{futsal.location}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
