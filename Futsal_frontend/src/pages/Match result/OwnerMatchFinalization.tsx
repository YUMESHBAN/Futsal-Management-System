import { useEffect, useState } from "react";
import axios from "axios";
import Header from "../../components/header";
import Footer from "../../components/FooterIN";

interface Match {
  id: number;
  team_1: string;
  team_1_id: number;
  team_2: string;
  team_2_id: number;
  scheduled_date: string | null;
  futsal: string | null;
  status: string;
}

interface ELOResult {
  [matchId: number]: {
    team_a_change: number;
    team_b_change: number;
    team_a_new_rating: number;
    team_b_new_rating: number;
  };
}

export default function OwnerMatchFinalization() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<{
    [matchId: number]: { goals1: number; goals2: number };
  }>({});
  const [eloResult, setEloResult] = useState<ELOResult>({});

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    axios
      .get("http://127.0.0.1:8000/api/owner/competitive-matches/", {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => {
        const scheduled = res.data.filter(
          (m: Match) => m.status === "scheduled"
        );
        setMatches(scheduled);
      })
      .catch(() => setError("Failed to load competitive matches."));
  }, [token]);
  const handleInput = (
    matchId: number,
    field: "goals1" | "goals2",
    value: number | ""
  ) => {
    setFormData((prev) => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [field]: value,
      },
    }));
  };

  // Determine winner preview
  const getWinnerPreview = (matchId: number, match: Match) => {
    const data = formData[matchId];
    if (!data) return "—";
    if (data.goals1 > data.goals2) return match.team_1;
    if (data.goals2 > data.goals1) return match.team_2;
    return "Draw";
  };

  const handleSubmit = async (match: Match) => {
    const data = formData[match.id];
    if (!data || data.goals1 == null || data.goals2 == null) {
      alert("Please enter goals for both teams.");
      return;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/competitive/finalize/",
        {
          match_id: match.id,
          goals_team_1: data.goals1,
          goals_team_2: data.goals2,
        },
        { headers: { Authorization: `Token ${token}` } }
      );

      setEloResult((prev) => ({
        ...prev,
        [match.id]: response.data.elo_result,
      }));

      // Keep finalized match visible for 10 seconds
      setTimeout(() => {
        setMatches((prev) => prev.filter((m) => m.id !== match.id));
      }, 10000);
    } catch (err: any) {
      alert("Failed to finalize match: " + (err.response?.data?.error || ""));
    }
  };

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-6">
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-xl rounded-2xl">
          <h1 className="text-3xl font-extrabold mb-6 text-center text-blue-700">
            🏆 Finalize Scheduled Competitive Matches
          </h1>

          {error && (
            <div className="text-red-500 mb-4 text-center">{error}</div>
          )}

          {matches.length === 0 ? (
            <p className="text-center text-gray-600">No matches to finalize.</p>
          ) : (
            matches.map((m) => (
              <div
                key={m.id}
                className="border p-4 mb-6 rounded-xl bg-gray-50 shadow-sm hover:shadow-md transition"
              >
                <p className="font-semibold mb-2 text-gray-800">
                  {m.team_1} vs {m.team_2}
                  <br />
                  📅 {m.scheduled_date} at 🏟️ {m.futsal}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 mt-3">
                  <input
                    type="number"
                    placeholder={`${m.team_1} Goals`}
                    className="border p-2 rounded w-full sm:w-1/3"
                    value={formData[m.id]?.goals1 ?? ""}
                    onChange={(e) =>
                      handleInput(m.id, "goals1", parseInt(e.target.value))
                    }
                  />
                  <input
                    type="number"
                    placeholder={`${m.team_2} Goals`}
                    className="border p-2 rounded w-full sm:w-1/3"
                    value={formData[m.id]?.goals2 ?? ""}
                    onChange={(e) =>
                      handleInput(m.id, "goals2", parseInt(e.target.value))
                    }
                  />

                  <div className="flex items-center justify-center w-full sm:w-1/3 text-center font-semibold text-gray-700">
                    The Result: {getWinnerPreview(m.id, m)}
                  </div>
                </div>

                <button
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  onClick={() => handleSubmit(m)}
                >
                  Finalize Match
                </button>

                {eloResult[m.id] && (
                  <div className="mt-3 bg-green-100 p-3 rounded text-sm">
                    <p className="font-semibold text-green-800">
                      ELO Update Result:
                    </p>
                    <ul className="text-green-900 list-disc list-inside">
                      <li>
                        {m.team_1} change:{" "}
                        {eloResult[m.id].team_a_change.toFixed(2)} → new rating:{" "}
                        {eloResult[m.id].team_a_new_rating.toFixed(2)}
                      </li>
                      <li>
                        {m.team_2} change:{" "}
                        {eloResult[m.id].team_b_change.toFixed(2)} → new rating:{" "}
                        {eloResult[m.id].team_b_new_rating.toFixed(2)}
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
