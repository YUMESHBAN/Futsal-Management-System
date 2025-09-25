import { useEffect, useState } from "react";
import axios from "axios";

interface TimeSlot {
  id: number;
  futsal: number;
  futsal_name: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
}

export default function TimeSlotManagement() {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedFutsal, setSelectedFutsal] = useState<number | null>(null);
  const [futsals, setFutsals] = useState<{ id: number; name: string }[]>([]);
  const [editingSlotId, setEditingSlotId] = useState<number | null>(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    // Fetch futsals owned by this owner
    axios
      .get("http://127.0.0.1:8000/api/my-futsals/", {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => setFutsals(res.data))
      .catch(() => setError("Failed to load futsals"));

    // Fetch time slots owned by this owner
    axios
      .get("http://127.0.0.1:8000/api/time-slots/", {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => setTimeSlots(res.data))
      .catch(() => setError("Failed to load time slots"))
      .finally(() => setLoading(false));
  }, [token]);

  // Handle create or update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedFutsal || !startTime || !endTime) {
      setError("Please fill all fields.");
      return;
    }

    const payload = {
      futsal: selectedFutsal,
      start_time: startTime,
      end_time: endTime,
    };

    try {
      if (editingSlotId) {
        // Update
        await axios.put(
          `http://127.0.0.1:8000/api/time-slots/${editingSlotId}/`,
          payload,
          { headers: { Authorization: `Token ${token}` } }
        );
        setEditingSlotId(null);
      } else {
        // Create
        await axios.post("http://127.0.0.1:8000/api/time-slots/", payload, {
          headers: { Authorization: `Token ${token}` },
        });
      }
      // Refresh list
      const res = await axios.get("http://127.0.0.1:8000/api/time-slots/", {
        headers: { Authorization: `Token ${token}` },
      });
      setTimeSlots(res.data);
      setStartTime("");
      setEndTime("");
      setSelectedFutsal(null);
    } catch {
      setError("Failed to save time slot.");
    }
  };

  // Delete a slot
  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this time slot?")) return;

    try {
      await axios.delete(`http://127.0.0.1:8000/api/time-slots/${id}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setTimeSlots(timeSlots.filter((slot) => slot.id !== id));
    } catch {
      setError("Failed to delete time slot.");
    }
  };

  // Start editing a slot
  const startEditing = (slot: TimeSlot) => {
    setEditingSlotId(slot.id);
    setSelectedFutsal(slot.futsal);
    setStartTime(slot.start_time.slice(0, 16)); // Format for datetime-local input
    setEndTime(slot.end_time.slice(0, 16));
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Manage Time Slots</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div>
          <label className="block mb-1 font-semibold">Select Futsal</label>
          <select
            className="w-full border px-3 py-2 rounded"
            value={selectedFutsal ?? ""}
            onChange={(e) => setSelectedFutsal(Number(e.target.value))}
            required
          >
            <option value="" disabled>
              -- Select Futsal --
            </option>
            {futsals.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-semibold">Start Time</label>
          <input
            type="datetime-local"
            className="w-full border px-3 py-2 rounded"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">End Time</label>
          <input
            type="datetime-local"
            className="w-full border px-3 py-2 rounded"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {editingSlotId ? "Update Time Slot" : "Add Time Slot"}
        </button>
      </form>

      <h2 className="text-xl font-semibold mb-4">Existing Time Slots</h2>
      {timeSlots.length === 0 ? (
        <p>No time slots found.</p>
      ) : (
        <ul className="space-y-2">
          {timeSlots.map((slot) => (
            <li
              key={slot.id}
              className={`p-4 border rounded flex justify-between items-center ${
                slot.is_booked ? "bg-red-100" : "bg-green-100"
              }`}
            >
              <div>
                <p className="font-semibold">
                  {slot.futsal_name} —{" "}
                  {new Date(slot.start_time).toLocaleString()} to{" "}
                  {new Date(slot.end_time).toLocaleString()}
                </p>
                <p>
                  Status:{" "}
                  {slot.is_booked ? (
                    <span className="text-red-600 font-bold">Booked</span>
                  ) : (
                    <span className="text-green-600 font-bold">Available</span>
                  )}
                </p>
              </div>

              <div className="space-x-2">
                {!slot.is_booked && (
                  <>
                    <button
                      onClick={() => startEditing(slot)}
                      className="bg-yellow-400 px-3 py-1 rounded hover:bg-yellow-500"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(slot.id)}
                      className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 text-white"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
