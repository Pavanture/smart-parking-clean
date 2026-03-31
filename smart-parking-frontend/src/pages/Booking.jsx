import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { BASE_URL } from "../config";

function Booking() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const spotName = state?.spotName || "Selected Parking";
  const hourlyRate = state?.hourlyRate || 0;

  const [parkingType, setParkingType] = useState("normal");
  const [hours, setHours] = useState(1);
  const [startHour, setStartHour] = useState(13);
  const [bookingDate, setBookingDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });

  const [selectedSlots, setSelectedSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  const slots = useMemo(() => {
    if (parkingType === "electric") {
      return ["E1", "E2"];
    }
    return ["N1", "N2", "N3", "N4", "N5"];
  }, [parkingType]);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const vehicleType = parkingType === "electric" ? "Electric" : "Normal";

        const res = await fetch(
          `${BASE_URL}/available-slots/${spotName}/${vehicleType}`,
        );
        const data = await res.json();

        if (res.ok) {
          setBookedSlots(data.bookedSlots || []);
        }
      } catch (error) {
        console.log("Error fetching slots:", error);
      }
    };

    fetchSlots();
  }, [spotName, parkingType]);

  useEffect(() => {
    setSelectedSlots((prev) =>
      prev.filter((slot) => !bookedSlots.includes(slot)),
    );
  }, [bookedSlots]);

  const toggleSlot = (slot) => {
    if (bookedSlots.includes(slot)) return;

    setSelectedSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [slot],
    );
  };

  const confirmBooking = async () => {
    if (selectedSlots.length === 0) {
      alert("Please select a slot");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      const vehicleType = parkingType === "electric" ? "Electric" : "Normal";

      const bookingData = {
        user_id: user.id,
        location: spotName,
        slot: selectedSlots[0],
        vehicle_type: vehicleType,
        vehicle_number: "MH12AB1234",
        phone: "9999999999",
        hours: hours,
        amount: hourlyRate * hours,
        payment_mode: "Online",
      };

      const res = await fetch(`${BASE_URL}/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Booking failed");
        setLoading(false);
        return;
      }

      alert("Booking successful ✅");
      navigate("/dashboard");
    } catch (error) {
      console.log("Booking error:", error);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-blue-200 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-2">{spotName}</h2>
        <p className="text-sm text-gray-500 mb-6">
          Choose a parking type, select a slot, and pick duration (hours).
        </p>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => {
              setParkingType("normal");
              setSelectedSlots([]);
            }}
            className={`flex-1 py-2 rounded-lg transition ${
              parkingType === "normal"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Normal (5 slots)
          </button>

          <button
            onClick={() => {
              setParkingType("electric");
              setSelectedSlots([]);
            }}
            className={`flex-1 py-2 rounded-lg transition ${
              parkingType === "electric"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Electric (2 slots)
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Booking date
            </label>
            <input
              type="date"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Start time
            </label>
            <select
              value={startHour}
              onChange={(e) => setStartHour(Number(e.target.value))}
              className="w-full p-2 border rounded-lg focus:outline-indigo-500"
            >
              {Array.from({ length: 24 }, (_, i) => i).map((h) => (
                <option key={h} value={h}>
                  {h % 12 === 0 ? 12 : h % 12}
                  {h < 12 ? " AM" : " PM"}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm text-gray-600 mb-2">
            Duration (hours)
          </label>
          <select
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="w-32 p-2 border rounded-lg focus:outline-indigo-500"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
              <option key={h} value={h}>
                {h} hour{h > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-5 gap-3 mb-6">
          {slots.map((slot) => {
            const disabled = bookedSlots.includes(slot);
            const selected = selectedSlots.includes(slot);

            return (
              <button
                key={slot}
                onClick={() => toggleSlot(slot)}
                disabled={disabled}
                className={`py-3 rounded-lg border transition ${
                  disabled
                    ? "bg-red-500 text-white border-red-500 cursor-not-allowed"
                    : selected
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {slot}
                {disabled && (
                  <span className="block text-xs font-semibold">Booked</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mb-4 text-sm text-gray-600">
          <p>
            <strong>Selected Slot:</strong>{" "}
            {selectedSlots.length > 0 ? selectedSlots[0] : "None"}
          </p>
          <p>
            <strong>Total Amount:</strong> ₹{hourlyRate * hours}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={confirmBooking}
            disabled={selectedSlots.length === 0 || loading}
            className={`flex-1 py-3 rounded-lg text-white transition ${
              selectedSlots.length > 0 && !loading
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {loading ? "Booking..." : "Confirm Booking"}
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="flex-1 py-3 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default Booking;
