import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import Footer from "../../components/FooterIN";
import Header from "../../components/header";

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
  const location = useLocation();
  const token = localStorage.getItem("token");

  // Get preselected futsal ID from query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const preselectedFutsal = params.get("futsal");
    if (preselectedFutsal) {
      setSelectedFutsal(parseInt(preselectedFutsal));
    }
  }, [location]);

  useEffect(() => {
    if (!token) return;

    // Fetch user team
    axios
      .get("http://127.0.0.1:8000/api/my-team/", {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => setMyTeam(res.data));

    // Fetch other teams
    axios
      .get("http://127.0.0.1:8000/api/other-teams/", {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => setTeams(res.data));

    // Fetch futsals
    axios
      .get("http://127.0.0.1:8000/api/futsals/", {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => setFutsals(res.data));
  }, [token]);

  // Fetch slots when a futsal is selected (either preselected or manual)
  useEffect(() => {
    if (selectedFutsal) {
      fetchSlots(selectedFutsal);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFutsal]);

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
          scheduled_time: selectedSlot.start_time,
        },
        {
          headers: { Authorization: `Token ${token}` },
        }
      );
      navigate("/matches");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err.response?.data);
      setError(err.response?.data?.detail || "Failed to send invitation");
    }
  };
  return (
    <div>
      <Header />
      <div className=" bg-gradient-to-br from-green-50 to-green-100 p-8">
        <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-2xl m-5">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
            📩 Invite a Team
          </h1>

          {error && (
            <div className="text-red-500 bg-red-50 border border-red-200 px-4 py-2 rounded mb-4">
              {error}
            </div>
          )}

          <div className="space-y-5">
            {/* Opponent Team */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                🏆 Opponent Team
              </label>
              <select
                value={selectedTeam ?? ""}
                onChange={(e) => setSelectedTeam(parseInt(e.target.value))}
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-400 outline-none"
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
            </div>

            {/* Futsal */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                ⚽ Select Futsal
              </label>
              <select
                value={selectedFutsal ?? ""}
                onChange={(e) => setSelectedFutsal(parseInt(e.target.value))}
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-400 outline-none"
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
            </div>

            {/* Time Slots */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                ⏰ Select Time Slot
              </label>
              {Object.keys(groupedSlots).length === 0 ? (
                <div className="text-gray-500 text-center p-4 bg-gray-50 rounded">
                  No available slots
                </div>
              ) : (
                <div className="space-y-4 max-h-64 overflow-y-auto border rounded-lg p-3">
                  {Object.entries(groupedSlots).map(([date, slotList]) => (
                    <div key={date} className="space-y-2">
                      <h3 className="bg-green-600 text-white px-4 py-2 rounded-md font-medium">
                        {date}
                      </h3>
                      <div className="grid gap-2">
                        {slotList.map((slot) => (
                          <label
                            key={slot.id}
                            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer border transition ${
                              selectedSlotId === slot.id
                                ? "border-green-500 bg-green-50"
                                : "border-gray-200 hover:bg-gray-100"
                            }`}
                          >
                            <span>
                              {new Date(slot.start_time).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}{" "}
                              -{" "}
                              {new Date(slot.end_time).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            <input
                              type="radio"
                              name="slot"
                              value={slot.id}
                              checked={selectedSlotId === slot.id}
                              onChange={() => setSelectedSlotId(slot.id)}
                              className="accent-green-600"
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Match Type */}
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                🎮 Match Type
              </label>
              <select
                value={matchType}
                onChange={(e) => setMatchType(e.target.value)}
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-400 outline-none"
              >
                <option value="friendly">Friendly Match</option>
                <option value="friendly">Loser's Pay</option>
              </select>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg shadow transition"
            >
              🚀 Send Invitation
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
