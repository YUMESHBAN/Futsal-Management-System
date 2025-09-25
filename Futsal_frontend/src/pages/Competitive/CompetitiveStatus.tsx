import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import Image from "../../assets/FootballIcon.png";
import stadium from "../../assets/futsalstadium.jpg";
import Footer from "../../components/FooterIN";
import Header from "../../components/header";

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

    const token = localStorage.getItem("token");

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
    } catch {
      setError("Failed to fetch team data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  if (loading)
    return (
      <div className="text-center text-lg text-green-600 font-semibold">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="text-center text-red-600 font-semibold">{error}</div>
    );
  if (!team)
    return (
      <div className="text-center text-gray-600">No team info available.</div>
    );

  return (
    <div>
      <Header />
      <div
        className="min-h-screen bg-cover bg-center flex items-center justify-center p-6"
        style={{ backgroundImage: `url(${stadium})` }}
      >
        <div className="max-w-4xl w-full bg-gradient-to-br from-green-800/90 to-black/90 text-white rounded-2xl shadow-2xl p-6 backdrop-blur-sm">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold uppercase tracking-wide">
              ⚽ Competitive Status
            </h2>
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm font-semibold"
            >
              ← Dashboard
            </button>
          </div>

          {/* Team Info */}
          <div className="mb-6">
            <h3 className="text-2xl font-semibold mb-2">{team.name}</h3>
            <p className="text-sm text-gray-300">
              Home Futsal: {team.futsal ? team.futsal.name : "None"}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center mb-8">
            <div className="bg-green-700 p-4 rounded-xl shadow-md">
              <p className="text-sm text-gray-200">Ranking (ELO)</p>
              <p className="text-2xl font-bold">{team.ranking.toFixed(2)}</p>
            </div>
            <div className="bg-green-700 p-4 rounded-xl shadow-md">
              <p className="text-sm text-gray-200">Wins</p>
              <p className="text-2xl font-bold">{team.wins}</p>
            </div>
            <div className="bg-green-700 p-4 rounded-xl shadow-md">
              <p className="text-sm text-gray-200">Matches</p>
              <p className="text-2xl font-bold">{team.matches_played}</p>
            </div>
          </div>

          {/* Preferred Futsals */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">🏟 Preferred Futsals</h3>
            <ul className="space-y-2">
              {team.preferred_futsals.map((futsal) => (
                <li key={futsal.id} className="bg-gray-800 p-3 rounded-lg">
                  {futsal.name}{" "}
                  <span className="text-sm text-gray-400">
                    ({futsal.location})
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Players */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">👥 Players</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {team.players.map((player) => (
                <div
                  key={player.id}
                  className="bg-gray-900 rounded-lg p-4 flex flex-col items-center shadow-lg"
                >
                  <label htmlFor={`photo-${player.id}`}>
                    <img
                      src={
                        player.photo
                          ? player.photo.startsWith("http")
                            ? player.photo
                            : `http://127.0.0.1:8000${player.photo}`
                          : Image
                      }
                      alt={player.name}
                      className="w-24 h-24 mx-auto rounded-full object-cover mb-3 cursor-pointer hover:opacity-80 border-2 border-gray-200"
                    />
                  </label>
                  <p className="font-semibold">{player.name}</p>
                  <p className="text-sm text-gray-400">{player.position}</p>
                  <p className="text-xs text-gray-500">{player.age} yrs</p>
                  {player.is_captain && (
                    <span className="mt-2 text-xs bg-green-600 px-2 py-1 rounded-full">
                      Captain
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recommend Opponent Button */}
          <button
            onClick={() => navigate("/recommend-opponent")}
            className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-300 text-lg font-bold py-3 rounded-xl shadow-lg"
          >
            🏆 Recommend Opponent
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
