import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import logo from "../../assets/home/logo.png";
import { Mail, MapPin, Phone } from "lucide-react";
import { API_BASE_URL } from "../../utils/api";

export default function Contact() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Sending...");

    try {
      const response = await axios.post(`${API_BASE_URL}/contact/`, formData);
      setStatus(response.data.success || "Message sent!");
      setFormData({ name: "", email: "", subject: "", message: "" });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setStatus(err.response?.data?.error || "Failed to send message.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-green-600 to-emerald-700 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div
          className="text-2xl font-bold cursor-pointer flex items-center"
          onClick={() => navigate("/")}
        >
          <img src={logo} alt="Logo" className="w-16 h-16" />
        </div>
        <div className="space-x-6">
          <button
            onClick={() => navigate("/about")}
            className="font-medium px-3 py-1 rounded-lg transition-all hover:bg-white/10"
          >
            About Us
          </button>
          <button
            onClick={() => navigate("/contact")}
            className="font-semibold px-3 py-1 rounded-lg bg-white/10 backdrop-blur-sm transition-all hover:bg-white/20"
          >
            Contact Us
          </button>
          <button
            onClick={() => navigate("/register")}
            className="font-medium px-3 py-1 rounded-lg transition-all hover:bg-white/10"
          >
            Register
          </button>
          <button
            onClick={() => navigate("/login")}
            className="font-medium px-3 py-1 rounded-lg transition-all hover:bg-white/10"
          >
            Login
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-grow max-w-5xl mx-auto p-8 my-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-8 text-center relative">
            <div className="absolute top-4 right-4 opacity-20 text-6xl">⚽</div>
            <h1 className="text-4xl font-bold mb-2">Contact Us</h1>
            <p className="text-green-100 text-lg">
              We'd love to hear from you!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">
            {/* Contact Information */}
            {/* Contact Information */}
            <div className="md:col-span-1">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-2 pr-10 rounded-2xl shadow-md h-full border border-green-100">
                <h2 className="text-2xl font-bold text-emerald-800 mb-6">
                  Get in Touch
                </h2>

                <address className="not-italic space-y-6">
                  {/* Address */}
                  <div className="flex items-start">
                    <div className="bg-green-100 p-3 rounded-full mr-4 shadow-sm">
                      <MapPin className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Address</h3>
                      <p className="text-gray-600 leading-relaxed">
                        123 Futsal Road
                        <br />
                        Kathmandu, Nepal
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start">
                    <div className="bg-green-100 p-3 rounded-full mr-4 shadow-sm">
                      <Phone className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Phone</h3>
                      <p className="text-gray-600">
                        +977 1-1234567
                        <br />
                        +977 9840989962
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start">
                    <div className="bg-green-100 p-3 rounded-full mr-4 shadow-sm">
                      <Mail className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Email</h3>
                      <p className="text-gray-600">
                        info@hamrofutsal.com
                        <br />
                        support@hamrofutsal.com
                      </p>
                    </div>
                  </div>
                </address>

                {/* Social Links */}
                <div className="mt-8 pt-6 border-t border-green-200">
                  <h3 className="font-semibold text-gray-800 mb-4">
                    Follow Us
                  </h3>
                  <div className="flex space-x-4">
                    <a
                      href="#"
                      className="bg-green-100 text-green-600 p-2 rounded-full hover:bg-green-200 transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </a>
                    <a
                      href="#"
                      className="bg-green-100 text-green-600 p-2 rounded-full hover:bg-green-200 transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                      </svg>
                    </a>
                    <a
                      href="#"
                      className="bg-green-100 text-green-600 p-2 rounded-full hover:bg-green-200 transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="md:col-span-2">
              <div className="bg-white p-6 rounded-xl shadow-sm h-full border border-green-100">
                <h2 className="text-2xl font-semibold text-emerald-800 mb-6">
                  Send us a Message
                </h2>
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    required
                    className="w-full p-3 border border-green-200 rounded-lg"
                  />
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    required
                    className="w-full p-3 border border-green-200 rounded-lg"
                  />
                  <input
                    id="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What is this regarding?"
                    required
                    className="w-full p-3 border border-green-200 rounded-lg"
                  />
                  <textarea
                    id="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Write your message here..."
                    required
                    className="w-full p-3 border border-green-200 rounded-lg"
                  />

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
                  >
                    Send Message
                  </button>
                </form>
                {status && (
                  <p className="mt-4 text-center text-gray-700">{status}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
