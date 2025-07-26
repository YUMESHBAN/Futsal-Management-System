import { useEffect, useState } from "react";
import axios from "axios";

interface TimeSlot {
  id: number;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  futsal_name: string;
  futsal: number;
  team_name?: string;
  user_email?: string;
  match_result?: string;
}
interface Match {
  id: number;
  team_1: number;
  team_2: number;
  team_1_name: string;
  team_2_name: string;
  match_type: string;
  scheduled_time: string;
  accepted: boolean;
  result: string;
  created_at: string;
  time_slot: number;
}

interface GroupedMatches {
  [date: string]: Match[];
}

interface GroupedSlots {
  [date: string]: TimeSlot[];
}

export default function ManageSlots() {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [groupedMatches, setGroupedMatches] = useState<GroupedMatches>({});
  const [groupedSlots, setGroupedSlots] = useState<GroupedSlots>({});
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");

  const fetchSlots = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/time-slots/", {
        headers: { Authorization: `Token ${token}` },
      });
      setSlots(res.data);
      groupSlotsByDate(res.data);
    } catch (err) {
      setError("Failed to load time slots");
    }
  };

  const groupSlotsByDate = (slots: TimeSlot[]) => {
    const grouped: GroupedSlots = {};
    slots.forEach((slot) => {
      const date = new Date(slot.start_time).toLocaleDateString();
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(slot);
    });

    const sortedDates = Object.keys(grouped).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    const sortedGrouped: GroupedSlots = {};
    sortedDates.forEach((date) => {
      sortedGrouped[date] = grouped[date];
    });

    setGroupedSlots(sortedGrouped);
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const createSlot = async () => {
    if (!startTime || !endTime) {
      setError("Both start and end times are required");
      return;
    }

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/time-slots/",
        { start_time: startTime, end_time: endTime },
        { headers: { Authorization: `Token ${token}` } }
      );
      setStartTime("");
      setEndTime("");
      setError("");
      setMessage("Slot created successfully.");
      fetchSlots();
    } catch (err) {
      setError("Failed to create time slot");
    }
  };

  const deleteSlot = async (id: number) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/time-slots/${id}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setMessage("Slot deleted successfully.");
      fetchSlots();
    } catch (err) {
      setError("Failed to delete time slot");
    }
  };

  const terminateBooking = async (id: number) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/time-slots/${id}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setMessage("Slot booking terminated successfully.");
      fetchSlots();
    } catch (err) {
      setError("Failed to terminate booking");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6">Manage Time Slots</h2>
      {/* Create Form */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="text-xl font-semibold mb-2">Create New Slot</h3>
        <div className="flex flex-col md:flex-row gap-2 mb-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="border p-2 w-full rounded"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Time
            </label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="border p-2 w-full rounded"
            />
          </div>
        </div>
        <button
          onClick={createSlot}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Create
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
        {message && <p className="text-green-600 mt-2">{message}</p>}
      </div>
      {/* Time Slot List */}
      <div>
        <h3 className="text-xl font-semibold mb-2">Existing Slots</h3>

        {Object.keys(groupedSlots).length === 0 ? (
          <p className="text-gray-500">No time slots available</p>
        ) : (
          Object.entries(groupedSlots).map(([date, slots]) => (
            <div key={date} className="mb-6">
              <h4 className="text-lg font-medium mb-2 bg-blue-200 p-2 rounded">
                {new Date(date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h4>
              <ul className="space-y-3">
                {slots.map((slot) => {
                  <p className="text-sm text-gray-600 mt-1">
                    {slot.futsal_name}
                  </p>;
                  const isCompleted =
                    slot.match_result && slot.match_result !== "pending";

                  return (
                    <div
                      key={slot.id}
                      className={`p-4 rounded-lg border ${
                        isCompleted
                          ? "bg-gray-50 border-gray-200"
                          : slot.is_booked
                          ? "bg-red-50 border-red-200"
                          : "bg-green-50 border-green-200 hover:shadow-md transition-shadow"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            {new Date(slot.start_time).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            -{" "}
                            {new Date(slot.end_time).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {slot.futsal_name}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            isCompleted
                              ? "bg-gray-100 text-gray-600"
                              : slot.is_booked
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {isCompleted
                            ? "Completed"
                            : slot.is_booked
                            ? "Booked"
                            : "Available"}
                        </span>
                      </div>

                      <div className="flex space-x-2 items-center mt-3">
                        {slot.is_booked ? (
                          <>
                            {slot.match_result === "pending" ? (
                              <>
                                <button
                                  onClick={() => terminateBooking(slot.id)}
                                  className="px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-1"
                                >
                                  Cancel Booking
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => deleteSlot(slot.id)}
                                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1"
                                >
                                  Finish Match
                                </button>
                              </>
                            )}
                          </>
                        ) : (
                          <button
                            onClick={() => deleteSlot(slot.id)}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-1"
                          >
                            Delete Slot
                          </button>
                        )}
                      </div>

                      {slot.is_booked && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Booked By:</span>{" "}
                            {slot.team_name || "N/A"}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">Email:</span>{" "}
                            {slot.user_email || "N/A"}
                          </p>
                        </div>
                      )}
                      {isCompleted && <div>Hello</div>}
                    </div>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
