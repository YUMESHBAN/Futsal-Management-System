import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../utils/api";
import Header from "../../components/header";
import Footer from "../../components/FooterIN";

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
    <div>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <form
          onSubmit={handleCreate}
          className="bg-white shadow-lg rounded-2xl p-8 w-[28rem] border border-green-200"
        >
          <h2 className="text-3xl font-extrabold text-center text-green-600 mb-6">
            🏟️ Create Your Futsal
          </h2>

          {error && (
            <p className="text-red-600 text-center mb-4 bg-red-50 py-2 rounded">
              {error}
            </p>
          )}

          <input
            type="text"
            placeholder="Futsal Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mb-4 p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            required
          />

          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full mb-4 p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            required
          />

          <input
            type="text"
            placeholder="Contact Number"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            className="w-full mb-4 p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            required
          />

          <input
            type="number"
            placeholder="Price Per Hour"
            value={pricePerHour}
            onChange={(e) => setPricePerHour(e.target.value)}
            className="w-full mb-4 p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            required
          />

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full mb-6 p-3 border border-green-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            rows={3}
            required
          />

          <button
            type="submit"
            className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-green-700 transition duration-300"
          >
            ✅ Create Futsal
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
}
