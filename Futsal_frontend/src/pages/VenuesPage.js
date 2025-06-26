import React, { useEffect, useState } from "react";
import api from "../api/axios";

const VenuesPage = () => {
  const [venues, setVenues] = useState([]);
  const [booking, setBooking] = useState({ venue: "", date: "", time: "" });

  useEffect(() => {
    api
      .get("venues/")
      .then((res) => setVenues(res.data))
      .catch((err) => alert("Error fetching venues"));
  }, []);

  const handleBook = async () => {
    try {
      await api.post("bookings/", booking);
      alert("Booked successfully!");
    } catch (err) {
      alert("Booking failed");
    }
  };

  return (
    <div>
      <h2>Available Futsal Venues</h2>
      <ul>
        {venues.map((v) => (
          <li key={v.id}>
            <strong>{v.name}</strong> — {v.location}
            <button onClick={() => setBooking({ ...booking, venue: v.id })}>
              Select
            </button>
          </li>
        ))}
      </ul>

      <h3>Book Selected Venue</h3>
      <input
        type="date"
        onChange={(e) => setBooking({ ...booking, date: e.target.value })}
      />
      <input
        type="time"
        onChange={(e) => setBooking({ ...booking, time: e.target.value })}
      />
      <button onClick={handleBook}>Book Now</button>
    </div>
  );
};

export default VenuesPage;
