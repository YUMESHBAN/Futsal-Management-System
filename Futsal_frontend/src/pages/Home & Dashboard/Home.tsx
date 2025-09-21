import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import soccerVideo from "../../assets/home/soccer.mp4";
import fallback from "../../assets/about/ourMission.jpg";

import yumesh from "../../assets/home/yumesh.jpg";
import sujal from "../../assets/home/sujal.jpg";
import rupesh from "../../assets/home/rupesh.jpg";

import goal from "../../assets/home/goal.png";
import front from "../../assets/home/front.png";
import back from "../../assets/home/back.png";

import footer from "../../assets/home/footer.jpg";
import { Users, Calendar, MapPin, Clock } from "lucide-react";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function Home() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {/* ---------- Hero Section ---------- */}
      <div className="relative md:h-[700px] lg:h-[700px] overflow-hidden">
        {/* Background Video */}
        <video
          className="absolute inset-0 w-full h-full object-cover -z-10"
          src={soccerVideo}
          autoPlay
          loop
          muted
          playsInline
          poster={fallback}
        />
        <div className="absolute inset-0 bg-black/60"></div>

        {/* Hero Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute bottom-0 left-0 w-full px-6 md:px-12 py-8 text-left"
        >
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl md:text-7xl font-bold text-green-500 drop-shadow-lg leading-tight">
              Welcome to HamroFutsal
            </h1>
            <h2 className="text-xl md:text-4xl font-bold text-white drop-shadow-lg leading-tight mt-2">
              Nepal's premier platform connecting futsal enthusiasts with the
              best venues.
            </h2>
            <p className="text-base md:text-xl text-white drop-shadow-lg leading-relaxed mt-4">
              Whether you're a player looking for your next match or a venue
              owner managing your facility, HamroFutsal makes your futsal
              experience seamless and enjoyable.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mt-6">
              <Link
                to="/register"
                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition"
              >
                Register
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 bg-white text-green-700 font-semibold rounded-xl hover:bg-green-100 transition"
              >
                Login
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* About Section */}
      <section id="about" className="py-16 px-6 md:px-16 bg-gray-50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10">
          {/* Text */}
          <div className="flex-1 text-center md:text-left">
            <span className="inline-block bg-green-200 text-green-700 text-xl md:text-2xl px-4 py-2 rounded-full mb-3 shadow-md">
              About Us
            </span>
            <div className="w-20 h-1 bg-green-400 rounded-full mb-6"></div>
            <div className="max-w-3xl mx-auto text-center md:text-left py-10 px-6 space-y-6">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                HamroFutsal
              </h1>
              <p className="text-gray-600 text-lg md:text-xl leading-relaxed">
                Connects players and venue owners across Nepal, providing easy
                booking, team management, and match organization tools. Join our
                growing futsal community today!
              </p>
              <button
                onClick={() => navigate("/about")}
                className="font-semibold px-6 py-3 rounded-xl bg-white/10 backdrop-blur-sm text-gray-800
               transition-all duration-300 hover:bg-green-200 hover:scale-105 hover:shadow-lg"
              >
                Read More →
              </button>
            </div>
          </div>

          {/* Images */}
          <div className="flex-1 flex justify-center md:justify-end relative">
            <img
              src={goal}
              alt="Red Base"
              className="w-64 md:w-96 lg:w-[500px] object-contain"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-6 md:px-16 bg-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <div className="bg-white shadow-md rounded-xl p-6 text-center hover:shadow-lg transition">
            <Users className="mx-auto text-green-500 w-8 h-8 mb-2" />
            <p className="text-green-600 text-3xl md:text-4xl font-bold">50+</p>
            <p className="mt-1 text-gray-600">Users</p>
          </div>
          <div className="bg-white shadow-md rounded-xl p-6 text-center hover:shadow-lg transition">
            <Calendar className="mx-auto text-green-500 w-8 h-8 mb-2" />
            <p className="text-green-600 text-3xl md:text-4xl font-bold">
              100+
            </p>
            <p className="mt-1 text-gray-600">Bookings</p>
          </div>
          <div className="bg-white shadow-md rounded-xl p-6 text-center hover:shadow-lg transition">
            <MapPin className="mx-auto text-green-500 w-8 h-8 mb-2" />
            <p className="text-green-600 text-3xl md:text-4xl font-bold">10+</p>
            <p className="mt-1 text-gray-600">Futsal Venues</p>
          </div>
          <div className="bg-white shadow-md rounded-xl p-6 text-center hover:shadow-lg transition">
            <Clock className="mx-auto text-green-500 w-8 h-8 mb-2" />
            <p className="text-green-600 text-3xl md:text-4xl font-bold">5K+</p>
            <p className="mt-1 text-gray-600">Hours Played</p>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 px-6 md:px-20 bg-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-green-700 mb-12">
          The Problem We're Solving
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Problem 1 */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-100">
              <span className="text-red-500 text-2xl">📞</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Multiple Calls
            </h3>
            <p className="text-gray-600 text-sm">
              Players had to call numerous venues just to check availability,
              often waiting on hold or getting incomplete information.
            </p>
          </div>

          {/* Problem 2 */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-100">
              <span className="text-red-500 text-2xl">⚠️</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Uncertain Availability
            </h3>
            <p className="text-gray-600 text-sm">
              No way to know which courts were available without directly
              contacting each venue, leading to wasted time and missed
              opportunities.
            </p>
          </div>

          {/* Problem 3 */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-100">
              <span className="text-red-500 text-2xl">📅</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Manual Scheduling
            </h3>
            <p className="text-gray-600 text-sm">
              Booking and payment processes were manual and inefficient, with no
              way to easily manage or reschedule bookings.
            </p>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-16 px-6 md:px-20 bg-green-50 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-green-700 mb-8">
          Our Solution: HamroFutsal
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Solution Points */}
          <div className="text-left space-y-4">
            <p className="flex items-start gap-3">
              <span className="text-green-600 text-xl">✔</span>
              Instant visibility of all available futsal courts in your area
            </p>
            <p className="flex items-start gap-3">
              <span className="text-green-600 text-xl">✔</span>
              Online booking and payment system that eliminates the need for
              calls
            </p>
            <p className="flex items-start gap-3">
              <span className="text-green-600 text-xl">✔</span>
              User profiles to track booking history and venues
            </p>
            <p className="flex items-start gap-3">
              <span className="text-green-600 text-xl">✔</span>
              Venue and Score management tools for futsal owners to optimize
              their business
            </p>
            <p className="flex items-start gap-3">
              <span className="text-green-600 text-xl">✔</span>
              Recommendation System to provide competitive matches.
            </p>
          </div>

          <div className="flex-1 flex justify-center md:justify-end relative">
            <img
              src={front}
              alt="Player UI"
              className="w-64 md:w-96 lg:w-[500px] object-contain"
            />

            <img
              src={back}
              alt="Futsal Owner UI"
              className="w-64 md:w-96 lg:w-[500px] object-contain absolute top-10 left-10"
            />
          </div>
        </div>
      </section>

      {/* Meet Our Team Section */}
      <section className="py-16 px-6 md:px-20 bg-gray-50 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-green-700 mb-2">
          Meet Our Team
        </h2>
        <p className="text-gray-600 mb-10">
          The passionate minds behind HamroFutsal
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Team Member 1 */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="w-32 h-32 mx-auto mb-4 overflow-hidden rounded-full border-4 border-green-600">
              <img
                src={rupesh}
                alt="Rupesh Acharya"
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">
              Rupesh Acharya
            </h3>
            <p className="text-green-600 font-medium mb-2">
              Frontend Developer
            </p>
            <p className="text-gray-600 text-sm">
              Rupesh crafts the intuitive user interfaces that make HamroFutsal
              a joy to use, focusing on user experience and accessibility.
            </p>
          </div>

          {/* Team Member 2 */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="w-32 h-32 mx-auto mb-4 overflow-hidden rounded-full border-4 border-green-600">
              <img
                src={sujal}
                alt="Sujal Karki"
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Sujal Karki</h3>
            <p className="text-green-600 font-medium mb-2">Backend Developer</p>
            <p className="text-gray-600 text-sm">
              Sujal brings robust backend architecture to HamroFutsal, ensuring
              our platform handles bookings efficiently and securely.
            </p>
          </div>

          {/* Team Member 3 */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="w-32 h-32 mx-auto mb-4 overflow-hidden rounded-full border-4 border-green-600">
              <img
                src={yumesh}
                alt="Yumesh Ban"
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Yumesh Ban</h3>
            <p className="text-green-600 font-medium mb-2">
              Fullstack Developer
            </p>
            <p className="text-gray-600 text-sm">
              Yumesh specializes in building and maintaining both the frontend
              and backend of HamroFutsal, ensuring a seamless, secure, and
              scalable experience across all devices.
            </p>
          </div>
        </div>
      </section>

      {/* Above Footer Section */}
      <section className="relative bg-white px-6 md:px-16 pt-16 pb-0">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-10">
          <div className="space-y-6 relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 leading-snug">
              Join the Futsal Community in{" "}
              <span className="text-green-600">Kathmandu</span>
            </h2>
            <Link
              to="/register"
              className="inline-block px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition"
            >
              Register Now
            </Link>
          </div>

          <div className="flex justify-center md:justify-end relative">
            <img
              src={footer}
              alt="Futsal Community"
              className="w-80 md:w-[420px] lg:w-[520px] object-contain "
            />
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
