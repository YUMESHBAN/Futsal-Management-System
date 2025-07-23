import { useEffect, useState } from "react";
import axios from "axios";

interface Futsal {
  id: number;
  name: string;
}

export default function AutoSlotGenerator() {
  const [futsals, setFutsals] = useState<Futsal[]>([]);
  const [selectedFutsalId, setSelectedFutsalId] = useState<number | null>(null);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    axios
      .get("http://127.0.0.1:8000/api/my-futsals/", {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => {
        setFutsals(res.data);
        if (res.data.length > 0) {
          setSelectedFutsalId(res.data[0].id);
        }
      })
      .catch(() => setError("Failed to load futsal list"));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!selectedFutsalId || !date || !startTime || !endTime) {
      setError("Please fill all fields.");
      return;
    }

    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);

    if (start >= end) {
      setError("Start time must be before end time.");
      return;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/generate-time-slots/",
        {
          futsal_id: selectedFutsalId,
          start_time: start.toISOString(),
          end_time: end.toISOString(),
        },
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setMessage(`Successfully created ${response.data.length} time slots.`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to generate time slots.");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white shadow p-6 rounded space-y-6">
      <h2 className="text-2xl font-bold text-center text-gray-800">
        Auto Generate Time Slots
      </h2>

      {error && <p className="text-red-500 text-center">{error}</p>}
      {message && <p className="text-green-600 text-center">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Futsal Selection */}
        <div>
          <label className="block font-medium text-gray-700 mb-1">
            Select Your Futsal
          </label>
          <select
            value={selectedFutsalId || ""}
            onChange={(e) => setSelectedFutsalId(Number(e.target.value))}
            className="w-full border p-2 rounded"
          >
            {futsals.map((futsal) => (
              <option key={futsal.id} value={futsal.id}>
                {futsal.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Start Time */}
        <div>
          <label className="block font-medium text-gray-700 mb-1">
            Start Time
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* End Time */}
        <div>
          <label className="block font-medium text-gray-700 mb-1">
            End Time
          </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Generate 1-hour Slots
        </button>
      </form>
    </div>
  );
}
