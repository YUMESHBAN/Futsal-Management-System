/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Footer from "../../components/FooterIN";
import Header from "../../components/Header";

interface Futsal {
  id: number;
  name: string;
  location: string;
}

interface Player {
  name: string;
  age: number;
}

interface TeamData {
  name: string;
  location: string;
  skill_level: string;
  futsal_id: number | null; // Home futsal
  preferred_futsal_ids: number[]; // Remaining 4 futsals
}

const API_BASE_URL = "http://127.0.0.1:8000/api";

export default function CreateTeam() {
  const navigate = useNavigate();
  const [teamData, setTeamData] = useState<TeamData>({
    name: "",
    location: "",
    skill_level: "",
    futsal_id: null,
    preferred_futsal_ids: [],
  });

  const [players, setPlayers] = useState<Player[]>([
    { name: "", age: 0 },
    { name: "", age: 0 },
  ]);

  const [futsals, setFutsals] = useState<Futsal[]>([]);
  const [errors, setErrors] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch futsals on mount
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/futsals/`)
      .then((res) => setFutsals(res.data))
      .catch((err) => {
        console.error("❌ Failed to fetch futsals:", err);
        setErrors("Failed to load futsal list.");
      });
  }, []);

  // Handle player input change
  const handlePlayerChange = (
    index: number,
    field: keyof Player,
    value: any
  ) => {
    const updated = [...players];
    if (field === "age") updated[index].age = parseInt(value) || 0;
    else if (field === "name") updated[index].name = value;
    setPlayers(updated);
  };

  const addPlayer = () => setPlayers([...players, { name: "", age: 0 }]);
  const removePlayer = (index: number) => {
    if (players.length <= 2) return;
    const updated = [...players];
    updated.splice(index, 1);
    setPlayers(updated);
  };

  // Toggle preferred futsals (max 4, home futsal is always priority #1)
  const togglePreferredFutsal = (id: number) => {
    setTeamData((prev) => {
      if (id === prev.futsal_id) return prev; // can't re-select home futsal

      let updated = [...prev.preferred_futsal_ids];
      if (updated.includes(id)) updated = updated.filter((f) => f !== id);
      else {
        if (updated.length >= 4) {
          alert(
            "❌ You can only select 4 additional preferred futsals besides home futsal."
          );
          return prev;
        }
        updated.push(id);
      }
      return { ...prev, preferred_futsal_ids: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors(null);

    // Validate players
    if (players.length < 2) {
      setErrors("At least 2 players are required.");
      return;
    }
    if (players.some((p) => !p.name.trim() || p.age <= 0)) {
      setErrors("Please fill all player names and valid ages.");
      return;
    }

    // Validate preferred futsals
    if (!teamData.futsal_id) {
      setErrors("Please select a home futsal.");
      return;
    }
    if (teamData.preferred_futsal_ids.length !== 4) {
      setErrors(
        "You must select exactly 4 additional preferred futsals (home futsal is priority #1)."
      );
      return;
    }

    setLoading(true);

    const payload = {
      ...teamData,
      preferred_futsal_ids: [
        teamData.futsal_id,
        ...teamData.preferred_futsal_ids,
      ],
      players,
    };

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrors("User not authenticated.");
        setLoading(false);
        return;
      }

      await axios.post(`${API_BASE_URL}/teams/`, payload, {
        headers: { Authorization: `Token ${token}` },
      });

      alert("Team created successfully!");
      setLoading(false);
      navigate("/my-team");
    } catch (error: any) {
      console.error(
        "❌ Team creation failed:",
        error.response || error.message
      );
      setErrors(
        error.response?.data?.detail ||
          "Team creation failed. Please check your inputs."
      );
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-8">
        <div className="max-w-2xl mx-auto p-8 bg-white shadow-lg rounded-2xl m-5">
          <h2 className="text-3xl font-extrabold text-center mb-6 text-[#2E8B57]">
            Create Your Team
          </h2>

          {errors && (
            <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 ">
              {errors}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Team info */}
            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-1">Team Name</label>
                <input
                  type="text"
                  value={teamData.name}
                  onChange={(e) =>
                    setTeamData({ ...teamData, name: e.target.value })
                  }
                  required
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#2E8B57] outline-none"
                  placeholder="Enter team name"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Location</label>
                <input
                  type="text"
                  value={teamData.location}
                  onChange={(e) =>
                    setTeamData({ ...teamData, location: e.target.value })
                  }
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#2E8B57] outline-none"
                  placeholder="City / Area"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Skill Level</label>
                <input
                  type="text"
                  value={teamData.skill_level}
                  onChange={(e) =>
                    setTeamData({ ...teamData, skill_level: e.target.value })
                  }
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#2E8B57] outline-none"
                  placeholder="Beginner, Intermediate, Pro..."
                />
              </div>
            </div>

            {/* Home futsal */}
            <div>
              <label className="block font-semibold mb-1">Home Futsal</label>
              <select
                value={teamData.futsal_id ?? ""}
                onChange={(e) =>
                  setTeamData({
                    ...teamData,
                    futsal_id: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#2E8B57] outline-none"
              >
                <option value="">-- Select --</option>
                {futsals.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} - {f.location}
                  </option>
                ))}
              </select>
            </div>

            {/* Preferred futsals */}
            <div>
              <label className="block font-semibold mb-2">
                Preferred Futsals{" "}
                <span className="text-sm text-gray-500">
                  (Select 4 additional futsals besides home)
                </span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {futsals.map((futsal) => (
                  <label
                    key={futsal.id}
                    className={`flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer ${
                      futsal.id === teamData.futsal_id
                        ? "bg-green-100 border-green-400"
                        : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={teamData.preferred_futsal_ids.includes(
                        futsal.id
                      )}
                      onChange={() => togglePreferredFutsal(futsal.id)}
                      disabled={futsal.id === teamData.futsal_id} // can't toggle home futsal
                      className="h-4 w-4"
                    />
                    <span>
                      {futsal.name} - {futsal.location}
                      {futsal.id === teamData.futsal_id
                        ? " (Home / Priority #1)"
                        : ""}
                    </span>
                  </label>
                ))}
              </div>

              {/* Display ordered futsals */}
              {teamData.futsal_id && (
                <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-semibold text-green-700 mb-1">
                    Selected Futsals (Priority Order)
                  </p>
                  <ol className="list-decimal list-inside text-green-900 text-sm">
                    {(() => {
                      const homeFutsal = futsals.find(
                        (f) => f.id === teamData.futsal_id
                      );
                      return homeFutsal ? (
                        <li key={homeFutsal.id}>
                          {homeFutsal.name} - {homeFutsal.location}
                        </li>
                      ) : null;
                    })()}
                    {teamData.preferred_futsal_ids.map((id) => {
                      const futsal = futsals.find((f) => f.id === id);
                      return (
                        <li key={id}>
                          {futsal?.name} - {futsal?.location}
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}
            </div>

            {/* Players */}
            <div>
              <h3 className="font-semibold mb-3">
                Players <span className="text-sm text-gray-500">(min 2)</span>
              </h3>
              {players.map((player, idx) => (
                <div key={idx} className="border rounded-lg p-4 mb-4 shadow-sm">
                  <label className="block mb-2 font-semibold">
                    Player {idx + 1}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Name"
                      value={player.name}
                      onChange={(e) =>
                        handlePlayerChange(idx, "name", e.target.value)
                      }
                      required
                      className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#2E8B57] outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Age"
                      min={1}
                      value={player.age || ""}
                      onChange={(e) =>
                        handlePlayerChange(idx, "age", e.target.value)
                      }
                      required
                      className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#2E8B57] outline-none"
                    />
                  </div>
                  {players.length > 2 && (
                    <button
                      type="button"
                      className="mt-3 text-red-600 hover:underline"
                      onClick={() => removePlayer(idx)}
                    >
                      Remove Player
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addPlayer}
                className="text-blue-600 font-semibold hover:underline"
              >
                + Add Player
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full p-3 rounded-lg text-white font-semibold transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#2E8B57] hover:bg-green-700"
              }`}
            >
              {loading ? "Creating..." : "Create Team"}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
