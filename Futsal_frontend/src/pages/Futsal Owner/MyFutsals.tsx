import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/header";
import Footer from "../../components/FooterIN";
import defaultImage from "../../assets/home.png"; // ✅ default image

interface Futsal {
  id: number;
  name: string;
  location: string;
  contact_number: string;
  price_per_hour: string;
  description: string;
  image?: string | null;
}

export default function MyFutsals() {
  const [futsals, setFutsals] = useState<Futsal[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user_type = localStorage.getItem("user_type");

    if (token && user_type === "owner") {
      fetchMyFutsals(token);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const fetchMyFutsals = async (token: string) => {
    try {
      const response = await fetch("http://localhost:8000/api/my-futsals/", {
        headers: { Authorization: `Token ${token}` },
      });
      if (!response.ok) throw new Error("Unauthorized or failed to fetch.");
      const data = await response.json();
      setFutsals(data);
    } catch (error) {
      console.error("Fetch error:", error);
      navigate("/login");
    }
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!window.confirm("Are you sure you want to delete this futsal?")) return;

    try {
      const response = await fetch(`http://localhost:8000/api/futsals/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Token ${token}` },
      });

      if (response.ok) setFutsals((prev) => prev.filter((f) => f.id !== id));
      else alert("Failed to delete.");
    } catch (error) {
      console.error("Delete error:", error);
      alert("An error occurred.");
    }
  };

  const handlePhotoChange = async (
    futsalId: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(
        `http://localhost:8000/api/futsals/${futsalId}/`,
        {
          method: "PATCH",
          headers: { Authorization: `Token ${token}` },
          body: formData,
        }
      );

      if (response.ok) {
        const updated = await response.json();
        setFutsals((prev) =>
          prev.map((f) => (f.id === futsalId ? updated : f))
        );
      } else {
        alert("Failed to upload image.");
      }
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-green-600">
            🏟️ My Futsals
          </h1>
          <button
            onClick={() => navigate("/create-futsal")}
            className="bg-green-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-green-700 transition duration-300"
          >
            + Create Futsal
          </button>
        </div>

        {/* Empty State */}
        {futsals.length === 0 ? (
          <p className="text-gray-600 text-center text-lg bg-white py-6 rounded-lg shadow">
            No futsals found. 🚫
          </p>
        ) : (
          /* Futsals Grid (Players-style) */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {futsals.map((futsal) => (
              <div
                key={futsal.id}
                className="border rounded-xl p-5 bg-gray-50 shadow hover:shadow-md transition text-center relative"
              >
                {/* Futsal Image Upload */}
                <label htmlFor={`futsal-photo-${futsal.id}`}>
                  <img
                    src={
                      futsal.image
                        ? futsal.image.startsWith("http")
                          ? futsal.image
                          : `http://127.0.0.1:8000${futsal.image}`
                        : defaultImage
                    }
                    alt={futsal.name}
                    className="w-40 h-40 mx-auto rounded-lg object-cover mb-3 cursor-pointer hover:opacity-80 border-2 border-gray-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = defaultImage;
                    }}
                  />
                </label>
                <input
                  type="file"
                  id={`futsal-photo-${futsal.id}`}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handlePhotoChange(futsal.id, e)}
                />

                {/* Info */}
                <h3 className="text-lg font-bold text-gray-800">
                  {futsal.name}
                </h3>
                <p className="text-sm text-gray-600">📍 {futsal.location}</p>
                <p className="text-sm text-gray-600">
                  📞 {futsal.contact_number}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  💰 Rs. {futsal.price_per_hour}/hr
                </p>
                <p className="text-gray-500 text-sm mb-4">
                  {futsal.description}
                </p>

                {/* Actions */}
                <div className="flex justify-center gap-4 mt-3">
                  <button
                    className="text-green-600 text-sm hover:underline"
                    onClick={() => navigate(`/edit-futsal/${futsal.id}`)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="text-red-600 text-sm hover:underline"
                    onClick={() => handleDelete(futsal.id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
