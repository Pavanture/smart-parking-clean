import { Link, useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
import { Search, MapPin } from "lucide-react";
import { useState } from "react";

function Dashboard() {
  const [location, setLocation] = useState("");
  const navigate = useNavigate();

  const parkingSpots = [
    {
      name: "Balewadi Stadium Parking",
      area: "Balewadi",
      distance: "1.2 km",
      price: "₹40/hr",
      image: "https://images.pexels.com/photos/399187/pexels-photo-399187.jpeg",
    },
    {
      name: "Hinjewadi IT Park Parking",
      area: "Hinjewadi",
      distance: "3.5 km",
      price: "₹30/hr",
      image: "https://images.unsplash.com/photo-1492724441997-5dc865305da7",
    },
    {
      name: "Baner Central Parking",
      area: "Baner",
      distance: "2.1 km",
      price: "₹35/hr",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab",
    },
    {
      name: "Wakad Metro Parking",
      area: "Wakad",
      distance: "4.0 km",
      price: "₹25/hr",
      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957",
    },
    {
      name: "Shivajinagar Station Parking",
      area: "Shivajinagar",
      distance: "5.2 km",
      price: "₹50/hr",
      image: "https://images.unsplash.com/photo-1507608616759-54f48f0af0ee",
    },
    {
      name: "Kothrud City Mall Parking",
      area: "Kothrud",
      distance: "3.8 km",
      price: "₹45/hr",
      image: "https://images.pexels.com/photos/264547/pexels-photo-264547.jpeg",
    },
  ];

  const filteredSpots = parkingSpots.filter((spot) =>
    spot.area.toLowerCase().includes(location.toLowerCase()),
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-100 via-white to-blue-200">
      <div className="w-64 bg-gradient-to-b from-indigo-900 to-blue-800 text-white p-6 shadow-2xl relative">
        <div className="flex items-center gap-3 mb-10">
          <img
            src="https://cdn-icons-png.flaticon.com/512/744/744465.png"
            alt="Smart Parking Logo"
            className="w-10 h-10"
          />
          <h1 className="text-xl font-bold">Smart Parking</h1>
        </div>

        <nav className="space-y-4">
          <div className="hover:bg-white/20 p-2 rounded transition cursor-pointer">
            Dashboard
          </div>

          <Link to="/my-bookings">
            <div className="hover:bg-white/20 p-2 rounded transition cursor-pointer">
              My Bookings
            </div>
          </Link>

          <div className="hover:bg-white/20 p-2 rounded transition cursor-pointer">
            History
          </div>

          <Link to="/profile">
            <div className="hover:bg-white/20 p-2 rounded transition cursor-pointer">
              Profile
            </div>
          </Link>
        </nav>

        <div className="absolute bottom-10 w-52">
          <Link to="/login">
            <button className="w-full bg-red-500 hover:bg-red-600 p-2 rounded-lg transition">
              Logout
            </button>
          </Link>
        </div>
      </div>

      <div className="flex-1 p-10">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-8 text-gray-800"
        >
          Find Nearby Parking 🚗
        </motion.h2>

        <div className="bg-white shadow-xl rounded-2xl p-5 mb-10 flex items-center gap-4">
          <Search className="text-gray-500" />
          <input
            type="text"
            placeholder="Search by location (Baner, Balewadi, Hinjewadi...)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="flex-1 outline-none text-lg"
          />
          <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition">
            Search
          </button>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {filteredSpots.length > 0 ? (
            filteredSpots.map((spot, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-2xl shadow-2xl overflow-hidden"
              >
                <img
                  src={spot.image}
                  alt={spot.name}
                  className="h-44 w-full object-cover"
                />

                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{spot.name}</h3>

                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <MapPin size={16} />
                    <span>{spot.distance}</span>
                  </div>

                  <p className="text-indigo-600 font-bold text-lg mb-4">
                    {spot.price}
                  </p>

                  <button
                    onClick={() =>
                      navigate("/booking", {
                        state: {
                          spotName: spot.name,
                          hourlyRate: Number(
                            spot.price.replace("₹", "").replace("/hr", ""),
                          ),
                        },
                      })
                    }
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
                  >
                    Book Now
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-gray-600 text-lg">
              No parking found for this location.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
