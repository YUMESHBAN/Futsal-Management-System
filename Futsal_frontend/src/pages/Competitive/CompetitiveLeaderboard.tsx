import { useEffect, useState } from "react";
import axios from "axios";
import Footer from "../../components/FooterIN";
import Header from "../../components/header";
import stadium from "../../assets/futsalstadium.jpg";

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

  const getRowStyle = (index: number) => {
    switch (index) {
      case 0:
        return "bg-yellow-300/80 text-gray-900 font-bold"; // Gold
      case 1:
        return "bg-gray-300/80 text-gray-900 font-semibold"; // Silver
      case 2:
        return "bg-orange-300/80 text-gray-900 font-semibold"; // Bronze
      default:
        return "bg-white/40"; // Transparent rows
    }
  };

  return (
    <div>
      <Header />
      <div
        className="min-h-screen bg-cover bg-center flex items-center justify-center p-6"
        style={{ backgroundImage: `url(${stadium})` }}
      >
        {/* Transparent container */}
        <div className="relative w-full max-w-5xl rounded-xl shadow-2xl overflow-hidden bg-white/30 backdrop-blur-md border border-white/40">
          {/* Header */}
          <div className="bg-green-700/80 py-6 px-4">
            <h1 className="text-3xl md:text-4xl font-extrabold text-center text-white tracking-wide drop-shadow-lg">
              ⚽ Competitive Leaderboard
            </h1>
          </div>

          {/* Error */}
          {error && <p className="text-red-500 text-center mt-4">{error}</p>}

          {/* Table */}
          {teams.length === 0 ? (
            <p className="text-center text-gray-200 py-6">No teams to show.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-gray-900 text-center">
                <thead className="bg-green-600/80 text-white uppercase text-sm">
                  <tr>
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Team</th>
                    <th className="py-3 px-4">Owner</th>
                    <th className="py-3 px-4">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team, index) => (
                    <tr
                      key={team.id}
                      className={`border-b border-white/30 ${getRowStyle(
                        index
                      )} 
          hover:bg-green-200/40 hover:shadow-md transition-colors duration-200`}
                    >
                      <td className="py-3 px-4">{index + 1}</td>
                      <td className="py-3 px-4">{team.name}</td>
                      <td className="py-3 px-4">{team.owner_name}</td>
                      <td className="py-3 px-4 font-semibold">
                        {team.ranking.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer legend */}
          <div className="bg-green-700/80 text-white text-xs md:text-sm px-4 py-2 flex flex-wrap gap-4 justify-center">
            <span>🏆 Gold = Rank 1</span>
            <span>🥈 Silver = Rank 2</span>
            <span>🥉 Bronze = Rank 3</span>
            <span>✔ Hover = Highlight</span>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
