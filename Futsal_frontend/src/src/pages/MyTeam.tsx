// src/pages/MyTeam.tsx
import { useEffect, useState, type ChangeEvent } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Image from "../assets/FootballIcon.png";

interface Player {
  id: number;
  name: string;
  age: number;
  is_captain: boolean;
  is_goalkeeper: boolean;
  photo: string | null;
}

interface Team {
  id: number;
  name: string;
  owner: number;
  created_at: string;
  players: Player[];
}

export default function MyTeam() {
  const [team, setTeam] = useState<Team | null>(null);
  const [error, setError] = useState("");
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [addingPlayer, setAddingPlayer] = useState(false);
  const [newPlayer, setNewPlayer] = useState<Omit<Player, "id" | "photo">>({
    name: "",
    age: 18,
    is_captain: false,
    is_goalkeeper: false,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
    null
  );
  const [editingTeamName, setEditingTeamName] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    axios
      .get("http://127.0.0.1:8000/api/my-team/", {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => setTeam(res.data))
      .catch(() => setError("Error fetching team data."));
  }, [navigate, token]);

  const getRole = (player: Player) => {
    if (player.is_captain) return "Captain";
    if (player.is_goalkeeper) return "Goalkeeper";
    return "Player";
  };

  const handlePhotoChange = (
    playerId: number,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    const formData = new FormData();
    formData.append("photo", file);

    axios
      .patch(`http://127.0.0.1:8000/api/players/${playerId}/`, formData, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        setTeam((prev) =>
          prev
            ? {
                ...prev,
                players: prev.players.map((p) =>
                  p.id === playerId ? { ...p, photo: res.data.photo } : p
                ),
              }
            : prev
        );
      });
  };

  const handleDeleteTeam = () => {
    if (!team || !token) return;
    if (!window.confirm("Are you sure you want to delete your team?")) return;

    axios
      .delete(`http://127.0.0.1:8000/api/teams/${team.id}/`, {
        headers: { Authorization: `Token ${token}` },
      })
      .then(() => {
        navigate("/dashboard");
      })
      .catch(() => {
        alert("Failed to delete team.");
      });
  };

  const handleTeamNameUpdate = () => {
    if (!team || !token) return;
    if (!team.name.trim()) return; // prevent empty name

    axios
      .patch(
        `http://127.0.0.1:8000/api/teams/${team.id}/`,
        { name: team.name },
        {
          headers: { Authorization: `Token ${token}` },
        }
      )
      .then(() => setEditingTeamName(false));
  };

  const handlePlayerEdit = () => {
    if (!editingPlayer || !token) return;

    axios
      .patch(
        `http://127.0.0.1:8000/api/players/${editingPlayer.id}/`,
        editingPlayer,
        {
          headers: { Authorization: `Token ${token}` },
        }
      )
      .then((res) => {
        setTeam((prev) =>
          prev
            ? {
                ...prev,
                players: prev.players.map((p) =>
                  p.id === res.data.id ? res.data : p
                ),
              }
            : prev
        );
        setEditingPlayer(null);
      });
  };

  const handlePlayerDelete = (playerId: number) => {
    if (!token) return;

    axios
      .delete(`http://127.0.0.1:8000/api/players/${playerId}/`, {
        headers: { Authorization: `Token ${token}` },
      })
      .then(() => {
        setTeam((prev) =>
          prev
            ? {
                ...prev,
                players: prev.players.filter((p) => p.id !== playerId),
              }
            : prev
        );
        setShowDeleteConfirm(null);
      });
  };

  const handleAddPlayer = () => {
    if (!token || !team) return;
    if (!newPlayer.name.trim() || newPlayer.age <= 0) return; // basic validation

    // Include the team id in the payload if required by your backend
    axios
      .post(
        `http://127.0.0.1:8000/api/players/`,
        {
          ...newPlayer,
          team: team.id,
        },
        {
          headers: { Authorization: `Token ${token}` },
        }
      )
      .then((res) => {
        setTeam((prev) =>
          prev ? { ...prev, players: [...prev.players, res.data] } : prev
        );
        setAddingPlayer(false);
        setNewPlayer({
          name: "",
          age: 18,
          is_captain: false,
          is_goalkeeper: false,
        });
      });
  };

  if (error)
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  if (!team)
    return (
      <div className="text-center mt-10 text-gray-500">Loading team...</div>
    );

  return (
    <div className="max-w-5xl mx-auto mt-10 bg-white shadow p-6 rounded-lg">
      <div className="flex items-center justify-between mb-6">
        {editingTeamName ? (
          <div className="flex gap-2 items-center">
            <input
              value={team.name}
              onChange={(e) => setTeam({ ...team, name: e.target.value })}
              className="border rounded px-3 py-1"
            />
            <button
              onClick={handleTeamNameUpdate}
              className="btn btn-sm btn-primary"
            >
              Save
            </button>
            <button
              onClick={handleDeleteTeam}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded text-sm ml-4"
            >
              Delete Team
            </button>
          </div>
        ) : (
          <>
            <h2
              className="text-3xl font-bold text-gray-800 cursor-pointer"
              onClick={() => setEditingTeamName(true)}
            >
              My Team: {team.name}
            </h2>
            <button
              onClick={() => setAddingPlayer(true)}
              className="ml-4 btn btn-sm btn-success"
            >
              + Add Player
            </button>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {team.players.map((player) => (
          <div
            key={player.id}
            className="border rounded-lg p-4 bg-gray-50 shadow-sm text-center relative"
          >
            <label htmlFor={`photo-${player.id}`}>
              <img
                src={
                  player.photo
                    ? player.photo.startsWith("http")
                      ? player.photo
                      : `http://127.0.0.1:8000${player.photo}`
                    : Image
                }
                alt={player.name}
                className="w-24 h-24 mx-auto rounded-full object-cover mb-3 cursor-pointer hover:opacity-80"
              />
            </label>
            <input
              type="file"
              id={`photo-${player.id}`}
              className="hidden"
              accept="image/*"
              onChange={(e) => handlePhotoChange(player.id, e)}
            />
            <h3 className="text-lg font-semibold">{player.name}</h3>
            <p className="text-sm text-gray-600">{getRole(player)}</p>
            <p className="text-sm text-gray-500">Age: {player.age}</p>

            <div className="flex justify-center gap-3 mt-2">
              <button
                className="text-blue-600 text-sm"
                onClick={() => setEditingPlayer(player)}
              >
                Edit
              </button>
              <button
                className="text-red-600 text-sm"
                onClick={() => setShowDeleteConfirm(player.id)}
              >
                Delete
              </button>
            </div>

            {showDeleteConfirm === player.id && (
              <div className="mt-2 text-sm text-gray-700">
                Confirm delete?
                <div className="flex gap-2 justify-center mt-1">
                  <button
                    className="text-white bg-red-500 px-2 py-1 rounded"
                    onClick={() => handlePlayerDelete(player.id)}
                  >
                    Yes
                  </button>
                  <button
                    className="text-gray-700 px-2 py-1"
                    onClick={() => setShowDeleteConfirm(null)}
                  >
                    No
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Edit Player Modal */}
      {editingPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Edit Player</h3>
            <input
              value={editingPlayer.name}
              onChange={(e) =>
                setEditingPlayer({ ...editingPlayer, name: e.target.value })
              }
              placeholder="Name"
              className="w-full border px-3 py-2 mb-2"
            />
            <input
              type="number"
              value={editingPlayer.age}
              onChange={(e) =>
                setEditingPlayer({
                  ...editingPlayer,
                  age: parseInt(e.target.value) || 0,
                })
              }
              placeholder="Age"
              className="w-full border px-3 py-2 mb-2"
            />
            <div className="flex items-center gap-3 mb-4">
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={editingPlayer.is_captain}
                  onChange={(e) =>
                    setEditingPlayer({
                      ...editingPlayer,
                      is_captain: e.target.checked,
                    })
                  }
                />
                Captain
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={editingPlayer.is_goalkeeper}
                  onChange={(e) =>
                    setEditingPlayer({
                      ...editingPlayer,
                      is_goalkeeper: e.target.checked,
                    })
                  }
                />
                Goalkeeper
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingPlayer(null)}
                className="text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handlePlayerEdit}
                className="bg-blue-600 text-white px-4 py-1 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Player Modal */}
      {addingPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add Player</h3>
            <input
              value={newPlayer.name}
              onChange={(e) =>
                setNewPlayer({ ...newPlayer, name: e.target.value })
              }
              placeholder="Player Name"
              className="w-full border px-3 py-2 mb-2"
            />
            <input
              type="number"
              placeholder="Player Age"
              value={newPlayer.age || ""}
              onChange={(e) =>
                setNewPlayer({
                  ...newPlayer,
                  age: parseInt(e.target.value) || 0,
                })
              }
              className="w-full border px-3 py-2 mb-2"
            />

            <div className="flex items-center gap-3 mb-4">
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={newPlayer.is_captain}
                  onChange={(e) =>
                    setNewPlayer({ ...newPlayer, is_captain: e.target.checked })
                  }
                />
                Captain
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={newPlayer.is_goalkeeper}
                  onChange={(e) =>
                    setNewPlayer({
                      ...newPlayer,
                      is_goalkeeper: e.target.checked,
                    })
                  }
                />
                Goalkeeper
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setAddingPlayer(false)}
                className="text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPlayer}
                className="bg-green-600 text-white px-4 py-1 rounded"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
