import { useEffect, useState } from "react";
import axios from "axios";
import Header from "../../components/header";
import Footer from "../../components/FooterIN";

interface Match {
  id: number;
  team_1_name: string;
  team_2_name: string;
  scheduled_time: string | null;
  result_updated: boolean;
}

export default function MatchResults() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");

  const [scores, setScores] = useState<Record<number, { team_1_score: number; team_2_score: number }>>({});

  const updateScoreEntry = (matchId: number, patch: Partial<{ team_1_score: number; team_2_score: number }>) => {
    setScores((prev) => {
      const prevEntry = prev[matchId] ?? { team_1_score: 0, team_2_score: 0 };
      return { ...prev, [matchId]: { ...prevEntry, ...patch } };
    });
  };

  useEffect(() => {
    fetchMatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMatches = async () => {
    try {
      if (!token) return setMatches([]);
      const res = await axios.get("http://127.0.0.1:8000/api/team-matches/", {
        headers: { Authorization: `Token ${token}` },
      });
      setMatches(res.data);
    } catch {
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (matchId: number) => {
    const entry = scores[matchId];
    if (!entry || entry.team_1_score == null || entry.team_2_score == null) {
      setMessage("⚠️ Both scores are required.");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const res = await axios.post(
        `http://127.0.0.1:8000/api/team-matches/${matchId}/update-result/`,
        {
          team_1_score: entry.team_1_score,
          team_2_score: entry.team_2_score,
        },
        { headers: { Authorization: `Token ${token}` } }
      );

      setMessage(res.data?.detail || "✅ Result updated successfully!");
      setExpandedId(null);
      setMatches((prev) => prev.filter((m) => m.id !== matchId));
      setScores((prev) => {
        const copy = { ...prev };
        delete copy[matchId];
        return copy;
      });
    } catch (err: any) {
      setMessage(err?.response?.data?.detail || "❌ Failed to update result");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <p className="text-center mt-10 text-lg font-medium text-gray-700">
        Loading matches...
      </p>
    );

  return (
    <div>
      <Header />

      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-6">
        <div className="max-w-3xl mx-auto p-6 bg-white/95 shadow-2xl rounded-2xl">
          <h2 className="text-3xl font-extrabold mb-4 text-center text-green-700">
            ⚽ Match Results
          </h2>

          {message && (
            <div className="mb-4 text-center font-medium text-indigo-700">
              {message}
            </div>
          )}

          {matches.length === 0 ? (
            <p className="text-center text-gray-600">No matches found.</p>
          ) : (
            <div className="space-y-5">
              {matches.map((match) => {
                const entry = scores[match.id];
                const dateText = match.scheduled_time
                  ? new Date(match.scheduled_time).toLocaleString()
                  : "Not scheduled";

                return (
                  <div
                    key={match.id}
                    className="border-2 border-blue-100 p-4 rounded-xl bg-white shadow hover:shadow-lg transition"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-800">
                          🏁 {match.team_1_name}{" "}
                          <span className="text-gray-500">vs</span>{" "}
                          {match.team_2_name}
                        </h3>
                        <p className="text-sm text-gray-500">🗓 {dateText}</p>
                      </div>

                      <button
                        disabled={submitting}
                        onClick={() =>
                          setExpandedId((id) =>
                            id === match.id ? null : match.id
                          )
                        }
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                      >
                        {expandedId === match.id ? "Collapse" : "Update Result"}
                      </button>
                    </div>

                    {expandedId === match.id && (
                      <div className="mt-4 border-t pt-4 space-y-4">
                        {/* Team 1 Score */}
                        <div>
                          <label className="block mb-1 text-sm font-medium text-gray-700">
                            {match.team_1_name} Score
                          </label>
                          <input
                            type="number"
                            min={0}
                            disabled={submitting}
                            value={entry?.team_1_score ?? ""}
                            onChange={(e) =>
                              updateScoreEntry(match.id, {
                                team_1_score: Number(e.target.value) || 0,
                              })
                            }
                            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                          />
                        </div>

                        {/* Team 2 Score */}
                        <div>
                          <label className="block mb-1 text-sm font-medium text-gray-700">
                            {match.team_2_name} Score
                          </label>
                          <input
                            type="number"
                            min={0}
                            disabled={submitting}
                            value={entry?.team_2_score ?? ""}
                            onChange={(e) =>
                              updateScoreEntry(match.id, {
                                team_2_score: Number(e.target.value) || 0,
                              })
                            }
                            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                          />
                        </div>

                        {/* Submit */}
                        <button
                          disabled={submitting}
                          onClick={() => handleSubmit(match.id)}
                          className={`w-full py-2 rounded-md text-lg font-bold transition ${
                            submitting
                              ? "bg-gray-400 cursor-not-allowed text-white"
                              : "bg-green-600 hover:bg-green-700 text-white"
                          }`}
                        >
                          {submitting ? "Submitting..." : "Submit Result"}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
