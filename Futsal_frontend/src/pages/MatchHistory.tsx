import { useEffect, useState } from "react";
import axios from "axios";

interface Match {
  id: number;
  team_1: number;
  team_1_name: string;
  team_2: number;
  team_2_name: string;
  match_type: string;
  scheduled_time: string;
  accepted: boolean | null;
  created_at: string;
}

export default function MatchHistory() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [myTeamId, setMyTeamId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    // Fetch current user's team ID
    axios
      .get("http://127.0.0.1:8000/api/my-team/", {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => setMyTeamId(res.data.id))
      .catch(() => setError("Failed to load team info"));

    // Fetch matches
    axios
      .get("http://127.0.0.1:8000/api/team-matches/", {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => setMatches(res.data))
      .catch(() => setError("Failed to load match data"));
  }, [token]);

  if (error)
    return <div className="text-red-500 text-center mt-10">{error}</div>;

  if (myTeamId === null)
    return <div className="text-center mt-10">Loading...</div>;

  const sentInvites = matches.filter(
    (m) => m.accepted === null && m.team_1 === myTeamId
  );
  const receivedInvites = matches.filter(
    (m) => m.accepted === null && m.team_2 === myTeamId
  );

  const handleInvitationResponse = async (
    matchId: number,
    action: "accept" | "reject"
  ) => {
    try {
      const endpoint = `http://127.0.0.1:8000/api/team-matches/${matchId}/${action}/`;
      await axios.post(
        endpoint,
        {},
        {
          headers: { Authorization: `Token ${token}` },
        }
      );

      // Refresh matches after action
      const res = await axios.get("http://127.0.0.1:8000/api/team-matches/", {
        headers: { Authorization: `Token ${token}` },
      });
      setMatches(res.data);
    } catch (err) {
      console.error(`Failed to ${action} match:`, err);
      alert(`Failed to ${action} match invitation.`);
    }
  };

  const matchHistory = matches.filter((m) => m.accepted !== null);

  return (
    <div className="max-w-4xl mx-auto mt-10 space-y-8">
      <h1 className="text-3xl font-bold text-center text-gray-800">
        Match Center
      </h1>

      {/* Sent Invites */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Sent Invitations</h2>
        {sentInvites.length === 0 ? (
          <p className="text-gray-600">No sent invitations.</p>
        ) : (
          <ul className="space-y-2">
            {sentInvites.map((m) => (
              <li
                key={m.id}
                className="bg-yellow-100 border p-3 rounded shadow-sm text-gray-800"
              >
                You invited <b>{m.team_2_name}</b> for a {m.match_type} match on{" "}
                {new Date(m.scheduled_time).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Received Invites */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Received Invitations</h2>
        {receivedInvites.length === 0 ? (
          <p className="text-gray-600">No received invitations.</p>
        ) : (
          <ul className="space-y-2">
            {receivedInvites.map((m) => (
              <li
                key={m.id}
                className="bg-blue-100 border p-4 rounded shadow-sm text-gray-800 flex flex-col sm:flex-row justify-between items-center"
              >
                <div className="mb-2 sm:mb-0">
                  <b>{m.team_1_name}</b> invited you for a {m.match_type} match
                  on {new Date(m.scheduled_time).toLocaleString()}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleInvitationResponse(m.id, "accept")}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleInvitationResponse(m.id, "reject")}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Match History */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Match History</h2>
        {matchHistory.length === 0 ? (
          <p className="text-gray-600">No matches played yet.</p>
        ) : (
          <ul className="space-y-2">
            {matchHistory.map((m) => (
              <li
                key={m.id}
                className={`border p-3 rounded shadow-sm ${
                  m.accepted ? "bg-green-100" : "bg-red-100"
                } text-gray-800`}
              >
                {m.team_1_name} vs {m.team_2_name} — {m.match_type} on{" "}
                {new Date(m.scheduled_time).toLocaleString()} —{" "}
                <b>{m.accepted ? "Accepted" : "Rejected"}</b>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
