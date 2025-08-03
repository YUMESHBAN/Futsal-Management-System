import { useEffect, useState } from "react";
import axios from "axios";

interface LeaderboardEntry {
  id: number;
  name: string;
  ranking: number;
  owner_name: string;
}

export default function Leaderboard() {
  const [teams, setTeams] = useState<LeaderboardEntry[]>([]);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    axios
      .get("http://127.0.0.1:8000/api/competitive/leaderboard/", {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => setTeams(res.data))
      .catch(() => setError("Failed to fetch leaderboard."));
  }, [token]);

  const getRankStyle = (index: number) => {
    switch (index) {
      case 0:
        return "bg-yellow-300 font-bold"; // Gold
      case 1:
        return "bg-gray-300 font-semibold"; // Silver
      case 2:
        return "bg-orange-300 font-semibold"; // Bronze
      default:
        return "";
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">
        🏆 Competitive Leaderboard
      </h1>

      {error && <p className="text-red-500 text-center">{error}</p>}

      {teams.length === 0 ? (
        <p className="text-center text-gray-600">No teams to show.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 rounded shadow">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-3 px-4 text-left">Rank</th>
                <th className="py-3 px-4 text-left">Team Name</th>
                <th className="py-3 px-4 text-left">Owner</th>
                <th className="py-3 px-4 text-left">Rating</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team, index) => (
                <tr
                  key={team.id}
                  className={`border-t border-gray-200 ${getRankStyle(index)}`}
                >
                  <td className="py-2 px-4">{index + 1}</td>
                  <td className="py-2 px-4">{team.name}</td>
                  <td className="py-2 px-4 italic">{team.owner_name}</td>
                  <td className="py-2 px-4">{team.ranking.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
