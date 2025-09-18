import { useEffect, useState } from "react";
import axios from "axios";
import Footer from "../../components/FooterIN";
import Header from "../../components/header";

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
    <div>
      <Header />
      <div className="max-w-4xl mx-auto mt-10 space-y-10 m-10">
        <h1 className="text-3xl font-bold text-center text-green-700">
          ⚽ Match Center
        </h1>

        {/* Sent Invites */}
        <section>
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            📤 Sent Invitations
          </h2>
          {sentInvites.length === 0 ? (
            <p className="text-gray-600">No sent invitations.</p>
          ) : (
            <ul className="space-y-3">
              {sentInvites.map((m) => (
                <li
                  key={m.id}
                  className="bg-green-50 border border-green-200 p-4 rounded-lg shadow-sm text-gray-800"
                >
                  You invited <b>{m.team_2_name}</b> for a{" "}
                  <span className="text-green-700 font-medium">
                    {m.match_type}
                  </span>{" "}
                  match on {new Date(m.scheduled_time).toLocaleString()}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Received Invites */}
        <section>
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            📥 Received Invitations
          </h2>
          {receivedInvites.length === 0 ? (
            <p className="text-gray-600">No received invitations.</p>
          ) : (
            <ul className="space-y-3">
              {receivedInvites.map((m) => (
                <li
                  key={m.id}
                  className="bg-white border border-green-200 p-4 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center"
                >
                  <div className="mb-2 sm:mb-0 text-gray-800">
                    <b className="text-green-700">{m.team_1_name}</b> invited
                    you for a{" "}
                    <span className="font-medium text-green-700">
                      {m.match_type}
                    </span>{" "}
                    match on {new Date(m.scheduled_time).toLocaleString()}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleInvitationResponse(m.id, "accept")}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm shadow"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleInvitationResponse(m.id, "reject")}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm shadow"
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
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            📜 Match History
          </h2>
          {matchHistory.length === 0 ? (
            <p className="text-gray-600">No matches played yet.</p>
          ) : (
            <ul className="space-y-3">
              {matchHistory.map((m) => (
                <li
                  key={m.id}
                  className={`border p-4 rounded-lg shadow-sm text-gray-800 ${
                    m.accepted
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <span className="font-semibold">{m.team_1_name}</span> vs{" "}
                  <span className="font-semibold">{m.team_2_name}</span> —{" "}
                  <span className="text-green-700">{m.match_type}</span> on{" "}
                  {new Date(m.scheduled_time).toLocaleString()} —{" "}
                  <b className={m.accepted ? "text-green-700" : "text-red-600"}>
                    {m.accepted ? "Accepted" : "Rejected"}
                  </b>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      <Footer />
    </div>
  );
}
