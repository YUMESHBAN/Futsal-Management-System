import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Team {
  id: number;
  name: string;
}

interface TimeSlot {
  id: number;
  futsal: number;
  futsal_name: string;
  start_time: string;
  end_time: string;
}

interface GroupedSlots {
  [date: string]: TimeSlot[];
}

export default function InviteTeam() {
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [matchType, setMatchType] = useState("friendly");
  const [futsals, setFutsals] = useState<{ id: number; name: string }[]>([]);
  const [selectedFutsal, setSelectedFutsal] = useState<number | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [groupedSlots, setGroupedSlots] = useState<GroupedSlots>({});
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
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

  const fetchSlots = (futsalId: number) => {
    axios
      .get(`http://127.0.0.1:8000/api/time-slots/?futsal=${futsalId}`, {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => {
        setSlots(res.data);
        const grouped: GroupedSlots = {};
        res.data.forEach((slot: TimeSlot) => {
          const date = new Date(slot.start_time).toLocaleDateString();
          if (!grouped[date]) grouped[date] = [];
          grouped[date].push(slot);
        });
        setGroupedSlots(grouped);
      })
      .catch(() => {
        setSlots([]);
        setGroupedSlots({});
      });
  };

  const handleSubmit = async () => {
    if (!myTeam || !selectedTeam || !selectedSlotId) {
      setError("All fields are required");
      return;
    }

    const selectedSlot = slots.find((slot) => slot.id === selectedSlotId);
    if (!selectedSlot) {
      setError("Selected time slot is invalid.");
      return;
    }

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/team-matches/",
        {
          team_1: myTeam.id,
          team_2: selectedTeam,
          match_type: matchType,
          time_slot: selectedSlotId,
          scheduled_time: selectedSlot.start_time, // ✅ required for backend
        },
        {
          headers: { Authorization: `Token ${token}` },
        }
      );
      navigate("/matches");
    } catch (err: any) {
      console.error(err.response?.data);
      setError(err.response?.data?.detail || "Failed to send invitation");
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

      <label className="block mb-2 font-medium">Select Futsal:</label>
      <select
        value={selectedFutsal ?? ""}
        onChange={(e) => {
          const id = parseInt(e.target.value);
          setSelectedFutsal(id);
          fetchSlots(id);
        }}
        className="w-full mb-4 border p-2 rounded"
      >
        <option value="" disabled>
          Select a futsal
        </option>
        {futsals.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </select>

      <label className="block mb-2 font-medium">Select Time Slot:</label>
      {Object.keys(groupedSlots).length === 0 ? (
        <p className="text-gray-500 mb-4">No available slots</p>
      ) : (
        <div className="space-y-4 max-h-60 overflow-y-auto border p-2 rounded">
          {Object.entries(groupedSlots).map(([date, slotList]) => (
            <div key={date}>
              <h3 className="w-full bg-blue-500 text-white px-4 py-2 rounded ">
                {date}
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {slotList.map((slot) => (
                  <label
                    key={slot.id}
                    className="flex items-center space-x-2 bg-gray-100 p-2 rounded"
                  >
                    <input
                      type="radio"
                      name="slot"
                      value={slot.id}
                      checked={selectedSlotId === slot.id}
                      onChange={() => setSelectedSlotId(slot.id)}
                    />
                    <span>
                      {new Date(slot.start_time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      -{" "}
                      {new Date(slot.end_time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <label className="block mt-4 mb-2 font-medium">Match Type:</label>
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
