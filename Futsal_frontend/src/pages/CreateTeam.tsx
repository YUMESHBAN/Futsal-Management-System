import { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../utils/api";
import { useNavigate } from "react-router-dom";

interface Player {
  name: string;
  age: number;
  photo?: File | null;
  is_captain: boolean;
  is_goalkeeper: boolean;
}

export default function CreateTeam() {
  const [teamName, setTeamName] = useState("");
  const [players, setPlayers] = useState<Player[]>([
    { name: "", age: 0, is_captain: false, is_goalkeeper: false, photo: null },
  ]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const addPlayer = () => {
    if (players.length < 8) {
      setPlayers([
        ...players,
        {
          name: "",
          age: 0,
          is_captain: false,
          is_goalkeeper: false,
          photo: null,
        },
      ]);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updatePlayer = (index: number, field: keyof Player, value: any) => {
    const newPlayers = [...players];
    const player = { ...newPlayers[index] };

    // Type guards based on field type
    if (field === "age") {
      player.age = Number(value);
    } else if (field === "name") {
      player.name = value;
    } else if (field === "photo") {
      player.photo = value;
    } else if (field === "is_captain") {
      player.is_captain = Boolean(value);
    } else if (field === "is_goalkeeper") {
      player.is_goalkeeper = Boolean(value);
    }

    newPlayers[index] = player;
    setPlayers(newPlayers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return setError("Not authenticated");

    const formData = new FormData();
    formData.append("name", teamName);
    players.forEach((player, i) => {
      formData.append(`players[${i}][name]`, player.name);
      formData.append(`players[${i}][age]`, String(player.age));
      formData.append(`players[${i}][is_captain]`, String(player.is_captain));
      formData.append(
        `players[${i}][is_goalkeeper]`,
        String(player.is_goalkeeper)
      );
      if (player.photo) {
        formData.append(`players[${i}][photo]`, player.photo);
      }
    });

    try {
      await axios.post(`${API_BASE_URL}/teams/`, formData, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });
      navigate("/dashboard");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Error creating team");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow mt-10">
      <h2 className="text-2xl font-bold mb-4">Create a New Team</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Team Name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        {players.map((player, index) => (
          <div key={index} className="border p-4 rounded space-y-2">
            <label>Player's Name:</label>
            <input
              type="text"
              placeholder="Player Name"
              value={player.name}
              onChange={(e) => updatePlayer(index, "name", e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
            <label>Age:</label>
            <input
              type="number"
              placeholder="Player Age"
              value={player.age || ""}
              onChange={(e) =>
                updatePlayer(index, "age", Number(e.target.value) || null)
              }
              className="w-full p-2 border rounded"
              required
            />

            <br></br>
            <label>
              <input
                type="checkbox"
                checked={player.is_captain}
                onChange={(e) =>
                  updatePlayer(index, "is_captain", e.target.checked)
                }
              />
              Captain
            </label>
            <label className="ml-4">
              <input
                type="checkbox"
                checked={player.is_goalkeeper}
                onChange={(e) =>
                  updatePlayer(index, "is_goalkeeper", e.target.checked)
                }
              />
              Goalkeeper
            </label>
          </div>
        ))}
        {players.length < 8 && (
          <button
            type="button"
            onClick={addPlayer}
            className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
          >
            Add Player
          </button>
        )}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Team
        </button>
      </form>
    </div>
  );
}
