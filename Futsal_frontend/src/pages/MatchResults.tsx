import { useEffect, useState } from "react";
import axios from "axios";

interface Match {
  id: number;
  team_1_name: string;
  team_2_name: string;
  scheduled_time: string;
  result_updated: boolean;
}

export default function MatchResults() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");

  const [scores, setScores] = useState<{
    [key: number]: {
      team_1_score: number;
      team_2_score: number;
      payment_method: "Cash" | "eSewa";
      payment_confirmed: boolean;
    };
  }>({});

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
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
      setMessage("Both scores are required");
      return;
    }

    if (entry.payment_method === "eSewa" && !entry.payment_confirmed) {
      setMessage("Please confirm eSewa payment before submitting result.");
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
          payment_method: entry.payment_method,
        },
        { headers: { Authorization: `Token ${token}` } }
      );

      setMessage(res.data.detail || "Result updated successfully.");
      setExpandedId(null);
      setMatches((prev) => prev.filter((m) => m.id !== matchId));
      setScores((prev) => {
        const copy = { ...prev };
        delete copy[matchId];
        return copy;
      });
    } catch (err: any) {
      console.error(err.response?.data);
      setMessage(err.response?.data?.detail || "Failed to update result");
    } finally {
      setSubmitting(false);
    }
  };

  const sendEsewaEmail = async (matchId: number) => {
    setSubmitting(true);
    setMessage("");
    try {
      await axios.post(
        `http://127.0.0.1:8000/api/team-matches/${matchId}/send-payment-email/`,
        {},
        { headers: { Authorization: `Token ${token}` } }
      );
      setMessage("eSewa payment link sent to player.");
    } catch (err: any) {
      console.error(err.response?.data);
      setMessage(err.response?.data?.detail || "Failed to send email");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmPayment = async (matchId: number) => {
    setSubmitting(true);
    setMessage("");
    try {
      await axios.post(
        `http://127.0.0.1:8000/api/team-matches/${matchId}/confirm-payment/`,
        {},
        { headers: { Authorization: `Token ${token}` } }
      );
      setScores((prev) => ({
        ...prev,
        [matchId]: {
          ...prev[matchId],
          payment_confirmed: true,
        },
      }));
      setMessage("Payment marked as received.");
    } catch (err: any) {
      console.error(err.response?.data);
      setMessage(err.response?.data?.detail || "Failed to confirm payment.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading matches...</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-6 text-center">Match Results</h2>

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
                </div>
                <button
                  disabled={submitting}
                  onClick={() =>
                    setExpandedId(expandedId === match.id ? null : match.id)
                  }
                  className="text-sm text-blue-600 hover:underline"
                >
                  {expandedId === match.id ? "Collapse" : "Update Result"}
                </button>
              </div>

              {expandedId === match.id && (
                <div className="mt-4 border-t pt-4">
                  <label className="block mb-2 text-sm">
                    {match.team_1_name} Score
                  </label>
                  <input
                    type="number"
                    min={0}
                    disabled={submitting}
                    value={scores[match.id]?.team_1_score ?? ""}
                    onChange={(e) =>
                      setScores((prev) => ({
                        ...prev,
                        [match.id]: {
                          ...prev[match.id],
                          team_1_score: parseInt(e.target.value) || 0,
                          payment_method:
                            prev[match.id]?.payment_method ?? "Cash",
                          payment_confirmed:
                            prev[match.id]?.payment_confirmed ?? false,
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
                    disabled={submitting}
                    value={scores[match.id]?.team_2_score ?? ""}
                    onChange={(e) =>
                      setScores((prev) => ({
                        ...prev,
                        [match.id]: {
                          ...prev[match.id],
                          team_2_score: parseInt(e.target.value) || 0,
                          payment_method:
                            prev[match.id]?.payment_method ?? "Cash",
                          payment_confirmed:
                            prev[match.id]?.payment_confirmed ?? false,
                        },
                      }))
                    }
                    className="w-full mb-4 p-2 border rounded"
                  />

                  <label className="block mb-2 text-sm">Payment Method</label>
                  <select
                    disabled={submitting}
                    value={scores[match.id]?.payment_method ?? "Cash"}
                    onChange={(e) =>
                      setScores((prev) => ({
                        ...prev,
                        [match.id]: {
                          ...prev[match.id],
                          payment_method: e.target.value as "Cash" | "eSewa",
                          payment_confirmed: false,
                        },
                      }))
                    }
                    className="w-full mb-4 p-2 border rounded"
                  >
                    <option value="Cash">HandCash</option>
                    <option value="eSewa">eSewa</option>
                  </select>

                  {scores[match.id]?.payment_method === "eSewa" && (
                    <div className="mb-4 space-y-2">
                      {!scores[match.id]?.payment_confirmed && (
                        <>
                          <button
                            disabled={submitting}
                            onClick={() => sendEsewaEmail(match.id)}
                            className="px-4 py-2 rounded bg-yellow-500 text-white hover:bg-yellow-600 mr-2"
                          >
                            Send eSewa Payment Link
                          </button>
                          <button
                            disabled={submitting}
                            onClick={() => confirmPayment(match.id)}
                            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                          >
                            Mark Payment as Received
                          </button>
                        </>
                      )}
                      {scores[match.id]?.payment_confirmed && (
                        <p className="text-green-600 font-semibold">
                          Payment Confirmed ✅
                        </p>
                      )}
                    </div>
                  )}

                  <button
                    disabled={
                      submitting ||
                      (scores[match.id]?.payment_method === "eSewa" &&
                        !scores[match.id]?.payment_confirmed)
                    }
                    onClick={() => handleSubmit(match.id)}
                    className={`px-4 py-2 rounded text-white ${
                      submitting
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {submitting ? "Submitting..." : "Submit Result"}
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
