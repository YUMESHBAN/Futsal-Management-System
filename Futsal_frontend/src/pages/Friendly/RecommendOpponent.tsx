import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../utils/api";
import { useNavigate } from "react-router-dom";
import stadium from "../../assets/futsalstadium.jpg";
import Footer from "../../components/FooterIN";
import Header from "../../components/Header";

interface TeamRecommendation {
  team_id: number;
  team_name: string;
  elo_rating: number;
  win_rate: number;
  weighted_score: number;
  preferred_futsals: string[] | null;
  similarity_score: number;
  recently_rejected: boolean;
  status?: string; // NEW: for project clarity
}

export default function RecommendOpponent() {
  const [recommendations, setRecommendations] = useState<TeamRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  // Fetch recommendations
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
        // Add a status field for clarity
        const updated = res.data.recommendations.map((team: TeamRecommendation) => ({
          ...team,
          status: team.recently_rejected ? "❌ Recently Rejected" : "✅ Available",
        }));
        setRecommendations(updated);

        // Automatically focus first available team
        const firstAvailable = updated.findIndex(t => t.status === "✅ Available");
        setActiveIndex(firstAvailable !== -1 ? firstAvailable : 0);

        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch recommendations.");
        setLoading(false);
      });
  }, []);

  // Handle sending invitation
  const handleSendInvitation = async (team: TeamRecommendation) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setInviteMessage("Unauthorized.");
      return;
    }

    if (team.status !== "✅ Available") {
      setInviteMessage(`❌ Cannot send invitation. ${team.team_name} is on cooldown.`);
      // Move to next available recommendation
      const nextIndex = recommendations.findIndex(
        (t, idx) => idx > activeIndex && t.status === "✅ Available"
      );
      setActiveIndex(nextIndex !== -1 ? nextIndex : activeIndex);
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/competitive/request/${team.team_id}/`,
        {},
        { headers: { Authorization: `Token ${token}` } }
      );

      setInviteMessage(`✅ Invitation sent to ${team.team_name}`);

      // Move to next available team
      const nextIndex = recommendations.findIndex(
        (t, idx) => idx > activeIndex && t.status === "✅ Available"
      );
      setActiveIndex(nextIndex !== -1 ? nextIndex : activeIndex);

      // Optionally navigate after short delay
      setTimeout(() => {
        navigate("/competitive-center");
      }, 1000);
    } catch (error: any) {
      setInviteMessage(
        error.response?.data?.error ||
          `❌ Failed to send invitation. ${team.team_name} rejected you previously.`
      );

      // Update the status of this team to rejected
      setRecommendations(prev =>
        prev.map(t =>
          t.team_id === team.team_id
            ? { ...t, status: "❌ Recently Rejected" }
            : t
        )
      );

      // Move to next available team
      const nextIndex = recommendations.findIndex(
        (t, idx) => idx > activeIndex && t.status === "✅ Available"
      );
      setActiveIndex(nextIndex !== -1 ? nextIndex : activeIndex);
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

          {/* Invite Message */}
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
                className={`bg-gray-900/90 p-5 rounded-xl shadow-lg border border-green-700 ${
                  index === activeIndex ? "opacity-100" : "opacity-60"
                }`}
              >
                {/* Team Info */}
                <h2 className="text-2xl font-semibold mb-2">{team.team_name}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <p>
                    <span className="text-gray-400">ELO:</span>{" "}
                    <span className="font-bold">{team.elo_rating.toFixed(2)}</span>
                  </p>
                  <p>
                    <span className="text-gray-400">Win Rate:</span>{" "}
                    <span className="font-bold">{(team.win_rate * 100).toFixed(1)}%</span>
                  </p>
                  <p>
                    <span className="text-gray-400">Weighted:</span>{" "}
                    <span className="font-bold">{team.weighted_score.toFixed(2)}</span>
                  </p>
                  <p className="col-span-2 md:col-span-3">
                    <span className="text-gray-400">Preferred Futsals:</span>{" "}
                    {team.preferred_futsals?.length ? team.preferred_futsals.join(", ") : "N/A"}
                  </p>
                </div>

                {/* Similarity Score Bar */}
                <div className="mt-4">
                  <p className="text-gray-400 text-sm">Similarity Score</p>
                  <div className="w-full bg-gray-800 rounded-full h-3 mt-1">
                    <div
                      className="bg-green-600 h-3 rounded-full"
                      style={{ width: `${(team.similarity_score * 100).toFixed(0)}%` }}
                    />
                  </div>
                  <p className="text-xs mt-1 text-gray-400">
                    {(team.similarity_score * 100).toFixed(1)}%
                  </p>
                </div>

                {/* Status / Invitation Button */}
                {index === activeIndex && (
                  <button
                    onClick={() => handleSendInvitation(team)}
                    disabled={team.status !== "✅ Available"}
                    className={`mt-6 w-full text-lg font-bold py-3 rounded-xl shadow-lg transition-all duration-300 ${
                      team.status !== "✅ Available"
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {team.status === "✅ Available"
                      ? "📩 Send Match Invitation"
                      : team.status}
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
