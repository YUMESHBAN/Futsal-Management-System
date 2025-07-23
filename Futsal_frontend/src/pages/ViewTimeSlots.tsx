import { useEffect, useState } from "react";
import axios from "axios";

interface Futsal {
  id: number;
  name: string;
}

interface TimeSlot {
  id: number;
  futsal: Futsal;
  start_time: string;
  end_time: string;
  is_booked: boolean;
}

export default function ViewTimeSlots() {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    axios
      .get("http://127.0.0.1:8000/api/time-slots/", {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => setSlots(res.data))
      .catch(() => setError("Failed to load time slots."));
  }, [token]);

  return (
    <div className="max-w-5xl mx-auto mt-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
        Available & Booked Time Slots
      </h1>

      {error && <div className="text-red-500 text-center mb-4">{error}</div>}

      {slots.length === 0 ? (
        <p className="text-gray-600 text-center">No time slots available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {slots.map((slot) => (
            <div
              key={slot.id}
              className={`p-4 rounded shadow border ${
                slot.is_booked ? "bg-red-100" : "bg-green-100"
              }`}
            >
              <h2 className="text-lg font-semibold text-gray-800">
                {slot.futsal.name}
              </h2>
              <p className="text-gray-700">
                {new Date(slot.start_time).toLocaleString()} -{" "}
                {new Date(slot.end_time).toLocaleTimeString()}
              </p>
              <p
                className={`font-bold ${
                  slot.is_booked ? "text-red-600" : "text-green-600"
                }`}
              >
                {slot.is_booked ? "Booked" : "Available"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
