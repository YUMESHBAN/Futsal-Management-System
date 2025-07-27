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
  payment_status?: "pending" | "paid" | null;
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
      payment_sent: boolean; // if payment email sent for eSewa
      payment_received: boolean; // if payment confirmed by owner
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

  // Send payment email to players for eSewa payment
  const sendPaymentEmail = async (matchId: number) => {
    setSubmitting(true);
    setMessage("");
    try {
      await axios.post(
        `http://127.0.0.1:8000/api/team-matches/${matchId}/send-payment-email/`,
        {},
        { headers: { Authorization: `Token ${token}` } }
      );
      setScores((prev) => ({
        ...prev,
        [matchId]: {
          ...prev[matchId],
          payment_sent: true,
        },
      }));
      setMessage("Payment email sent to players.");
    } catch (err: any) {
      setMessage(err.response?.data?.detail || "Failed to send payment email.");
    } finally {
      setSubmitting(false);
    }
  };

  // Owner marks the payment as received (payment_status = "paid")
  const markPaymentReceived = async (matchId: number) => {
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
          payment_received: true,
        },
      }));
      setMessage("Payment marked as received.");
    } catch (err: any) {
      setMessage(err.response?.data?.detail || "Failed to confirm payment.");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit match result (only enabled if payment received for eSewa)
  const handleSubmit = async (matchId: number) => {
    const entry = scores[matchId];
    if (!entry || entry.team_1_score == null || entry.team_2_score == null) {
      setMessage("Both scores are required");
      return;
    }

    if (entry.payment_method === "eSewa" && !entry.payment_received) {
      setMessage("Please confirm payment received before submitting result.");
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
      setMessage(err.response?.data?.detail || "Failed to update result");
    } finally {
      setSubmitting(false);
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
          {matches.map((match) => {
            const scoreEntry = scores[match.id] || {
              team_1_score: match.team_1_score ?? 0,
              team_2_score: match.team_2_score ?? 0,
              payment_method: "Cash",
              payment_sent: false,
              payment_received: match.payment_status === "paid",
            };

            return (
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
                    <p className="text-xs text-gray-500">
                      Payment status:{" "}
                      {match.payment_status ? match.payment_status : "None"}
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
                      value={scoreEntry.team_1_score}
                      onChange={(e) =>
                        setScores((prev) => ({
                          ...prev,
                          [match.id]: {
                            ...prev[match.id],
                            team_1_score: parseInt(e.target.value) || 0,
                            payment_method: scoreEntry.payment_method,
                            payment_sent: scoreEntry.payment_sent,
                            payment_received: scoreEntry.payment_received,
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
                      value={scoreEntry.team_2_score}
                      onChange={(e) =>
                        setScores((prev) => ({
                          ...prev,
                          [match.id]: {
                            ...prev[match.id],
                            team_2_score: parseInt(e.target.value) || 0,
                            payment_method: scoreEntry.payment_method,
                            payment_sent: scoreEntry.payment_sent,
                            payment_received: scoreEntry.payment_received,
                          },
                        }))
                      }
                      className="w-full mb-4 p-2 border rounded"
                    />

                    <label className="block mb-2 text-sm">Payment Method</label>
                    <select
                      disabled={submitting}
                      value={scoreEntry.payment_method}
                      onChange={(e) =>
                        setScores((prev) => ({
                          ...prev,
                          [match.id]: {
                            ...prev[match.id],
                            payment_method: e.target.value as "Cash" | "eSewa",
                            payment_sent: false,
                            payment_received: false,
                            team_1_score: scoreEntry.team_1_score,
                            team_2_score: scoreEntry.team_2_score,
                          },
                        }))
                      }
                      className="w-full mb-4 p-2 border rounded"
                    >
                      <option value="Cash">HandCash</option>
                      <option value="eSewa">eSewa</option>
                    </select>

                    {scoreEntry.payment_method === "eSewa" && (
                      <>
                        <button
                          disabled={submitting || scoreEntry.payment_sent}
                          onClick={() => sendPaymentEmail(match.id)}
                          className={`mr-2 px-4 py-2 rounded text-white ${
                            scoreEntry.payment_sent
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-green-600 hover:bg-green-700"
                          }`}
                        >
                          {scoreEntry.payment_sent
                            ? "Email Sent"
                            : "Send Payment Email"}
                        </button>

                        <button
                          disabled={
                            submitting ||
                            !scoreEntry.payment_sent ||
                            scoreEntry.payment_received
                          }
                          onClick={() => markPaymentReceived(match.id)}
                          className={`px-4 py-2 rounded text-white ${
                            scoreEntry.payment_received
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-700"
                          }`}
                        >
                          {scoreEntry.payment_received
                            ? "Payment Received"
                            : "Mark Payment Received"}
                        </button>
                      </>
                    )}

                    <button
                      disabled={
                        submitting ||
                        (scoreEntry.payment_method === "eSewa" &&
                          !scoreEntry.payment_received)
                      }
                      onClick={() => handleSubmit(match.id)}
                      className={`mt-4 px-4 py-2 rounded text-white ${
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
            );
          })}
        </div>
      )}
    </div>
  );
}
