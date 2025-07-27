import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function EditFutsal() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    contact_number: "",
    price_per_hour: "",
    description: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetch(`http://127.0.0.1:8000/api/futsals/${id}/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch futsal data");
        return res.json();
      })
      .then((data) => setFormData(data))
      .catch((err) => {
        console.error(err);
        navigate("/dashboard");
      });
  }, [id, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    fetch(`http://127.0.0.1:8000/api/futsals/${id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(formData),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update");
        return res.json();
      })
      .then(() => {
        alert("Futsal updated successfully!");
        navigate("/my-futsal");
      })
      .catch((err) => {
        console.error(err);
        alert("Error updating futsal.");
      });
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Edit Futsal</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Futsal Name"
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Location"
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="text"
          name="contact_number"
          value={formData.contact_number}
          onChange={handleChange}
          placeholder="Contact Number"
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="number"
          name="price_per_hour"
          value={formData.price_per_hour}
          onChange={handleChange}
          placeholder="Price per hour"
          className="w-full border px-3 py-2 rounded"
        />
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
          className="w-full border px-3 py-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Update Futsal
        </button>
      </form>
    </div>
  );
}
