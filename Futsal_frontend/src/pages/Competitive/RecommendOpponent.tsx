import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import stadium from "../../assets/futsalstadium.jpg";
import Footer from "../../components/FooterIN";
import Header from "../../components/header";

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
      await axios.post(
        `${API_BASE_URL}/competitive/request/${teamId}/`,
        {},
        { headers: { Authorization: `Token ${token}` } }
      );
      setInviteMessage(`✅ Invitation sent to team ID ${teamId}`);
    } catch {
      setInviteMessage(`❌ Failed to send invitation to team ID ${teamId}`);
    }
  };

  return (
    <div>
      <Header />
      <div
        className="min-h-screen bg-cover bg-center flex items-center justify-center p-6"
        style={{ backgroundImage: `url(${stadium})` }}
      >
        <div className="w-full max-w-4xl p-6 bg-black/80 backdrop-blur-md text-white rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold uppercase tracking-wide">
              🏆 Recommended Opponents
            </h1>
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm font-semibold"
            >
              ← Back
            </button>
          </div>

          {/* Invite message */}
          {inviteMessage && (
            <div className="mb-4 text-center font-semibold text-green-400">
              {inviteMessage}
            </div>
          )}

          {/* Loading / Error */}
          {loading && (
            <p className="text-center text-lg text-green-400">
              Loading recommendations...
            </p>
          )}
          {error && <p className="text-center text-red-500">{error}</p>}

          {/* No recommendations */}
          {!loading && !error && recommendations.length === 0 && (
            <p className="text-center text-gray-400">
              No recommendations available.
            </p>
          )}

          {/* Recommendation Cards */}
          <div className="space-y-6">
            {recommendations.map((team, index) => (
              <div
                key={team.team_id}
                className="bg-gray-900/90 p-5 rounded-xl shadow-lg border border-green-700"
              >
                {/* Team Info */}
                <h2 className="text-2xl font-semibold mb-2">
                  {team.team_name}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <p>
                    <span className="text-gray-400">ELO:</span>{" "}
                    <span className="font-bold">
                      {team.elo_rating.toFixed(2)}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-400">Win Rate:</span>{" "}
                    <span className="font-bold">
                      {(team.win_rate * 100).toFixed(1)}%
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-400">Weighted:</span>{" "}
                    <span className="font-bold">
                      {team.weighted_score.toFixed(2)}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-400">Futsal:</span>{" "}
                    {team.futsal ?? "N/A"}
                  </p>
                </div>

                {/* Similarity score bar */}
                <div className="mt-4">
                  <p className="text-gray-400 text-sm">Similarity Score</p>
                  <div className="w-full bg-gray-800 rounded-full h-3 mt-1">
                    <div
                      className="bg-green-600 h-3 rounded-full"
                      style={{
                        width: `${(team.similarity_score * 100).toFixed(0)}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs mt-1 text-gray-400">
                    {(team.similarity_score * 100).toFixed(1)}%
                  </p>
                </div>

                {/* Invitation Button (only for first team) */}
                {index === 0 && (
                  <button
                    onClick={() => handleSendInvitation(team.team_id)}
                    className="mt-6 w-full bg-blue-600 hover:bg-blue-700 transition-all duration-300 text-lg font-bold py-3 rounded-xl shadow-lg"
                  >
                    📩 Send Match Invitation
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
