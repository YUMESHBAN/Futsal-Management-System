import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Team {
  id: number;
  name: string;
}

export default function InviteTeam() {
  const [otherTeams, setOtherTeams] = useState<Team[]>([]);
  const [myTeamId, setMyTeamId] = useState<number | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [matchType, setMatchType] = useState("friendly");
  const [scheduledTime, setScheduledTime] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    // Get current user's team
    axios
      .get("http://127.0.0.1:8000/api/my-team/", {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => setMyTeamId(res.data.id))
      .catch(() => setError("Please create your team first."));

    // Get other teams
    axios
      .get("http://127.0.0.1:8000/api/other-teams/", {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => setOtherTeams(res.data))
      .catch(() => setError("Failed to load other teams."));
  }, [navigate, token]);

  const handleInvite = () => {
    if (!myTeamId || !selectedTeamId || !scheduledTime) {
      setError("Please fill all fields.");
      return;
    }

    axios
      .post(
        "http://127.0.0.1:8000/api/team-matches/",
        {
          team_1: myTeamId,
          team_2: selectedTeamId,
          match_type: matchType,
          scheduled_time: scheduledTime,
        },
        {
          headers: { Authorization: `Token ${token}` },
        }
      )
      .then(() => {
        setSuccess("Match invitation sent successfully!");
        setError("");
        setSelectedTeamId(null);
        setScheduledTime("");
      })
      .catch(() => setError("Failed to send invitation."));
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
        Invite a Team for Match
      </h2>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {success && <p className="text-green-600 text-center mb-4">{success}</p>}

      <div className="mb-4">
        <label className="block mb-1 font-medium">Select Opponent Team</label>
        <select
          value={selectedTeamId ?? ""}
          onChange={(e) => setSelectedTeamId(Number(e.target.value))}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">-- Choose a team --</option>
          {otherTeams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Match Type</label>
        <select
          value={matchType}
          onChange={(e) => setMatchType(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="friendly">Friendly</option>
          <option value="competitive">Competitive</option>
        </select>
      </div>

      <div className="mb-6">
        <label className="block mb-1 font-medium">Scheduled Date & Time</label>
        <input
          type="datetime-local"
          value={scheduledTime}
          onChange={(e) => setScheduledTime(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <button
        onClick={handleInvite}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Send Invitation
      </button>
    </div>
  );
}
