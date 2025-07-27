import { useNavigate } from "react-router-dom";

export default function About() {
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
          <button onClick={() => navigate("/about")} className="underline">
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

      {/* Content */}
      <main className="flex-grow max-w-4xl mx-auto p-8 bg-gray-50 rounded mt-8 shadow">
        <h1 className="text-3xl font-bold mb-4 text-center text-gray-800">
          About HamroFutsal
        </h1>
        <p className="text-gray-700 leading-relaxed text-lg">
          HamroFutsal is a premier platform dedicated to connecting futsal
          enthusiasts with venues across Nepal. We strive to make booking,
          managing, and discovering futsal grounds easy and hassle-free.
        </p>
        <p className="text-gray-700 leading-relaxed text-lg mt-4">
          Whether you're a player looking for your next match or an owner
          managing your venue, HamroFutsal is here to help. Join us and be part
          of Nepal's growing futsal community!
        </p>
      </main>

      {/* Footer */}
      <footer className="bg-blue-600 text-white text-center p-4 mt-8">
        © 2025 HamroFutsal. All rights reserved.
      </footer>
    </div>
  );
}
