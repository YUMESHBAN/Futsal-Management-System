// src/pages/TimeSlotBooking.tsx
import { useEffect, useState } from "react";
import axios from "axios";

interface TimeSlot {
  id: number;
  futsal: number;
  start_time: string;
  end_time: string;
  is_booked: boolean;
}

export default function TimeSlotBooking() {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    axios
      .get("http://127.0.0.1:8000/api/time-slots/", {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => setSlots(res.data))
      .catch(() => setError("Failed to load time slots"));
  }, [token]);

  const handleBook = () => {
    if (!selectedSlotId || !token) return;

    axios
      .post(
        `http://127.0.0.1:8000/api/book-slot/${selectedSlotId}/`,
        {},
        {
          headers: { Authorization: `Token ${token}` },
        }
      )
      .then(() => {
        setSuccess("Slot booked successfully!");
        setSlots((prev) =>
          prev.map((slot) =>
            slot.id === selectedSlotId ? { ...slot, is_booked: true } : slot
          )
        );
        setSelectedSlotId(null);
      })
      .catch(() => setError("Failed to book slot"));
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4">Book Time Slot</h1>

      {error && <p className="text-red-600">{error}</p>}
      {success && <p className="text-green-600">{success}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        {slots.map((slot) => (
          <div
            key={slot.id}
            className={`p-4 rounded border ${
              slot.is_booked
                ? "bg-red-100 text-gray-500"
                : selectedSlotId === slot.id
                ? "bg-green-100 border-green-500"
                : "bg-gray-50"
            }`}
          >
            <p>
              <strong>Time:</strong>{" "}
              {new Date(slot.start_time).toLocaleTimeString()} -{" "}
              {new Date(slot.end_time).toLocaleTimeString()}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(slot.start_time).toLocaleDateString()}
            </p>
            {slot.is_booked ? (
              <p className="text-sm mt-2">Already Booked</p>
            ) : (
              <button
                className="mt-3 text-blue-600 hover:underline"
                onClick={() => setSelectedSlotId(slot.id)}
              >
                Select Slot
              </button>
            )}
          </div>
        ))}
      </div>

      {selectedSlotId && (
        <div className="mt-6">
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded"
            onClick={handleBook}
          >
            Book Selected Slot
          </button>
        </div>
      )}
    </div>
  );
}
