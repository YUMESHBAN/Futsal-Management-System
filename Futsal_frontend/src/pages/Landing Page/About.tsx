import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import logo from "../../assets/home/logo.png";
import about from "../../assets/about/about.jpg";
import mission from "../../assets/about/ourMission.jpg";
import vision from "../../assets/about/ourVision.jpg";
import belief from "../../assets/about/ourBelief.jpg";
import philo from "../../assets/about/ourPhilosophy.jpg";

export default function About() {
  const navigate = useNavigate();

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
        <div className="space-x-4">
          <button
            onClick={() => navigate("/about")}
            className="font-semibold px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm transition-all hover:bg-white/20"
          >
            About Us
          </button>
          <button
            onClick={() => navigate("/contact")}
            className="font-medium px-4 py-2 rounded-lg transition-all hover:bg-white/10"
          >
            Contact Us
          </button>
          <button
            onClick={() => navigate("/register")}
            className="font-medium px-4 py-2 rounded-lg transition-all hover:bg-white/10"
          >
            Register
          </button>
          <button
            onClick={() => navigate("/login")}
            className="font-medium px-4 py-2 rounded-lg transition-all hover:bg-white/10"
          >
            Login
          </button>
        </div>
      </nav>

      {/* Main Content */}

      <main className="flex-grow max-w-6xl mx-auto px-6 md:px-8 my-12 space-y-16">
        {/* About Section */}
        <div className="relative min-h-screen flex items-center justify-center p-6">
          {/* Background container with rounded corners */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            <div
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${about})` }}
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60"></div>
          </div>

          {/* Content */}
          <div className="relative grid md:grid-cols-2 gap-12 items-center z-10 text-white max-w-6xl">
            {/* Left Image */}
            <div className="flex justify-center">
              <img
                src={about}
                alt="About HamroFutsal"
                className="rounded-2xl shadow-2xl object-cover w-full max-w-md aspect-square"
              />
            </div>

            {/* Right Text */}
            <div className="space-y-6 text-left md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold">
                About HamroFutsal
              </h2>
              <div className="w-20 h-1 bg-green-400  rounded-full mb-6"></div>
              <p className="leading-relaxed text-lg">
                <strong>HamroFutsal</strong> is a modern platform designed to
                revolutionize the futsal experience in Nepal. From{" "}
                <strong>matchmaking</strong> and <strong>team creation</strong>{" "}
                to <strong>venue booking</strong> and{" "}
                <strong>digital payments</strong>, we make playing futsal
                simpler, smarter, and more connected.
              </p>
              <p className="leading-relaxed">
                Our mission is to bring players, futsal owners, and communities
                together on one seamless platform that enhances both the
                <strong> competitive spirit </strong> and the{" "}
                <strong>love of the game</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Mission, Vision, Values */}
        <section>
          <h3 className="text-3xl font-semibold mb-10 text-left">Our DNA</h3>
          <div className="w-20 h-1 bg-green-400 rounded-full mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[
              {
                title: "MISSION",
                text: "Empowering futsal players and owners with a digital-first ecosystem that simplifies play, bookings, and payments.",
                image: mission,
              },
              {
                title: "VISION",
                text: "To become Nepal’s #1 platform for futsal, connecting communities through sport and technology.",
                image: vision,
              },
              {
                title: "VALUES",
                text: "We believe in fair play, inclusivity, and making futsal accessible for everyone.",
                image: belief,
              },
              {
                title: "PHILOSOPHY",
                text: "Evolving continuously to provide smarter, faster, and more enjoyable futsal experiences.",
                image: philo,
              },
            ].map((card) => (
              <div
                key={card.title}
                className="relative rounded-2xl overflow-hidden shadow-lg h-56 md:h-64 group"
              >
                {/* Background Image */}
                <img
                  src={card.image}
                  alt={card.title}
                  className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition duration-500"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/60 group-hover:bg-black/70 transition duration-300" />

                {/* Text Content */}
                <div className="relative z-10 flex flex-col justify-center h-full p-6 text-white">
                  <h4 className="uppercase font-bold text-lg">
                    OUR <span className="text-green-400">{card.title}</span>
                  </h4>
                  <p className="mt-2 text-sm md:text-base leading-snug opacity-90">
                    {card.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="space-y-6">
          <h2 className="text-3xl font-semibold mb-10 text-left">
            Why Choose HamroFutsal?
          </h2>
          <div className="w-20 h-1 bg-green-400 rounded-full mb-6"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-green-200 text-center transition-all hover:shadow-2xl hover:border-green-400">
              <div className="text-5xl mb-4 text-green-600">🏃‍♂️</div>
              <h3 className="text-2xl font-bold mb-2 text-gray-800">
                Easy Booking
              </h3>
              <p className="text-gray-600 text-lg">
                Quickly reserve futsal grounds without hassle. Focus on your
                game!
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-green-200 text-center transition-all hover:shadow-2xl hover:border-green-400">
              <div className="text-5xl mb-4 text-green-600">📊</div>
              <h3 className="text-2xl font-bold mb-2 text-gray-800">
                Venue Management
              </h3>
              <p className="text-gray-600 text-lg">
                Powerful tools for futsal owners to manage bookings and maintain
                venues.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-green-200 text-center transition-all hover:shadow-2xl hover:border-green-400">
              <div className="text-5xl mb-4 text-green-600">⚡</div>
              <h3 className="text-2xl font-bold mb-2 text-gray-800">
                Fast & Reliable
              </h3>
              <p className="text-gray-600 text-lg">
                Our platform is fast, reliable, and optimized for players and
                venue owners alike.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
