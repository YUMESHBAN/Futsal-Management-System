import React, { useEffect, useState } from "react";
import api from "../api/axios";

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    api
      .get("bookings/")
      .then((res) => setBookings(res.data))
      .catch((err) => alert("Failed to load bookings"));
  }, []);

  return (
    <div>
      <h2>My Bookings</h2>
      <ul>
        {bookings.map((b) => (
          <li key={b.id}>
            📅 {b.date} at 🕒 {b.time} — {b.venue}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BookingsPage;
