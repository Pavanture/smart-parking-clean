import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";

function History() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      if (!user) {
        alert("Please login first");
        navigate("/login");
        return;
      }

      const res = await fetch(`${BASE_URL}/my-bookings/${user.id}`);
      const data = await res.json();

      if (res.ok) {
        setBookings(data.bookings || []);
      } else {
        alert(data.message || "Failed to fetch history");
      }
    } catch (error) {
      console.log("Error fetching history:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 History filter (IMPORTANT)
  const historyBookings = bookings.filter((booking) => {
    const status = booking.status || booking.booking_status || "Booked";

    // Cancelled bookings → history
    if (status === "Cancelled") return true;

    // Expired bookings → history
    if (booking.expiry_time) {
      return new Date(booking.expiry_time) <= new Date();
    }

    return false;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading history...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Booking History</h1>

        {historyBookings.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-600 mb-4">No history bookings found.</p>

            <button
              onClick={() => navigate("/home")}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg"
            >
              Back to Home
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {historyBookings.map((booking) => (
              <div
                key={booking.id}
                className="border rounded-xl p-4 shadow-sm bg-gray-50"
              >
                <h2 className="text-xl font-semibold mb-2">
                  {booking.location}
                </h2>

                <p>
                  <strong>Parking Type:</strong> {booking.vehicle_type}
                </p>

                <p>
                  <strong>Slot:</strong> {booking.slot}
                </p>

                <p>
                  <strong>Vehicle Number:</strong>{" "}
                  {booking.vehicle_number || "N/A"}
                </p>

                <p>
                  <strong>Phone Number:</strong> {booking.phone || "N/A"}
                </p>

                <p>
                  <strong>Hours:</strong> {booking.hours}
                </p>

                <p>
                  <strong>Total Amount:</strong> ₹{booking.amount}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  {booking.status || booking.booking_status}
                </p>

                <p>
                  <strong>Start Time:</strong>{" "}
                  {booking.start_time
                    ? new Date(booking.start_time).toLocaleString()
                    : "N/A"}
                </p>

                <p>
                  <strong>Expiry Time:</strong>{" "}
                  {booking.expiry_time
                    ? new Date(booking.expiry_time).toLocaleString()
                    : "N/A"}
                </p>

                <div className="mt-4">
                  <button
                    onClick={() => navigate("/home")}
                    className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg"
                  >
                    Back to Home
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default History;
