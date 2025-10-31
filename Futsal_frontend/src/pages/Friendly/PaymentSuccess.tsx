import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      // If no token, user is not authenticated, redirect to login
      navigate("/login");
      return;
    }

    // eSewa sends query params like ?data=...
    const query = new URLSearchParams(location.search);
    const encodedData = query.get("data");

    if (!encodedData) return;

    const paymentData = JSON.parse(atob(encodedData)); // decode base64 JSON

    const acceptMatch = async () => {
      try {
        // Directly mark the match as accepted without verifying the payment
        const matchId = paymentData.transaction_uuid.split("_")[0]; // Extract match ID from transaction UUID
        
        await axios.post(`http://127.0.0.1:8000/api/team-matches/${matchId}/accept/`, {}, {
          headers: { Authorization: `Token ${token}` },
        });
        
        // Redirect to /matches after accepting the match
        navigate("/matches");
      } catch (err) {
        console.error("Error accepting match:", err);
        alert("Error while accepting match.");
        navigate("/matches");
      }
    };

    acceptMatch();
  }, [location.search, navigate]);

  return <div className="text-center mt-10">Payment successful! Redirecting...</div>;
}
