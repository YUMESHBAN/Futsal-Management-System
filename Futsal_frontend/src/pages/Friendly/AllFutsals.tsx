import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MapPin, Phone } from "lucide-react";
import { API_BASE_URL } from "../../utils/api";
import placeholder from "../../assets/home.png";
import Footer from "../../components/FooterIN";
import Header from "../../components/header";

interface Futsal {
  id: number;
  name: string;
  location: string;
  contact_number: string;
  price_per_hour: string;
  description: string;
  image?: string;
}

export default function AllFutsals() {
  const [futsals, setFutsals] = useState<Futsal[]>([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    axios
      .get(`${API_BASE_URL}/futsals/`, {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => setFutsals(res.data))
      .catch((err) => console.error("Failed to load futsals", err));
  }, [navigate]);

  const filteredFutsals = futsals.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleBookNow = (futsalId: number) => {
    // Navigate to InviteTeam page with selected futsal ID as query param
    navigate(`/invite-team?futsal=${futsalId}`);
  };

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
            All <span className="text-[#2E8B57]">Futsal Venues</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore futsal grounds, compare prices, and book instantly.
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-12">
          <input
            type="text"
            placeholder="Search futsals by name or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-2/3 px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2E8B57]"
          />
        </div>

        {/* Futsals Grid */}
        {filteredFutsals.length === 0 ? (
          <p className="text-gray-500 text-center">No futsals found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFutsals.map((futsal) => (
              <div
                key={futsal.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2 duration-300 overflow-hidden border border-gray-100"
              >
                {/* Image */}
                <img
                  src={futsal.image || placeholder}
                  alt={futsal.name}
                  className="w-full h-48 object-cover"
                />

                {/* Card Content */}
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {futsal.name}
                  </h2>

                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                    <MapPin className="w-4 h-4 text-[#2E8B57]" />
                    <span>{futsal.location}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                    <Phone className="w-4 h-4 text-[#2E8B57]" />
                    <span>{futsal.contact_number}</span>
                  </div>

                  <p className="text-gray-700 font-semibold mb-2">
                    Rs. {futsal.price_per_hour}/hr
                  </p>

                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                    {futsal.description}
                  </p>

                  {/* Book Now Button */}
                  <button
                    onClick={() => handleBookNow(futsal.id)}
                    className="w-full bg-[#2E8B57] text-white py-2 rounded-xl font-semibold hover:bg-[#256D45] transition"
                  >
                    Book Now
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
