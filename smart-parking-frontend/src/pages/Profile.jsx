import { useState } from "react";

function Profile() {
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};

  const initialUser = {
    name: storedUser.name || "",
    email: storedUser.email || "",
    phone: storedUser.phone || "",
    city: storedUser.city || "",
    photo:
      storedUser.photo ||
      "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
  };

  const [user, setUser] = useState(initialUser);
  const [formData, setFormData] = useState(initialUser);
  const [editMode, setEditMode] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const saveProfile = () => {
    setPhotoLoading(true);

    setTimeout(() => {
      setUser(formData);
      localStorage.setItem("user", JSON.stringify(formData));
      setEditMode(false);
      setPhotoLoading(false);
      alert("Profile updated successfully");
    }, 800);
  };

  const cancelEdit = () => {
    setFormData(user);
    setEditMode(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-indigo-200 flex items-center justify-center">
      <div className="bg-white shadow-2xl rounded-2xl p-10 w-96">
        <div className="text-center mb-6">
          <img
            src={formData.photo || user.photo}
            alt="User"
            className="w-24 h-24 mx-auto mb-4 rounded-full object-cover"
          />

          {editMode ? (
            <>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                className="w-full p-2 border rounded-lg mb-3"
              />
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                className="w-full p-2 border rounded-lg"
              />
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-gray-500">{user.city}</p>
            </>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-gray-100 p-3 rounded-lg">
            <strong>Email:</strong>{" "}
            {editMode ? (
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full mt-2 p-2 border rounded-lg"
              />
            ) : (
              user.email
            )}
          </div>

          <div className="bg-gray-100 p-3 rounded-lg">
            <strong>Phone:</strong>{" "}
            {editMode ? (
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full mt-2 p-2 border rounded-lg"
              />
            ) : (
              user.phone
            )}
          </div>

          {editMode ? (
            <div className="flex gap-3">
              <button
                onClick={saveProfile}
                disabled={photoLoading}
                className={`flex-1 py-2 rounded-lg transition ${
                  photoLoading
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                {photoLoading ? "Saving..." : "Save"}
              </button>

              <button
                onClick={cancelEdit}
                className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
