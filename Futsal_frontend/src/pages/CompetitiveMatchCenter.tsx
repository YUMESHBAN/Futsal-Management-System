import { useEffect, useState } from "react";
import axios from "axios";

interface CompetitiveMatch {
  id: number;
  team_1: number;
  team_1_name: string;
  team_2: number;
  team_2_name: string;
  match_type: string;
  futsal_name?: string | null;
  scheduled_time: string | null;
  status: string;
  accepted: boolean | null;
  created_at: string;
}

export default function CompetitiveCenter() {
  const [matches, setMatches] = useState<CompetitiveMatch[]>([]);
  const [myTeamId, setMyTeamId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const [schedulingMatchId, setSchedulingMatchId] = useState<number | null>(
    null
  );
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleResult, setScheduleResult] = useState<{
    [matchId: number]: { date: string; futsal: string };
  }>({});

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    axios
      .get("http://127.0.0.1:8000/api/my-team/", {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => setMyTeamId(res.data.id))
      .catch(() => setError("Failed to load team info"));

    axios
      .get("http://127.0.0.1:8000/api/competitive/matches/", {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => setMatches(res.data))
      .catch(() => setError("Failed to load competitive matches"));
  }, [token]);

  const refreshMatches = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/api/competitive/matches/",
        {
          headers: { Authorization: `Token ${token}` },
        }
      );
      setMatches(res.data);
    } catch {
      setError("Failed to refresh matches.");
    }
  };

  const handleInvitationResponse = async (
    matchId: number,
    decision: "accept" | "reject"
  ) => {
    try {
      await axios.post(
        `http://127.0.0.1:8000/api/competitive/respond/${matchId}/`,
        { decision },
        { headers: { Authorization: `Token ${token}` } }
      );
      refreshMatches();
    } catch {
      alert(`Failed to ${decision} the match request.`);
    }
  };

  const handleScheduleSubmit = async (matchId: number) => {
    if (!scheduleDate) {
      alert("Please select a date.");
      return;
    }

    try {
      const res = await axios.post(
        `http://127.0.0.1:8000/api/competitive/schedule/${matchId}/`,
        { scheduled_date: scheduleDate },
        {
          headers: { Authorization: `Token ${token}` },
        }
      );

      setScheduleResult((prev) => ({
        ...prev,
        [matchId]: {
          date: res.data.date,
          futsal: res.data.futsal,
        },
      }));

      setSchedulingMatchId(null);
      setScheduleDate("");
      refreshMatches();
    } catch (err: any) {
      const msg = err.response?.data?.error || "Failed to schedule match.";
      alert(msg);
    }
  };

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
  const acceptedMatches = matches.filter(
    (m) =>
      m.accepted === true && (m.team_1 === myTeamId || m.team_2 === myTeamId)
  );
  const rejectedMatches = matches.filter(
    (m) =>
      m.accepted === false && (m.team_1 === myTeamId || m.team_2 === myTeamId)
  );

  return (
    <div className="max-w-4xl mx-auto mt-10 space-y-8">
      <h1 className="text-3xl font-bold text-center text-gray-800">
        Competitive Match Center
      </h1>

      {/* Sent Invitations */}
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
                You invited <b>{m.team_2_name}</b> for a competitive match.
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Received Invitations */}
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
                  <b>{m.team_1_name}</b> invited you for a competitive match.
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

      {/* Accepted Matches */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Accepted Matches</h2>
        {acceptedMatches.length === 0 ? (
          <p className="text-gray-600">No accepted matches.</p>
        ) : (
          <ul className="space-y-4">
            {acceptedMatches.map((m) => (
              <li
                key={m.id}
                className="border p-3 rounded shadow-sm bg-green-100 text-gray-800"
              >
                <div className="mb-2">
                  <b>{m.team_1_name}</b> vs <b>{m.team_2_name}</b> — Status:{" "}
                  <span className="capitalize">{m.status}</span>
                </div>

                {/* Show response from scheduling if available */}
                {/* Show scheduled date and futsal even after reload */}
                {m.status === "scheduled" || m.status === "completed" ? (
                  <div className="text-sm text-gray-700 mt-1">
                    {m.scheduled_time && (
                      <p>
                        📅 Date: <b>{m.scheduled_time}</b>
                      </p>
                    )}
                    {m.futsal_name && (
                      <p>
                        🏟️ Futsal: <b>{m.futsal_name}</b>
                      </p>
                    )}
                  </div>
                ) : null}

                {/* Schedule form */}
                {schedulingMatchId === m.id ? (
                  <div className="mt-2 flex flex-col sm:flex-row items-center gap-2">
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="border rounded px-3 py-1"
                    />
                    <button
                      onClick={() => handleScheduleSubmit(m.id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Submit
                    </button>
                    <button
                      onClick={() => setSchedulingMatchId(null)}
                      className="text-sm text-gray-600 hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  m.status === "confirmed" && (
                    <button
                      onClick={() => setSchedulingMatchId(m.id)}
                      className="mt-2 bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Schedule Match
                    </button>
                  )
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Rejected Matches */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Rejected Matches</h2>
        {rejectedMatches.length === 0 ? (
          <p className="text-gray-600">No rejected matches.</p>
        ) : (
          <ul className="space-y-2">
            {rejectedMatches.map((m) => (
              <li
                key={m.id}
                className="border p-3 rounded shadow-sm bg-red-100 text-gray-800"
              >
                {m.team_1_name} vs {m.team_2_name} — Request Rejected
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
