import { useEffect, useState } from "react";
import axios from "axios";

interface TimeSlot {
  id: number;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  futsal: number;
}

interface GroupedSlots {
  [date: string]: TimeSlot[];
}

export default function ManageSlots() {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [groupedSlots, setGroupedSlots] = useState<GroupedSlots>({});
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [error, setError] = useState("");
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
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(slot);
    });

    // Sort dates in ascending order
    const sortedDates = Object.keys(grouped).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    // Create new sorted object
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
      fetchSlots();
    } catch (err) {
      setError("Failed to delete time slot");
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
      </div>

      {/* Time Slot List */}
      <div>
        <h3 className="text-xl font-semibold mb-2">Existing Slots</h3>

        {Object.keys(groupedSlots).length === 0 ? (
          <p className="text-gray-500">No time slots available</p>
        ) : (
          Object.entries(groupedSlots).map(([date, dateSlots]) => (
            <div key={date} className="mb-6">
              <h4 className="text-lg font-medium mb-2 bg-blue-200 p-2 rounded">
                {new Date(date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h4>
              <ul className="space-y-2">
                {dateSlots.map((slot) => (
                  <li
                    key={slot.id}
                    className="border p-3 rounded flex justify-between items-center hover:bg-gray-50"
                  >
                    <div>
                      <span className="font-medium">
                        {new Date(slot.start_time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>{" "}
                      —{" "}
                      <span className="font-medium">
                        {new Date(slot.end_time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>{" "}
                      |{" "}
                      <span
                        className={
                          slot.is_booked ? "text-red-500" : "text-green-600"
                        }
                      >
                        {slot.is_booked ? "Booked" : "Available"}
                      </span>
                    </div>
                    {!slot.is_booked && (
                      <button
                        onClick={() => deleteSlot(slot.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                      >
                        Delete
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
