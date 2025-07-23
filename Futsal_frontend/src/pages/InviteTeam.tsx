import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Team {
  id: number;
  name: string;
}

interface Futsal {
  id: number;
  name: string;
}

interface TimeSlot {
  id: number;
  futsal_name: string;
  start_time: string;
  end_time: string;
}

export default function InviteTeam() {
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [futsals, setFutsals] = useState<Futsal[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [selectedFutsal, setSelectedFutsal] = useState<number | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [matchType, setMatchType] = useState("friendly");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    axios
      .get("http://127.0.0.1:8000/api/my-team/", {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => setMyTeam(res.data));

    axios
      .get("http://127.0.0.1:8000/api/other-teams/", {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => setTeams(res.data));

    axios
      .get("http://127.0.0.1:8000/api/futsals/", {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => setFutsals(res.data));
  }, [token]);

  // fetch slots when futsal is selected
  useEffect(() => {
    if (!selectedFutsal || !token) return;

    axios
      .get(`http://127.0.0.1:8000/api/time-slots/?futsal=${selectedFutsal}`, {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => setSlots(res.data))
      .catch(() => setSlots([]));
  }, [selectedFutsal, token]);

  const handleSubmit = async () => {
    if (!myTeam || !selectedTeam || !selectedSlot) {
      setError("All fields are required");
      return;
    }

    const selectedSlotObj = slots.find((s) => s.id === selectedSlot);
    if (!selectedSlotObj) {
      setError("Invalid time slot selected");
      return;
    }

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/team-matches/",
        {
          team_1: myTeam.id,
          team_2: selectedTeam,
          match_type: matchType,
          scheduled_time: selectedSlotObj.start_time,
          time_slot: selectedSlot, // send slot ID
        },
        {
          headers: { Authorization: `Token ${token}` },
        }
      );

      navigate("/matches");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err.response?.data);
      setError("Failed to send invitation");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4">Invite a Team</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <label className="block mb-2 font-medium">Select Opponent Team:</label>
      <select
        value={selectedTeam ?? ""}
        onChange={(e) => setSelectedTeam(parseInt(e.target.value))}
        className="w-full mb-4 border p-2 rounded"
      >
        <option value="" disabled>
          Select a team
        </option>
        {teams.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </select>

      <label className="block mb-2 font-medium">Select Futsal Venue:</label>
      <select
        value={selectedFutsal ?? ""}
        onChange={(e) => {
          setSelectedFutsal(parseInt(e.target.value));
          setSelectedSlot(null); // reset slot
        }}
        className="w-full mb-4 border p-2 rounded"
      >
        <option value="" disabled>
          Select futsal
        </option>
        {futsals.map((futsal) => (
          <option key={futsal.id} value={futsal.id}>
            {futsal.name}
          </option>
        ))}
      </select>

      <label className="block mb-2 font-medium">Select Time Slot:</label>
      <select
        value={selectedSlot ?? ""}
        onChange={(e) => setSelectedSlot(parseInt(e.target.value))}
        className="w-full mb-4 border p-2 rounded"
        disabled={!slots.length}
      >
        <option value="" disabled>
          {slots.length === 0 ? "No available slots" : "Select time slot"}
        </option>
        {slots.map((slot) => (
          <option key={slot.id} value={slot.id}>
            {new Date(slot.start_time).toLocaleString()} -{" "}
            {new Date(slot.end_time).toLocaleTimeString()} @ {slot.futsal_name}
          </option>
        ))}
      </select>

      <label className="block mb-2 font-medium">Match Type:</label>
      <select
        value={matchType}
        onChange={(e) => setMatchType(e.target.value)}
        className="w-full mb-4 border p-2 rounded"
      >
        <option value="friendly">Friendly</option>
        <option value="competitive">Competitive</option>
      </select>

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700"
      >
        Send Invitation
      </button>
    </div>
  );
}
