import { useNavigate } from "react-router-dom";

export default function Contact() {
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
          <button onClick={() => navigate("/contact")} className="underline">
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
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Contact Us
        </h1>
        <form className="max-w-lg mx-auto space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-gray-700 font-semibold mb-1"
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Your Name"
              required
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-gray-700 font-semibold mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-gray-700 font-semibold mb-1"
            >
              Message
            </label>
            <textarea
              id="message"
              rows={5}
              className="w-full p-2 border border-gray-300 rounded resize-none"
              placeholder="Write your message here..."
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Send Message
          </button>
        </form>
      </main>

      {/* Footer */}
      <footer className="bg-blue-600 text-white text-center p-4 mt-8">
        © 2025 HamroFutsal. All rights reserved.
      </footer>
    </div>
  );
}
