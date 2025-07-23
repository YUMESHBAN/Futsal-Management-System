import { useEffect, useState } from "react";
import axios from "axios";

interface TimeSlot {
  id: number;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  futsal_name: string;
  team_name?: string;
  user_email?: string;
}

interface GroupedSlots {
  [date: string]: TimeSlot[];
}

export default function ViewTimeSlots() {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [groupedSlots, setGroupedSlots] = useState<GroupedSlots>({});
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    axios
      .get("http://127.0.0.1:8000/api/time-slots/", {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => {
        const fetchedSlots = res.data as TimeSlot[];
        setSlots(fetchedSlots);

        const grouped: GroupedSlots = {};
        fetchedSlots.forEach((slot) => {
          const date = new Date(slot.start_time).toLocaleDateString();
          if (!grouped[date]) grouped[date] = [];
          grouped[date].push(slot);
        });

        setGroupedSlots(grouped);
      })
      .catch((err) => {
        console.error("Failed to load slots", err);
        setSlots([]);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const isNewBooking = (startTime: string): boolean => {
    const slotTime = new Date(startTime).getTime();
    const now = new Date().getTime();
    return now - slotTime < 24 * 60 * 60 * 1000; // within last 24 hours
  };

  if (loading) {
    return <div className="text-center mt-10 text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded mt-10">
      <h1 className="text-2xl font-bold mb-6 text-center">All Time Slots</h1>

      {/* Booking History */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Booking History</h2>
        {slots.filter((slot) => slot.is_booked).length === 0 ? (
          <p className="text-gray-600">No bookings yet.</p>
        ) : (
          <ul className="space-y-2">
            {slots
              .filter((slot) => slot.is_booked)
              .sort(
                (a, b) =>
                  new Date(b.start_time).getTime() -
                  new Date(a.start_time).getTime()
              )
              .map((slot) => (
                <li
                  key={slot.id}
                  className={`border p-3 rounded shadow-sm ${
                    isNewBooking(slot.start_time)
                      ? "bg-yellow-100"
                      : "bg-blue-100"
                  } text-gray-800`}
                >
                  <strong>{slot.team_name}</strong> booked{" "}
                  <span className="italic">{slot.futsal_name}</span> on{" "}
                  {new Date(slot.start_time).toLocaleString()} –{" "}
                  {new Date(slot.end_time).toLocaleTimeString()}
                  <br />
                  <span className="text-sm text-gray-700">
                    Email: {slot.user_email ?? "N/A"}
                  </span>
                  {isNewBooking(slot.start_time) && (
                    <span className="ml-2 text-sm font-semibold text-orange-600">
                      New Booking
                    </span>
                  )}
                </li>
              ))}
          </ul>
        )}
      </section>

      {/* Grouped Slot View */}
      {Object.keys(groupedSlots).length === 0 ? (
        <p className="text-center text-gray-600">No time slots available.</p>
      ) : (
        Object.entries(groupedSlots).map(([date, slots]) => (
          <div key={date} className="mb-7">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">{date}</h2>
            <div className="space-y-3">
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  className={`p-4 rounded border ${
                    slot.is_booked
                      ? isNewBooking(slot.start_time)
                        ? "bg-red-100 border-red-400"
                        : "bg-red-100 border-red-400"
                      : "bg-green-100 border-green-400"
                  }`}
                >
                  <div className="flex justify-between items-center">
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
                      <p className="text-sm text-gray-600">
                        Futsal: {slot.futsal_name}
                      </p>
                      {slot.is_booked && (
                        <>
                          <p className="text-sm text-gray-700">
                            Booked by: <strong>{slot.team_name}</strong>
                          </p>
                          <p className="text-sm text-gray-600">
                            Email: {slot.user_email}
                          </p>
                          {isNewBooking(slot.start_time) && (
                            <span className="text-sm font-semibold text-red-600">
                              Booked
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
