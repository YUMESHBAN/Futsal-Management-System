import { useEffect, useState } from "react";
import axios from "axios";

interface Payment {
  id: number;
  match_id: number;
  payment_method: string;
  amount: string;
  status: string;
  timestamp: string;
  match_info: string; // We'll build this from match details later
}

export default function PaymentHistory() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/payments/history/", {
        headers: {
          Authorization: `Token ${token}`,
        },
      })
      .then((res) => {
        setPayments(res.data);
      })
      .catch(() => {
        setPayments([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  if (loading) return <p className="text-center mt-10">Loading payments...</p>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-6 text-center">Payment History</h2>

      {payments.length === 0 ? (
        <p className="text-center text-gray-500">No payment history found.</p>
      ) : (
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">#</th>
              <th className="p-2 border">Match</th>
              <th className="p-2 border">Method</th>
              <th className="p-2 border">Amount</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment, index) => (
              <tr key={payment.id} className="text-center hover:bg-gray-50">
                <td className="p-2 border">{index + 1}</td>
                <td className="p-2 border">Match #{payment.match_id}</td>
                <td className="p-2 border">{payment.payment_method}</td>
                <td className="p-2 border">Rs. {payment.amount}</td>
                <td
                  className={`p-2 border font-medium ${
                    payment.status === "success"
                      ? "text-green-600"
                      : payment.status === "failed"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}
                >
                  {payment.status}
                </td>
                <td className="p-2 border">
                  {new Date(payment.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
