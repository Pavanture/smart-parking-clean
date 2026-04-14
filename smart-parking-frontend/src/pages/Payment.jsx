import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";

function Payment() {
  const navigate = useNavigate();

  const pendingBooking = JSON.parse(
    localStorage.getItem("pendingBooking") || "{}",
  );

  const spotName = pendingBooking?.spotName || "";
  const parkingType = pendingBooking?.parkingType || "";
  const selectedSlots = pendingBooking?.selectedSlots || [];
  const hours = Number(pendingBooking?.hours) || 1;
  const hourlyRate = Number(pendingBooking?.hourlyRate) || 0;
  const start_time = pendingBooking?.start_time || new Date().toISOString();

  const [method, setMethod] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [upiId, setUpiId] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const bookingTotal = useMemo(() => {
    return hourlyRate * hours;
  }, [hourlyRate, hours]);

  useEffect(() => {
    if (!spotName || !parkingType || selectedSlots.length === 0) {
      setError(
        "Booking details missing. Please go back and select slot again.",
      );
    }
  }, [spotName, parkingType, selectedSlots]);

  const validate = () => {
    if (!vehicleNumber.trim() || !phone.trim()) {
      return "Please enter vehicle number and phone number";
    }

    if (phone.trim().length < 10) {
      return "Please enter a valid phone number";
    }

    if (method === "card") {
      if (
        !cardNumber.trim() ||
        !cardName.trim() ||
        !expiry.trim() ||
        !cvv.trim()
      ) {
        return "Please fill payment details";
      }
    }

    if (method === "upi") {
      if (!upiId.includes("@")) {
        return "Please enter a valid UPI ID";
      }
    }

    return "";
  };

  const makePayment = async () => {
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    const payload = {
      user_id: user?.id || "",
      location: spotName || "",
      slot: selectedSlots.length > 0 ? selectedSlots[0] : "",
      vehicle_type: parkingType === "electric" ? "Electric" : "Normal",
      vehicle_number: vehicleNumber.trim(),
      phone: phone.trim(),
      hours: Number(hours) || 0,
      amount: Number(bookingTotal) || 0,
      payment_mode: method ? method.toUpperCase() : "",
      start_time: start_time || new Date().toISOString(),
    };

    if (
      !payload.user_id ||
      !payload.location ||
      !payload.slot ||
      !payload.vehicle_type ||
      !payload.hours ||
      !payload.amount ||
      !payload.payment_mode
    ) {
      setError(
        "Booking details missing. Please go back and select slot again.",
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${BASE_URL}/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || data.message || "Payment failed");
        return;
      }

      localStorage.removeItem("pendingBooking");
      alert("Payment successful ✅");
      navigate("/my-bookings");
    } catch (err) {
      console.log("PAYMENT ERROR:", err);
      setError("Network or server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-blue-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-2">Payment</h2>

        <p className="text-sm text-gray-500 mb-6">
          Booking for <strong>{spotName || "N/A"}</strong> (
          {parkingType || "N/A"}) • Slot:{" "}
          {selectedSlots.length > 0 ? selectedSlots[0] : "N/A"} • {hours} hr
        </p>

        <div className="space-y-4 mb-6">
          <input
            type="text"
            placeholder="Vehicle Number"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
            className="w-full p-3 border rounded-lg"
          />

          <input
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-3 border rounded-lg"
          />

          <div className="flex gap-3">
            <label>
              <input
                type="radio"
                checked={method === "card"}
                onChange={() => setMethod("card")}
              />{" "}
              Card
            </label>

            <label>
              <input
                type="radio"
                checked={method === "upi"}
                onChange={() => setMethod("upi")}
              />{" "}
              UPI
            </label>

            <label>
              <input
                type="radio"
                checked={method === "cash"}
                onChange={() => setMethod("cash")}
              />{" "}
              Cash
            </label>
          </div>

          {method === "card" && (
            <>
              <input
                type="text"
                placeholder="Card Number"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Name on Card"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Expiry"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="password"
                placeholder="CVV"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                className="w-full p-3 border rounded-lg"
              />
            </>
          )}

          {method === "upi" && (
            <input
              type="text"
              placeholder="UPI ID"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="w-full p-3 border rounded-lg"
            />
          )}

          {method === "cash" && (
            <p className="text-gray-600">Pay at parking location</p>
          )}

          <div className="bg-gray-50 p-4 rounded-lg">
            <p>Total Amount</p>
            <p className="text-2xl font-bold">₹{bookingTotal}</p>
            <p className="text-red-600 text-sm mt-2">
              Extra ₹10 per 15 minutes after expiry
            </p>
          </div>

          {error && <p className="text-red-600 font-medium">{error}</p>}

          <div className="flex gap-3">
            <button
              onClick={makePayment}
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-lg"
            >
              {loading ? "Processing..." : "Pay Now"}
            </button>

            <button
              onClick={() => navigate("/home")}
              className="flex-1 bg-gray-200 py-3 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;
