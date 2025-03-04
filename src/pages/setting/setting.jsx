"use client";
import { getCookie } from "cookies-next";
import { useEffect, useState } from "react";

const Settings = () => {
  const [userData, setUserData] = useState({});

  useEffect(() => {
    const cookieData = getCookie("userData");
    if (cookieData) {
      setUserData(JSON.parse(cookieData));
    }
  }, []);

  return (
    <div className="max-w-100 mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Settings</h2>
      <div className="mt-6">
        <h3 className="text-xl font-semibold text-gray-900">My Profile</h3>

        <div className="flex items-center space-x-4 mt-4">
          <div className="relative w-16 h-14">
            <img
              src="https://www.pngall.com/wp-content/uploads/5/User-Profile-PNG-Image.png"
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover border"
            />
            <button className="absolute left-10 top-8 right-0  w-8 h-8 bg-gray-800 text-white p-1 rounded-full">
              <i className="fa-solid fa-camera "></i>
            </button>
          </div>
        </div>
        <div className="mt-4">
          <label className="text-gray-700 text-sm">Name</label>
          <input
            type="text"
            className="w-full mt-1 p-2 border rounded-md bg-white border-gray-300 text-gray-900"
            value={userData?.name || ""}
            disabled={userData?.name}
            readOnly
          />
        </div>
        <div className="mt-4">
          <label className="text-gray-700 text-sm">Email</label>
          <input
            type="email"
            className="w-full mt-1 p-2 border rounded-md bg-white border-gray-300 text-gray-900"
            value={userData?.email || ""}
            disabled={userData?.email}
            readOnly
          />
        </div>
        <button
          disabled={userData}
          className="mt-6 w-full bg-gray-800 text-white py-2 rounded-md hover:bg-gray-700"
        >
          {userData ? "Saved" : "Save Settings"}
        </button>
      </div>
    </div>
  );
};

export default Settings;
