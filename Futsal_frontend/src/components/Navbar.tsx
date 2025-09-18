// src/components/Navbar.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/home/logo.png";

export default function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { name: "About Us", href: "/about" },
    { name: "Contact Us", href: "/contact" },
    { name: "Register", href: "/register" },
    { name: "Login", href: "/login" },
  ];

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <nav
      className="fixed top-3 left-1/2 -translate-x-1/2 w-[90%] md:w-[80%] lg:w-[70%]
                 bg-gradient-to-r from-green-600/80 to-emerald-700/80 text-white backdrop-blur-md
                 shadow-lg rounded-2xl px-6 py-3 z-50 flex items-center justify-between"
    >
      {/* Left: Logo */}
      <div
        className="text-2xl font-bold cursor-pointer flex items-center gap-2"
        onClick={() => navigate("/")}
      >
        <img src={logo} alt="Logo" className="w-16 h-16" />
      </div>

      {/* Desktop Links */}
      <div className="hidden md:flex items-center gap-4">
        {links.map((link, i) => (
          <button
            key={i}
            onClick={() => navigate(link.href!)}
            className="font-medium px-4 py-2 rounded-lg  transition-all hover:bg-white/20"
          >
            {link.name}
          </button>
        ))}
      </div>

      {/* Mobile Hamburger */}
      <div className="md:hidden">
        <button className="text-3xl" onClick={() => setMenuOpen((v) => !v)}>
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 mx-4 rounded-2xl bg-green-700/70 backdrop-blur-md shadow-lg p-4 flex flex-col gap-3 md:hidden z-40">
          {links.map((link, i) => (
            <button
              key={i}
              onClick={() => {
                navigate(link.href!);
                setMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2  bg-white/10 rounded-2xl backdrop-blur-md transition-all hover:bg-white/20"
            >
              {link.name}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
