import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PaymentFailure() {
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => navigate("/"), 8000);
  }, [navigate]);

  return (
    <div className="text-center mt-20">
      <h1 className="text-2xl font-bold text-red-600">❌ Payment Failed!</h1>
      <p className="mt-4">Please try again or contact support.</p>
    </div>
  );
}
