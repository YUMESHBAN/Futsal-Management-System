import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../utils/api";

export default function CreateFutsal() {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [pricePerHour, setPricePerHour] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        `${API_BASE_URL}/futsals/`,
        {
          name,
          location,
          contact_number: contactNumber,
          price_per_hour: pricePerHour,
          description,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      navigate("/futsals"); // Redirect after success
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Failed to create futsal.");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleCreate}
        className="bg-white p-6 rounded shadow w-[28rem]"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Create Futsal</h2>

        {error && <p className="text-red-500 mb-3">{error}</p>}

        <input
          type="text"
          placeholder="Futsal Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
          required
        />

        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
          required
        />

        <input
          type="text"
          placeholder="Contact Number"
          value={contactNumber}
          onChange={(e) => setContactNumber(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
          required
        />

        <input
          type="number"
          placeholder="Price Per Hour"
          value={pricePerHour}
          onChange={(e) => setPricePerHour(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
          required
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full mb-4 p-2 border rounded resize-none"
          rows={3}
          required
        />

        <button
          type="submit"
          className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
        >
          Create
        </button>
      </form>
    </div>
  );
}
