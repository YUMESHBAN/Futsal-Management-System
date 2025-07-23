import { useEffect, useState } from "react";
import axios from "axios";

interface TimeSlot {
  id: number;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  futsal: number;
}

export default function ManageSlots() {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Failed to load time slots");
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const createSlot = async () => {
    try {
      await axios.post(
        "http://127.0.0.1:8000/api/time-slots/",
        { start_time: startTime, end_time: endTime },
        { headers: { Authorization: `Token ${token}` } }
      );
      setStartTime("");
      setEndTime("");
      fetchSlots(); // refresh list
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Failed to create time slot");
    }
  };

  const deleteSlot = async (id: number) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/time-slots/${id}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      fetchSlots(); // refresh
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        <input
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="border p-2 mr-2"
        />
        <input
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="border p-2 mr-2"
        />
        <button
          onClick={createSlot}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Create
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      {/* Time Slot List */}
      <div>
        <h3 className="text-xl font-semibold mb-2">Existing Slots</h3>
        <ul className="space-y-2">
          {slots.map((slot) => (
            <li
              key={slot.id}
              className="border p-3 rounded flex justify-between items-center"
            >
              <div>
                <b>{new Date(slot.start_time).toLocaleString()}</b> —{" "}
                {new Date(slot.end_time).toLocaleString()} |{" "}
                <span
                  className={slot.is_booked ? "text-red-500" : "text-green-600"}
                >
                  {slot.is_booked ? "Booked" : "Available"}
                </span>
              </div>
              {!slot.is_booked && (
                <button
                  onClick={() => deleteSlot(slot.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
