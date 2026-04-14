import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";

function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [extraCharges, setExtraCharges] = useState({});

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      if (!user) {
        alert("Please login first");
        navigate("/login");
        return;
      }

      const res = await fetch(`${BASE_URL}/my-bookings/${user.id}`);
      const data = await res.json();

      if (res.ok) {
        const fetchedBookings = data.bookings || [];
        setBookings(fetchedBookings);

        fetchedBookings.forEach((booking) => {
          fetchExtraCharge(booking.id);
        });
      } else {
        alert(data.message || "Failed to fetch bookings");
      }
    } catch (error) {
      console.log("Error fetching bookings:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const fetchExtraCharge = async (bookingId) => {
    try {
      const res = await fetch(`${BASE_URL}/overstay-charge/${bookingId}`);
      const data = await res.json();

      if (res.ok) {
        setExtraCharges((prev) => ({
          ...prev,
          [bookingId]: data.extraCharge || 0,
        }));
      }
    } catch (error) {
      console.log("Extra charge fetch error:", error);
    }
  };

  const cancelBooking = async (bookingId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this booking?",
    );
    if (!confirmCancel) return;

    try {
      const res = await fetch(`${BASE_URL}/cancel-booking/${bookingId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message || "Booking cancelled successfully");
        setBookings((prev) =>
          prev.map((booking) =>
            booking.id === bookingId
              ? { ...booking, booking_status: "Cancelled", status: "Cancelled" }
              : booking,
          ),
        );
        setExtraCharges((prev) => ({
          ...prev,
          [bookingId]: 0,
        }));
      } else {
        alert(data.message || "Failed to cancel booking");
      }
    } catch (error) {
      console.log("Cancel booking error:", error);
      alert("Something went wrong while cancelling booking");
    }
  };

  const activeBookings = bookings.filter((booking) => {
    const status = booking.status || booking.booking_status || "Booked";

    if (status === "Cancelled") return false;
    if (!booking.expiry_time) return true;

    return new Date(booking.expiry_time) > new Date();
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading bookings...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">My Bookings</h1>

        {activeBookings.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-600 mb-4">No active bookings found.</p>

            <div className="flex justify-center gap-3 flex-wrap">
              <button
                onClick={() => navigate("/history")}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
              >
                Go to History
              </button>

              <button
                onClick={() => navigate("/home")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
              >
                Back to Home
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {activeBookings.map((booking) => (
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
                  {booking.status || booking.booking_status || "Booked"}
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

                <p className="mt-2 text-red-600 font-semibold">
                  Extra Charge: ₹{extraCharges[booking.id] || 0}
                </p>

                {extraCharges[booking.id] > 0 && (
                  <p className="text-sm text-red-500">
                    ₹10 per 15 minutes after expiry time
                  </p>
                )}

                <div className="mt-4 flex gap-3 flex-wrap">
                  {booking.status !== "Cancelled" && (
                    <button
                      onClick={() => cancelBooking(booking.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                    >
                      Cancel Booking
                    </button>
                  )}

                  <button
                    onClick={() => navigate("/history")}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                  >
                    Go to History
                  </button>

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

export default MyBookings;
