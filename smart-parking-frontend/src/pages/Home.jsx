import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import "./home.css";

function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const locations = [
    { name: "Baner", rate: 50 },
    { name: "Balewadi", rate: 40 },
    { name: "Hinjewadi", rate: 60 },
    { name: "Wakad", rate: 45 },
    { name: "Kothrud", rate: 55 },
    { name: "Shivajinagar", rate: 70 },
  ];

  const filteredLocations = useMemo(() => {
    if (!search.trim()) return [];
    return locations.filter((loc) =>
      loc.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search]);

  const handleBookParking = () => {
    navigate("/booking", {
      state: { searchTerm: search },
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

  return (
    <div className="home">
      <div className="top-bar">
        <div className="logo">
          <div className="logo-text">SP</div>
          <h2>Smart Parking</h2>
        </div>

        <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {menuOpen && (
        <div className="side-menu">
          <Link to="/my-bookings" onClick={() => setMenuOpen(false)}>
            My Bookings
          </Link>
          <Link to="/profile" onClick={() => setMenuOpen(false)}>
            Profile
          </Link>
          <Link to="/history" onClick={() => setMenuOpen(false)}>
            History
          </Link>
          <button
            onClick={() => {
              setMenuOpen(false);
              handleLogout();
            }}
            className="logout-btn"
          >
            Logout
          </button>
        </div>
      )}

      <div className="hero-section">
        <h1>Smart Parking System</h1>
        <p>
          The Smart Parking system allows you to easily book parking slots with
          secure access and fast management. Search for available locations,
          book your slot instantly, and enjoy a smooth and hassle-free parking
          experience.
        </p>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="top-search"
          />

          <button className="book-btn" onClick={handleBookParking}>
            Book Parking
          </button>
        </div>
      </div>

      {filteredLocations.length > 0 && (
        <div className="search-results">
          <h3>Search Results</h3>
          <div className="result-list">
            {filteredLocations.map((loc) => (
              <div key={loc.name} className="result-card">
                <span>{loc.name}</span>
                <span>₹{loc.rate}/hour</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="info-section">
        <div className="card">
          <h3>Fast Booking</h3>
          <p>Book your parking slot quickly and easily in a few seconds.</p>
        </div>

        <div className="card">
          <h3>Secure Access</h3>
          <p>Your booking details and user data remain safe and protected.</p>
        </div>

        <div className="card">
          <h3>Smart Search</h3>
          <p>Search your preferred parking location before booking.</p>
        </div>

        <div className="card">
          <h3>Easy Management</h3>
          <p>Check bookings, profile, and history anytime from one place.</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
