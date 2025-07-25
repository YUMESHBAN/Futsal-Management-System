import { useEffect, useState } from "react";
import axios from "axios";

interface Match {
  id: number;
  team_1_name: string;
  team_2_name: string;
  scheduled_time: string;
  team_1_score: number | null;
  team_2_score: number | null;
  result_updated: boolean;
}

export default function MatchResults() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<{
    [key: number]: { team_1_score: number; team_2_score: number };
  }>({});
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/team-matches/", {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => setMatches(res.data))
      .catch(() => setMatches([]))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async (matchId: number) => {
    const { team_1_score, team_2_score } = scores[matchId] || {};

    if (team_1_score == null || team_2_score == null) {
      setMessage("Both scores are required");
      return;
    }

    try {
      await axios.post(
        `http://127.0.0.1:8000/api/team-matches/${matchId}/update-result/`,
        { team_1_score, team_2_score },
        { headers: { Authorization: `Token ${token}` } }
      );
      setMessage("Result updated successfully");
      setExpandedId(null);
      setScores((prev) => {
        return { ...prev, [matchId]: {} };
      });
      setMatches((prev) =>
        prev.map((m) =>
          m.id === matchId
            ? { ...m, result_updated: true, team_1_score, team_2_score }
            : m
        )
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setMessage("Failed to update result");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading matches...</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Match Results (Friendly)
      </h2>

      {message && <p className="text-center text-blue-600 mb-4">{message}</p>}

      {matches.length === 0 ? (
        <p className="text-gray-600 text-center">No matches found.</p>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <div
              key={match.id}
              className="border p-4 rounded shadow-sm bg-gray-50 hover:bg-gray-100 transition"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">
                    {match.team_1_name} vs {match.team_2_name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {new Date(match.scheduled_time).toLocaleString()}
                  </p>
                  {match.result_updated && (
                    <p className="text-sm text-green-600 font-medium mt-1">
                      Result: {match.team_1_score} - {match.team_2_score}
                    </p>
                  )}
                </div>
                {!match.result_updated && (
                  <button
                    onClick={() =>
                      setExpandedId(expandedId === match.id ? null : match.id)
                    }
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {expandedId === match.id ? "Collapse" : "Update Result"}
                  </button>
                )}
              </div>

              {expandedId === match.id && !match.result_updated && (
                <div className="mt-4 border-t pt-4">
                  <label className="block mb-2 text-sm">
                    {match.team_1_name} Score
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={scores[match.id]?.team_1_score ?? ""}
                    onChange={(e) =>
                      setScores((prev) => ({
                        ...prev,
                        [match.id]: {
                          ...prev[match.id],
                          team_1_score: parseInt(e.target.value) || 0,
                        },
                      }))
                    }
                    className="w-full mb-4 p-2 border rounded"
                  />

                  <label className="block mb-2 text-sm">
                    {match.team_2_name} Score
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={scores[match.id]?.team_2_score ?? ""}
                    onChange={(e) =>
                      setScores((prev) => ({
                        ...prev,
                        [match.id]: {
                          ...prev[match.id],
                          team_2_score: parseInt(e.target.value) || 0,
                        },
                      }))
                    }
                    className="w-full mb-4 p-2 border rounded"
                  />

                  <button
                    onClick={() => handleSubmit(match.id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Submit Result
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
