import { useEffect, useState } from "react";
import axios from "axios";
import Footer from "../../components/FooterIN";
import Header from "../../components/header";
import stadium from "../../assets/futsalstadium.jpg";

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
    <div>
      <Header />
      <div
        className="min-h-screen bg-cover bg-center flex items-center justify-center p-6"
        style={{ backgroundImage: `url(${stadium})` }}
      >
        <div className="max-w-5xl w-full bg-gradient-to-br from-green-900/90 to-black/90 text-white rounded-2xl shadow-2xl p-8 space-y-10 backdrop-blur-sm">
          <h1 className="text-4xl font-extrabold text-center uppercase tracking-wide">
            🏆 Competitive Match Center
          </h1>

          {/* Sent Invitations */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">📤 Sent Invitations</h2>
            {sentInvites.length === 0 ? (
              <p className="text-gray-400">No sent invitations.</p>
            ) : (
              <ul className="space-y-3">
                {sentInvites.map((m) => (
                  <li
                    key={m.id}
                    className="bg-yellow-500/20 border border-yellow-600 p-4 rounded-xl shadow-lg"
                  >
                    You invited{" "}
                    <span className="font-bold text-yellow-300">
                      {m.team_2_name}
                    </span>{" "}
                    for a competitive match.
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Received Invitations */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              📥 Received Invitations
            </h2>
            {receivedInvites.length === 0 ? (
              <p className="text-gray-400">No received invitations.</p>
            ) : (
              <ul className="space-y-3">
                {receivedInvites.map((m) => (
                  <li
                    key={m.id}
                    className="bg-blue-500/20 border border-blue-600 p-5 rounded-xl shadow-lg flex flex-col sm:flex-row justify-between items-center"
                  >
                    <div className="mb-2 sm:mb-0">
                      <b className="text-blue-300">{m.team_1_name}</b> invited
                      you for a competitive match.
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleInvitationResponse(m.id, "accept")}
                        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold text-sm"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleInvitationResponse(m.id, "reject")}
                        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold text-sm"
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
            <h2 className="text-2xl font-semibold mb-4">✅ Accepted Matches</h2>
            {acceptedMatches.length === 0 ? (
              <p className="text-gray-400">No accepted matches.</p>
            ) : (
              <ul className="space-y-4">
                {acceptedMatches.map((m) => (
                  <li
                    key={m.id}
                    className="bg-green-500/20 border border-green-600 p-5 rounded-xl shadow-lg"
                  >
                    <div className="mb-2 font-semibold">
                      <span className="text-green-300">{m.team_1_name}</span> vs{" "}
                      <span className="text-green-300">{m.team_2_name}</span> —{" "}
                      <span className="capitalize">{m.status}</span>
                    </div>

                    {/* Scheduled info */}
                    {m.status === "scheduled" || m.status === "completed" ? (
                      <div className="text-sm text-gray-300 mt-1 space-y-1">
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

                    {/* Scheduling form */}
                    {schedulingMatchId === m.id ? (
                      <div className="mt-3 flex flex-col sm:flex-row items-center gap-3">
                        <input
                          type="date"
                          value={scheduleDate}
                          onChange={(e) => setScheduleDate(e.target.value)}
                          className="border border-gray-500 rounded px-3 py-2 text-black"
                        />
                        <button
                          onClick={() => handleScheduleSubmit(m.id)}
                          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold text-sm"
                        >
                          Submit
                        </button>
                        <button
                          onClick={() => setSchedulingMatchId(null)}
                          className="text-sm text-gray-400 hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      m.status === "confirmed" && (
                        <button
                          onClick={() => setSchedulingMatchId(m.id)}
                          className="mt-3 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg font-semibold text-sm"
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
            <h2 className="text-2xl font-semibold mb-4">❌ Rejected Matches</h2>
            {rejectedMatches.length === 0 ? (
              <p className="text-gray-400">No rejected matches.</p>
            ) : (
              <ul className="space-y-3">
                {rejectedMatches.map((m) => (
                  <li
                    key={m.id}
                    className="bg-red-500/20 border border-red-600 p-4 rounded-xl shadow-lg"
                  >
                    {m.team_1_name} vs {m.team_2_name} — Request Rejected
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
