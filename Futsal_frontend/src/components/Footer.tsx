import { Mail, Phone, MapPin } from "lucide-react";
import logo from "../assets/home/logo.png";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-green-700 to-emerald-700 text-white relative px-8 md:px-20 py-12">
      <div className="grid md:grid-cols-2 gap-12">
        {/* Left Section: About + Quick Links */}
        <div>
          <h2 className="text-3xl font-bold mb-6 text-[#F1C40F]">
            HamroFutsal
          </h2>
          <p className="text-gray-300 mb-6 max-w-md">
            The complete futsal solution – manage matches, teams, and bookings
            effortlessly. One platform for players, organizers, and fans.
          </p>

          <div className="flex flex-wrap gap-6 text-sm text-gray-300">
            <a
              href="/about"
              className="hover:text-[#F1C40F] transition-colors duration-200"
            >
              About Us
            </a>
            <a
              href="/contact"
              className="hover:text-[#F1C40F] transition-colors duration-200"
            >
              Contact Us
            </a>
            <a
              href="/register"
              className="hover:text-[#F1C40F] transition-colors duration-200"
            >
              Register
            </a>
            <a
              href="/login"
              className="hover:text-[#F1C40F] transition-colors duration-200"
            >
              Login
            </a>
          </div>
        </div>

        {/* Right Section: Contact Info */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-[#F1C40F]">Contact Us</h3>

          <div className="flex items-center gap-3 text-gray-300">
            <Phone className="w-5 h-5 text-[#F1C40F]" />
            <p>+977-986******</p>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <Mail className="w-5 h-5 text-[#F1C40F]" />
            <p>hamrofutsal41@gmail.com</p>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <MapPin className="w-5 h-5 text-[#F1C40F]" />
            <p>Kathmandu, Nepal</p>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-12 border-t border-gray-700 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Logo & Description */}
        <div className="flex items-start gap-4 max-w-xl">
          <div>
            <img src={logo} alt="Logo" className="w-16 h-16" />
            <h4 className="font-semibold text-[#F1C40F] text-xl">
              HAMROFUTSAL
            </h4>
            <p className="text-sm text-gray-300">
              Complete solution in one click
            </p>
          </div>
        </div>

        {/* Credits */}
        <p className="text-sm text-gray-200 text-center md:text-right w-full md:w-auto">
          © 2025 HAMROFUTSAL.KTM , NEPAL <br />
          <span className="text-gray-300">
            Designed & Developed by{" "}
            <span className="font-bold">Sujal, Rupesh & Yumesh</span>
          </span>
        </p>
      </div>
    </footer>
  );
}
