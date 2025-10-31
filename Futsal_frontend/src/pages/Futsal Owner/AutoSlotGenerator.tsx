import { useEffect, useState } from "react";
import axios from "axios";
import Header from "../../components/header";
import Footer from "../../components/FooterIN";

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
      setMessage(`✅ Successfully created ${response.data.length} time slots.`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to generate time slots.");
    }
  };

  return (
    <div>
      <Header />
      <div className=" bg-gradient-to-br from-green-50 to-green-100 p-5">
        <div className="max-w-xl mx-auto mt-12 bg-white shadow-lg rounded-2xl p-8 space-y-6 border border-green-200 mb-5 ">
          <h2 className="text-3xl font-extrabold text-center text-green-600">
            ⚽ Auto Generate Time Slots
          </h2>

          {error && (
            <p className="text-red-500 text-center font-medium bg-red-50 py-2 rounded">
              {error}
            </p>
          )}
          {message && (
            <p className="text-green-700 text-center font-medium bg-green-50 py-2 rounded">
              {message}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Futsal Selection */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Futsal
              </label>
              {futsals.length === 0 ? (
                <p className="text-gray-500">No futsal created yet</p>
              ) : (
                <p className="font-medium text-gray-700">{futsals[0].name}</p>
              )}
           </div>


            {/* Date */}
            <div>
              <label className="block font-semibold text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-green-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 p-3 rounded-lg"
              />
            </div>

            {/* Start Time */}
            <div>
              <label className="block font-semibold text-gray-700 mb-2">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full border border-green-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 p-3 rounded-lg"
              />
            </div>

            {/* End Time */}
            <div>
              <label className="block font-semibold text-gray-700 mb-2">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full border border-green-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 p-3 rounded-lg"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-green-700 transition duration-300"
            >
              Generate 1-hour Slots
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
