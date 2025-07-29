import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../utils/api";
import { useNavigate } from "react-router-dom";

interface TeamRecommendation {
  team_id: number;
  team_name: string;
  elo_rating: number;
  win_rate: number;
  weighted_score: number;
  futsal: string | null;
  similarity_score: number;
}

export default function RecommendOpponent() {
  const [recommendations, setRecommendations] = useState<TeamRecommendation[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to view recommendations.");
      setLoading(false);
      return;
    }

    axios
      .get(`${API_BASE_URL}/competitive/recommend/`, {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => {
        setRecommendations(res.data.recommendations);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch recommendations.");
        setLoading(false);
      });
  }, []);

  const handleSendInvitation = async (teamId: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setInviteMessage("Unauthorized.");
      return;
    }

    try {
      const res = await axios.post(
        `${API_BASE_URL}/competitive/request/${teamId}/`,
        {},
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      setInviteMessage(`✅ Invitation sent to team ID ${teamId}`);
    } catch (err) {
      setInviteMessage(`❌ Failed to send invitation to team ID ${teamId}`);
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 hover:underline"
      >
        &larr; Back
      </button>

      <h1 className="text-3xl font-bold mb-4">Recommended Opponents</h1>

      {inviteMessage && (
        <div className="mb-4 text-center text-green-700 font-semibold">
          {inviteMessage}
        </div>
      )}

      {loading && <p>Loading recommendations...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && recommendations.length === 0 && (
        <p>No recommendations available.</p>
      )}

      <ul>
        {recommendations.map((team, index) => (
          <li
            key={team.team_id}
            className="border p-4 mb-3 rounded shadow flex flex-col md:flex-row justify-between items-start md:items-center"
          >
            <div>
              <h2 className="text-xl font-semibold">{team.team_name}</h2>
              <p>ELO Rating: {team.elo_rating.toFixed(2)}</p>
              <p>Win Rate: {(team.win_rate * 100).toFixed(1)}%</p>
              <p>Weighted Score: {team.weighted_score.toFixed(2)}</p>
              <p>Futsal: {team.futsal ?? "N/A"}</p>
              <p>Similarity Score: {team.similarity_score.toFixed(3)}</p>
            </div>

            {/* Button only for the first recommended team */}
            {index === 0 && (
              <button
                onClick={() => handleSendInvitation(team.team_id)}
                className="mt-4 md:mt-0 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Send Match Invitation
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
