import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";

function Payment() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const spotName = state?.spotName;
  const parkingType = state?.parkingType;
  const selectedSlots = state?.selectedSlots;
  const hours = state?.hours || 1;
  const hourlyRate = state?.hourlyRate || 0;
  const start_time = state?.start_time;

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
    if (!spotName || !parkingType || !selectedSlots?.length) {
      navigate("/home");
    }
  }, [navigate, parkingType, selectedSlots, spotName]);

  const validate = () => {
    if (!vehicleNumber.trim() || !phone.trim()) {
      return "Please enter vehicle number and phone number";
    }

    if (phone.trim().length < 10) {
      return "Please enter a valid phone number";
    }

    if (method === "card") {
      if (!cardNumber || !cardName || !expiry || !cvv) {
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

    setLoading(true);
    setError("");

    try {
      const payload = {
        user_id: user.id,
        location: spotName,
        slot: selectedSlots[0],
        vehicle_type: parkingType === "electric" ? "Electric" : "Normal",
        vehicle_number: vehicleNumber,
        phone: phone,
        hours: hours,
        amount: bookingTotal,
        payment_mode: method.toUpperCase(),
        start_time: start_time,
      };

      console.log("PAYMENT PAYLOAD:", payload);

      const res = await fetch(`${BASE_URL}/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("BOOK RESPONSE:", data);

      if (!res.ok) {
        setError(data.error || data.message || "Payment failed");
        return;
      }

      alert("Payment successful ✅");
      navigate("/my-bookings");
    } catch (error) {
      console.log("PAYMENT ERROR:", error);
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
          Booking for <strong>{spotName}</strong> ({parkingType}) • Slot:{" "}
          {selectedSlots?.[0]} • {hours} hr
        </p>

        <div className="space-y-4 mb-6">
          <input
            placeholder="Vehicle Number"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
            className="w-full p-3 border rounded-lg"
          />

          <input
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
                placeholder="Card Number"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="w-full p-3 border rounded-lg"
              />
              <input
                placeholder="Name on Card"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="w-full p-3 border rounded-lg"
              />
              <input
                placeholder="Expiry"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="w-full p-3 border rounded-lg"
              />
              <input
                placeholder="CVV"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                className="w-full p-3 border rounded-lg"
              />
            </>
          )}

          {method === "upi" && (
            <input
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
