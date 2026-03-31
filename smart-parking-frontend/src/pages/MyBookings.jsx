import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadBookings = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || !user.id) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/my-bookings/${user.id}`);
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to load bookings");
        setBookings([]);
        return;
      }

      setBookings(data.bookings || []);
    } catch (error) {
      console.log("Error loading bookings:", error);
      alert("Server error");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchBookings = async () => {
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user || !user.id) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch(`${BASE_URL}/my-bookings/${user.id}`);
        const data = await res.json();

        if (res.ok) {
          setBookings(data.bookings || []);
        } else {
          setBookings([]);
        }
      } catch (error) {
        console.log("Error loading bookings:", error);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [navigate]);

  const cancelBooking = async (bookingId) => {
    try {
      const res = await fetch(`${BASE_URL}/cancel-booking/${bookingId}`, {
        method: "PUT",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Cancel failed");
        return;
      }

      alert("Booking cancelled successfully");
      loadBookings();
    } catch (error) {
      console.log("Error cancelling booking:", error);
      alert("Server error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-blue-200 py-10">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">My Bookings</h2>
            <p className="text-gray-600">
              All confirmed bookings are listed here.
            </p>
          </div>

          <Link
            to="/dashboard"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Back to Dashboard
          </Link>
        </div>

        {loading ? (
          <div className="bg-white p-10 rounded-2xl shadow-xl text-center">
            <p className="text-gray-600">Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl shadow-xl text-center">
            <p className="text-gray-600">No bookings yet.</p>
            <Link
              to="/dashboard"
              className="mt-4 inline-block bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700"
            >
              Book now
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white p-6 rounded-2xl shadow-xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {booking.location}
                    </h3>

                    <p className="text-sm text-gray-600">
                      {booking.vehicle_type} parking • Slot: {booking.slot} •{" "}
                      {booking.hours} hour{booking.hours > 1 ? "s" : ""}
                    </p>

                    <p className="text-sm text-gray-500">
                      Vehicle No: {booking.vehicle_number}
                    </p>

                    <p className="text-sm text-gray-500">
                      Phone: {booking.phone}
                    </p>

                    <p className="text-sm text-gray-500">
                      Amount: ₹{booking.amount}
                    </p>

                    <p className="text-sm text-gray-500">
                      Payment: {booking.payment_mode}
                    </p>

                    <p className="text-sm text-gray-500">
                      Status: {booking.status || booking.booking_status}
                    </p>

                    <p className="text-sm text-gray-500">
                      Expiry:{" "}
                      {booking.expiry_time
                        ? new Date(booking.expiry_time).toLocaleString()
                        : "N/A"}
                    </p>

                    <p className="text-sm text-gray-500">
                      Booked on:{" "}
                      {booking.created_at
                        ? new Date(booking.created_at).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>

                  <div className="text-right flex flex-col items-end gap-2">
                    <p className="text-lg font-bold">₹{booking.amount}</p>

                    {booking.booking_status === "Active" ? (
                      <button
                        onClick={() => cancelBooking(booking.id)}
                        className="mt-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                      >
                        Cancel
                      </button>
                    ) : (
                      <span className="mt-2 px-4 py-2 rounded-lg bg-gray-200 text-gray-700">
                        {booking.booking_status}
                      </span>
                    )}
                  </div>
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
