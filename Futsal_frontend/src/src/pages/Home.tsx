import { useNavigate } from "react-router-dom";
import Image from "../assets/home.png";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
        <div
          className="text-xl font-bold cursor-pointer"
          onClick={() => navigate("/")}
        >
          HamroFutsal
        </div>
        <div className="space-x-6">
          <button
            onClick={() => navigate("/about")}
            className="hover:underline"
          >
            About Us
          </button>
          <button
            onClick={() => navigate("/contact")}
            className="hover:underline"
          >
            Contact Us
          </button>
          <button
            onClick={() => navigate("/register")}
            className="hover:underline"
          >
            Register
          </button>
          <button
            onClick={() => navigate("/login")}
            className="hover:underline"
          >
            Login
          </button>
        </div>
      </nav>

      {/* Hero / Main Section */}
      <main className="flex-grow bg-gray-50 p-8">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">
            Welcome to HamroFutsal!
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            Your one-stop platform for booking and managing futsal grounds
            across Kathmandu.
          </p>
          <img
            src={Image}
            alt="Futsal Ground"
            className="rounded-lg shadow-lg w-full h-[20rem] object-cover"
          />
        </div>

        {/* Info Sections */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-6 bg-white rounded shadow">
            <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
            <p className="text-gray-600">
              Book futsals online with real-time availability.
            </p>
          </div>
          <div className="p-6 bg-white rounded shadow">
            <h3 className="text-xl font-semibold mb-2">Owner Dashboard</h3>
            <p className="text-gray-600">
              Manage your futsal listings and schedules with ease.
            </p>
          </div>
          <div className="p-6 bg-white rounded shadow">
            <h3 className="text-xl font-semibold mb-2">Explore Nearby</h3>
            <p className="text-gray-600">
              Find the best futsals in your area based on reviews and distance.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-blue-600 text-white text-center p-4">
        © 2025 HamroFutsal. All rights reserved.
      </footer>
    </div>
  );
}
