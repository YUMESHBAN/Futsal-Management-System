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
      <div className=" bg-gradient-to-br from-green-50 to-green-100 p-10">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-green-700 pt-5 ">
            🏟️ My Futsal
          </h1>
        </div>

        {/* Empty State */}
        {futsals.length === 0 ? (
          /* Empty State */
          <div className="flex justify-center items-center">
            <div className="bg-white px-10 py-12 rounded-2xl shadow-lg text-center max-w-md">
              <div className="text-5xl mb-4">🚫</div>
              <h2 className="text-2xl font-bold text-gray-700 mb-2">
                No futsal found
              </h2>
              <p className="text-gray-500 mb-6">
                You haven’t created a futsal yet. Start by adding your venue so
                players can discover and book it.
              </p>
              <button
                onClick={() => navigate("/create-futsal")}
                className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-700 transition duration-300"
              >
                + Create My Futsal
              </button>
            </div>
          </div>
        ) : (
          futsals.map((futsal) => (
            <div
              key={futsal.id}
              className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden mb-10"
            >
              {/* Hero Image */}
              <div className="relative h-80 md:h-96 lg:h-[450px] overflow-hidden">
                <img
                  src={
                    futsal.image?.startsWith("http")
                      ? futsal.image
                      : // eslint-disable-next-line no-constant-binary-expression
                        `http://127.0.0.1:8000${futsal.image}` || defaultImage
                  }
                  alt={futsal.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) =>
                    ((e.target as HTMLImageElement).src = defaultImage)
                  }
                />
                <div className="absolute inset-0 bg-black/20"></div>

                {/* Text Overlay */}
                <div className="absolute bottom-8 left-8 z-10">
                  <h1 className="text-4xl md:text-5xl font-extrabold text-green-400 drop-shadow-lg">
                    {futsal.name}
                  </h1>
                  <p className="mt-3 text-lg text-gray-100 max-w-lg drop-shadow-md">
                    {futsal.description}
                  </p>
                </div>

                {/* Hidden file input on top for click */}
                <input
                  type="file"
                  id={`futsal-photo-${futsal.id}`}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept="image/*"
                  onChange={(e) => handlePhotoChange(futsal.id, e)}
                />
              </div>

              {/* Details Section */}
              <div className="p-8 space-y-4 text-gray-700 text-base">
                <div className="flex items-center gap-2">
                  📍 <span>{futsal.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  📞 <span>{futsal.contact_number}</span>
                </div>
                <div className="flex items-center gap-2">
                  💰{" "}
                  <span className="font-semibold">
                    Rs. {futsal.price_per_hour}/hr
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-center gap-6 pb-8">
                <button
                  className="px-6 py-2.5 rounded-lg bg-green-600 text-white font-semibold shadow hover:bg-green-700 hover:shadow-md transition"
                  onClick={() => navigate(`/edit-futsal/${futsal.id}`)}
                >
                  ✏️ Edit
                </button>
                <button
                  className="px-6 py-2.5 rounded-lg bg-red-500 text-white font-semibold shadow hover:bg-red-600 hover:shadow-md transition"
                  onClick={() => handleDelete(futsal.id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      <Footer />
    </div>
  );
}
