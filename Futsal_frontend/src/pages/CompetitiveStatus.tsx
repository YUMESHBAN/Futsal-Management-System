import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../utils/api";
import { useNavigate } from "react-router-dom";

interface Futsal {
  id: number;
  name: string;
  location: string;
  contact_number: string;
  price_per_hour: string;
  description: string;
  owner: number;
}

interface Player {
  id: number;
  name: string;
  age: number;
  position: string;
  is_captain: boolean;
  photo: string | null;
}

interface Team {
  id: number;
  name: string;
  location: string;
  skill_level: string;
  owner: number;
  futsal: Futsal | null;
  preferred_futsals: Futsal[];
  ranking: number;
  wins: number;
  matches_played: number;
  created_at: string;
  players: Player[];
}

export default function CompetitiveStatus() {
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchTeam = async () => {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token"); // <== Here is the fix!

    if (!token) {
      setError("You must be logged in to view this information.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get<Team[]>(`${API_BASE_URL}/teams/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (response.data.length > 0) {
        setTeam(response.data[0]);
      } else {
        setError("No team data found.");
      }
    } catch (err) {
      setError("Failed to fetch team data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  if (!team) return <div>No team info available.</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded shadow">
      <button
        onClick={() => navigate("/dashboard")}
        className="w-full bg-green-700 text-white px-4 py-2 rounded hover:bg-gray-800"
      >
        Go back
      </button>
      <h2 className="text-2xl font-bold mb-4">Competitive Status</h2>
      <p>
        <strong>Team Name:</strong> {team.name}
      </p>
      <p>
        <strong>Ranking (ELO):</strong> {team.ranking.toFixed(2)}
      </p>
      <p>
        <strong>Wins:</strong> {team.wins}
      </p>
      <p>
        <strong>Matches Played:</strong> {team.matches_played}
      </p>
      <p>
        <strong>Home Futsal:</strong> {team.futsal ? team.futsal.name : "None"}
      </p>

      <div className="mt-4">
        <h3 className="text-xl font-semibold">Preferred Futsals:</h3>
        <ul className="list-disc list-inside">
          {team.preferred_futsals.map((futsal) => (
            <li key={futsal.id}>
              {futsal.name} - {futsal.location}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <h3 className="text-xl font-semibold">Players:</h3>
        <ul className="list-disc list-inside">
          {team.players.map((player) => (
            <li key={player.id}>
              {player.name} ({player.age} years){" "}
              {player.is_captain ? "- Captain" : ""}
            </li>
          ))}
        </ul>
      </div>

      {/* New Button */}
      <button
        onClick={() => navigate("/recommend-opponent")}
        className="mt-6 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Recommend Opponent
      </button>
    </div>
  );
}
