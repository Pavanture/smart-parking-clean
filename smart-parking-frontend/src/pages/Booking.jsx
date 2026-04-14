import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { BASE_URL } from "../config";

function Booking() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const initialSearch = state?.searchTerm || "";

  const [selectedLocation, setSelectedLocation] = useState(
    state?.spotName || "",
  );
  const [search, setSearch] = useState(initialSearch);

  const locations = [
    { name: "Baner", rate: 50 },
    { name: "Balewadi", rate: 40 },
    { name: "Hinjewadi", rate: 60 },
    { name: "Wakad", rate: 45 },
    { name: "Kothrud", rate: 55 },
    { name: "Shivajinagar", rate: 70 },
  ];

  const filteredLocations = locations.filter((loc) =>
    loc.name.toLowerCase().includes(search.toLowerCase()),
  );

  const spotName = selectedLocation;
  const hourlyRate =
    locations.find((l) => l.name === selectedLocation)?.rate || 0;

  const [parkingType, setParkingType] = useState("normal");
  const [hours, setHours] = useState(1);
  const [bookingDate, setBookingDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [startHour, setStartHour] = useState("10:00");
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);

  const slots = useMemo(() => {
    return parkingType === "electric" ? ["E1"] : ["N1", "N2"];
  }, [parkingType]);

  useEffect(() => {
    if (!spotName) return;

    const fetchSlots = async () => {
      try {
        const vehicleType = parkingType === "electric" ? "Electric" : "Normal";

        const res = await fetch(
          `${BASE_URL}/available-slots/${spotName}/${vehicleType}`,
        );

        const data = await res.json();

        if (res.ok) {
          setBookedSlots(data.bookedSlots || []);
        } else {
          setBookedSlots([]);
        }
      } catch (err) {
        console.log("Error fetching slots:", err);
        setBookedSlots([]);
      }
    };

    fetchSlots();
  }, [spotName, parkingType]);

  const toggleSlot = (slot) => {
    if (bookedSlots.includes(slot)) return;

    setSelectedSlots((prev) => (prev.includes(slot) ? [] : [slot]));
  };

  const confirmBooking = () => {
    if (!spotName) {
      alert("Please select a location");
      return;
    }

    if (!parkingType) {
      alert("Please select parking type");
      return;
    }

    if (!bookingDate) {
      alert("Please select booking date");
      return;
    }

    if (!startHour) {
      alert("Please select start time");
      return;
    }

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

    const start_time = `${bookingDate}T${startHour}:00`;

    const paymentState = {
      spotName: spotName,
      parkingType: parkingType,
      selectedSlots: [...selectedSlots],
      hours: Number(hours),
      hourlyRate: Number(hourlyRate),
      start_time: start_time,
    };

    console.log("BOOKING -> PAYMENT STATE:", paymentState);

    navigate("/payment", {
      state: paymentState,
    });
  };

  if (!selectedLocation) {
    return (
      <div className="min-h-screen p-10 bg-gray-100">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Select Parking Location
        </h1>

        <input
          type="text"
          placeholder="Search location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md mx-auto block p-3 border rounded-lg mb-6"
        />

        <div className="flex flex-col gap-4 max-w-md mx-auto">
          {filteredLocations.map((loc) => (
            <div
              key={loc.name}
              onClick={() => setSelectedLocation(loc.name)}
              className="bg-white p-6 rounded-xl shadow hover:scale-105 transition cursor-pointer"
            >
              <h2 className="text-xl font-bold">{loc.name}</h2>
              <p>₹{loc.rate}/hour</p>
              <p>2 Normal Slots • 1 EV Slot</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-blue-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-2">{spotName}</h2>

        <button
          onClick={() => {
            setSelectedLocation("");
            setSelectedSlots([]);
          }}
          className="text-sm text-blue-500 mb-4"
        >
          ← Change Location
        </button>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => {
              setParkingType("normal");
              setSelectedSlots([]);
            }}
            className={`flex-1 py-2 rounded-lg ${
              parkingType === "normal"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100"
            }`}
          >
            Normal (2)
          </button>

          <button
            onClick={() => {
              setParkingType("electric");
              setSelectedSlots([]);
            }}
            className={`flex-1 py-2 rounded-lg ${
              parkingType === "electric"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100"
            }`}
          >
            Electric (1)
          </button>
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-medium">Parking Date</label>
          <input
            type="date"
            value={bookingDate}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setBookingDate(e.target.value)}
            className="w-full p-3 border rounded-lg"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-medium">Start Time</label>
          <input
            type="time"
            value={startHour}
            onChange={(e) => setStartHour(e.target.value)}
            className="w-full p-3 border rounded-lg"
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 font-medium">Parking Duration</label>
          <select
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="w-full p-3 border rounded-lg"
          >
            {[1, 2, 3, 4, 5, 6].map((h) => (
              <option key={h} value={h}>
                {h} hour{h > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {slots.map((slot) => {
            const disabled = bookedSlots.includes(slot);
            const selected = selectedSlots.includes(slot);

            return (
              <button
                key={slot}
                onClick={() => toggleSlot(slot)}
                disabled={disabled}
                className={`py-3 rounded-lg text-sm ${
                  disabled
                    ? "bg-red-500 text-white"
                    : selected
                      ? "bg-green-500 text-white"
                      : "bg-gray-200"
                }`}
              >
                {slot}
              </button>
            );
          })}
        </div>

        <div className="mb-4 text-sm">
          <p>
            <strong>Selected Slot:</strong> {selectedSlots[0] || "None"}
          </p>
          <p>
            <strong>Total Amount:</strong> ₹{hourlyRate * hours}
          </p>
          <p className="text-red-600 mt-2">
            Extra charge: ₹10 per 15 minutes after expiry time.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={confirmBooking}
            className="flex-1 py-3 bg-indigo-600 text-white rounded-lg"
          >
            Confirm Booking
          </button>

          <button
            onClick={() => navigate("/home")}
            className="flex-1 py-3 bg-gray-300 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default Booking;
