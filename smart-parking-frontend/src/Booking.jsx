import { useState } from "react";
import { BASE_URL } from "../config";

function Booking() {
  const [form, setForm] = useState({
    user_id: "",
    location: "",
    slot: "",
    vehicle_type: "Normal",
    vehicle_number: "",
    phone: "",
    hours: "",
    amount: "",
    payment_mode: "UPI",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const bookSlot = async () => {
    try {
      const res = await fetch(`${BASE_URL}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      alert(data.message);
    } catch (error) {
      alert("Booking failed");
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Book Parking Slot</h2>

      <input name="user_id" placeholder="User ID" onChange={handleChange} />
      <br />
      <input name="location" placeholder="Location" onChange={handleChange} />
      <br />

      <select name="vehicle_type" onChange={handleChange}>
        <option value="Normal">Normal</option>
        <option value="Electric">Electric</option>
      </select>
      <br />

      <input name="slot" placeholder="Slot (N1 / E1)" onChange={handleChange} />
      <br />
      <input
        name="vehicle_number"
        placeholder="Vehicle Number"
        onChange={handleChange}
      />
      <br />
      <input name="phone" placeholder="Phone Number" onChange={handleChange} />
      <br />
      <input name="hours" placeholder="Hours" onChange={handleChange} />
      <br />
      <input name="amount" placeholder="Amount" onChange={handleChange} />
      <br />

      <select name="payment_mode" onChange={handleChange}>
        <option value="UPI">UPI</option>
        <option value="Cash">Cash</option>
      </select>
      <br />

      <button onClick={bookSlot}>Book Now</button>
    </div>
  );
}

export default Booking;
