import { useEffect, useState } from "react";
import axios from "axios";

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

interface TimeSlot {
  id: number;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  futsal_name: string;
  team_name?: string;
  user_email?: string;
  created_at: string;
  match_result?: string;
}

interface GroupedMatches {
  [date: string]: Match[];
}

interface GroupedSlots {
  [date: string]: TimeSlot[];
}

export default function MatchAndSlotsView() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [groupedMatches, setGroupedMatches] = useState<GroupedMatches>({});
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [groupedSlots, setGroupedSlots] = useState<GroupedSlots>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setError("Authentication required");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [matchRes, slotRes] = await Promise.all([
          axios.get("http://127.0.0.1:8000/api/team-matches/", {
            headers: { Authorization: `Token ${token}` },
          }),
          axios.get("http://127.0.0.1:8000/api/time-slots/", {
            headers: { Authorization: `Token ${token}` },
          }),
        ]);

        const fetchedMatches = matchRes.data as Match[];
        const fetchedSlots = slotRes.data as TimeSlot[];

        // Group matches by booking time
        const matchGroup: GroupedMatches = {};
        fetchedMatches
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )
          .forEach((match) => {
            const bookingDate = new Date(match.created_at).toLocaleDateString();
            if (!matchGroup[bookingDate]) matchGroup[bookingDate] = [];
            matchGroup[bookingDate].push(match);
          });

        // Group time slots by slot date
        const slotGroup: GroupedSlots = {};
        fetchedSlots.forEach((slot) => {
          const date = new Date(slot.start_time).toLocaleDateString();
          if (!slotGroup[date]) slotGroup[date] = [];
          slotGroup[date].push(slot);
        });

        Object.keys(slotGroup).forEach((date) => {
          slotGroup[date].sort(
            (a, b) =>
              new Date(a.start_time).getTime() -
              new Date(b.start_time).getTime()
          );
        });

        setMatches(fetchedMatches);
        setGroupedMatches(matchGroup);
        setSlots(fetchedSlots);
        setGroupedSlots(slotGroup);
      } catch (err: any) {
        console.error("Detailed error:", err);
        setError(
          err.response?.data?.detail ||
            "Failed to load match history or time slots."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const isNew = (createdAt: string): boolean => {
    const created = new Date(createdAt).getTime();
    const now = new Date().getTime();
    return now - created < 24 * 60 * 60 * 1000;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded mt-10 text-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg mt-10">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Match History
      </h1>

      {Object.keys(groupedMatches).length === 0 ? (
        <div className="p-6 text-center bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-900">
            No matches found
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Booked matches will appear here grouped by booking date
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedMatches).map(([date, matches]) => (
            <div key={date} className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Booked on {date}
              </h3>
              {matches.map((match) => (
                <div
                  key={match.id}
                  className={`p-4 rounded-lg shadow-sm border-l-4 bg-white ${
                    isNew(match.created_at)
                      ? "border-yellow-400"
                      : "border-blue-400"
                  } hover:shadow-md transition-shadow`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h3 className="text-base font-medium text-gray-900">
                        {match.team_1_name} vs {match.team_2_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Type: {match.match_type}
                      </p>
                    </div>
                    {isNew(match.created_at) && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                        New
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-700">
                    <p>
                      <strong>Scheduled:</strong>{" "}
                      {new Date(match.scheduled_time).toLocaleString()}
                    </p>

                    <p className="text-sm text-green-700 mt-2">
                      <strong>Status:</strong>{" "}
                      {match.result === "team_1"
                        ? `${match.team_1_name} won`
                        : match.result === "team_2"
                        ? `${match.team_2_name} won`
                        : match.result}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Booked at: {new Date(match.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* --- Available Time Slots Section --- */}
      <section className="mt-16">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Available Time Slots
        </h2>

        {Object.keys(groupedSlots).length === 0 ? (
          <div className="p-6 text-center bg-gray-50 rounded-lg border border-gray-200">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No time slots available
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Check back later for available booking times
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedSlots).map(([date, slots]) => (
              <div key={date} className="space-y-3">
                <h3 className="text-lg font-medium text-gray-800 border-b pb-2">
                  {date}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {slots.map((slot) => {
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

                        {slot.is_booked && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Team:</span>{" "}
                              {slot.team_name || "N/A"}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              <span className="font-medium">Email:</span>{" "}
                              {slot.user_email || "N/A"}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
