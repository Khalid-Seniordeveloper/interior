"use client";
import Link from "next/link";
import Image from "next/image";
import { Alert } from "@mui/material";
import { useRouter } from "next/navigation";
import logo from "../../public/images/logo.svg";
import { useEffect, useRef, useState } from "react";
import { deleteCookie, getCookie } from "cookies-next";
import axios from "axios";

const Sidebar = () => {
  const [alertSeverity, setAlertSeverity] = useState("success");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("null");
  const [showMessage, setShowMessage] = useState(false);
  const [dropDown, setDropDown] = useState(false);
  const [userData, setUserData] = useState({});
  const dropdownRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const cookieData = getCookie("userData");
    if (cookieData) {
      setUserData(JSON.parse(cookieData));
    }
  }, []);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Check if user data is already in local storage
        const userDataLocalStorage = localStorage.getItem("userData");
        if (userDataLocalStorage) {
          const userData = JSON.parse(userDataLocalStorage);
          setUserData(userData);
          return;
        }
  
        // Check if the user authenticated via Google
        const isGoogleAuth = localStorage.getItem("isGoogleAuth");
        if (isGoogleAuth) {
          //this api get a usr data in backend
          const response = await axios.get("https://chatbuilder-puce.vercel.app//auth/login/success", {
            withCredentials: true,
          });
  
          if (response.data.success) {
            const userData = response.data.user;
            setUserData(userData);
            localStorage.setItem("userData", JSON.stringify(userData));
            console.log("User from API:", userData);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        // Clear the Google authentication flag
        //auto-fetch na ho jab tak user wapas login na kare.
        localStorage.removeItem("isGoogleAuth");
      }
    };
  
    fetchUser();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropDown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("userData");

    deleteCookie("token");
    deleteCookie("userData");
    deleteCookie("botDetail");
    deleteCookie("refreshToken");
    deleteCookie("accessToken");
    setAlertSeverity("success");


    
    setShowMessage(true);
    router.replace("/");
    setAlertMessage("Logged out successfully.");
  };

  const handleMenuItemClick = () => {
    setIsSidebarOpen(false);
  };


  return (
    <>
      {showMessage && (
        <div className="fixed top-4 right-4 z-[99999]">
          <Alert
            onClose={() => setShowMessage(false)}
            variant="filled"
            severity={alertSeverity}
          >
            {alertMessage}
          </Alert>
        </div>
      )}
      <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 shadow-md">
        <div className="px-4 py-3 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                aria-controls="logo-sidebar"
                type="button"
                className="inline-flex items-center p-2 text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                <span className="sr-only">Open sidebar</span>
                <svg
                  className="w-6 h-6"
                  aria-hidden="true"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    clipRule="evenodd"
                    fillRule="evenodd"
                    d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
                  />
                </svg>
              </button>

              <Link href="/" className="flex">
                <Image
                  src={logo}
                  className="h-8 w-auto"
                  alt="FlowBite Logo"
                  width={180}
                  height={180}
                  priority={true}
                />
              </Link>
            </div>

            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                className="flex items-center space-x-3 bg-white rounded p-2 md:px-4 border-2 border-gray-100 hover:bg-gray-100 transition"
                onClick={() => setDropDown(!dropDown)}
              >
                <img
                  className="w-10 h-8 rounded-full"
                  src="https://www.pngall.com/wp-content/uploads/5/User-Profile-PNG-Image.png"
                  alt="User photo"
                />
                <span className="hidden md:inline text-gray-600 text-sm font-semibold">
                  {userData?.name || " "}
                  <i className="fa-solid fa-caret-down ml-2"></i>
                </span>
              </button>

              {dropDown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <div className="py-2 px-4 border-b">
                    <p className="text-gray-800 font-semibold text-sm">
                      {userData?.name || " "}
                    </p>
                    <p className="text-sm text-gray-500">
                      {userData?.email || " "}
                    </p>
                  </div>
                  <ul className="py-1">
                    <li>
                      <Link
                        href="/dashboard/setting"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <svg
                          className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900 mr-2"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 22 21"
                        >
                          <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z" />
                          <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z" />
                        </svg>
                        User Settings
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={logout}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <svg
                          className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900 mr-2"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 4a1 1 0 0 1 1-1h7a1 1 0 0 1 0 2H5v10h6a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1V4Zm12.293 3.707a1 1 0 0 1 1.414 1.414l-3 3a1 1 0 0 1-1.414 0l-3-3a1 1 0 0 1 1.414-1.414L12 9.586V3a1 1 0 1 1 2 0v6.586l1.293-1.293Z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Sign out
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <aside
        id="logo-sidebar"
        className={`fixed top-0 mt-6 left-0 z-40 w-64 h-full pt-20 transition-transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } bg-white border-r border-gray-200 sm:translate-x-0 `}
        aria-label="Sidebar"
      >
        <div className="h-full px-3 pb-4 overflow-y-auto bg-white ">
          <ul className="space-y-2 font-medium">
            <li onClick={handleMenuItemClick}>
              <Link
                href="/dashboard"
                className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100  group"
              >
                <svg
                  className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900 "
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 22 21"
                >
                  <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z" />
                  <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z" />
                </svg>
                <span className="ms-3">Dashboard</span>
              </Link>
            </li>
            <li onClick={handleMenuItemClick}>
              <Link
                href="/dashboard/pro"
                className="flex items-center p-2 text-gray-900 rounded-lg  hover:bg-gray-100  group"
              >
                <svg
                  className="shrink-0 w-5 h-5 text-gray-500 transition duration-75  group-hover:text-gray-900 "
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 18 18"
                >
                  <path d="M6.143 0H1.857A1.857 1.857 0 0 0 0 1.857v4.286C0 7.169.831 8 1.857 8h4.286A1.857 1.857 0 0 0 8 6.143V1.857A1.857 1.857 0 0 0 6.143 0Zm10 0h-4.286A1.857 1.857 0 0 0 10 1.857v4.286C10 7.169 10.831 8 11.857 8h4.286A1.857 1.857 0 0 0 18 6.143V1.857A1.857 1.857 0 0 0 16.143 0Zm-10 10H1.857A1.857 1.857 0 0 0 0 11.857v4.286C0 17.169.831 18 1.857 18h4.286A1.857 1.857 0 0 0 8 16.143v-4.286A1.857 1.857 0 0 0 6.143 10Zm10 0h-4.286A1.857 1.857 0 0 0 10 11.857v4.286c0 1.026.831 1.857 1.857 1.857h4.286A1.857 1.857 0 0 0 18 16.143v-4.286A1.857 1.857 0 0 0 16.143 10Z" />
                </svg>
                <span className="flex-1 ms-3 whitespace-nowrap">
                  Upgrade Version
                </span>
                <span className="inline-flex items-center justify-center px-2 ms-3 text-sm font-medium text-gray-800 bg-gray-100 rounded-full  ">
                  Pro
                </span>
              </Link>
            </li>
            <li onClick={handleMenuItemClick}>
              <Link
                href="/dashboard/chathistory"
                className="flex items-center p-2 text-gray-900 rounded-lg  hover:bg-gray-100  group"
              >
                <svg
                  className="shrink-0 w-5 h-5 text-gray-500 transition duration-75  group-hover:text-gray-900 "
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="m17.418 3.623-.018-.008a6.713 6.713 0 0 0-2.4-.569V2h1a1 1 0 1 0 0-2h-2a1 1 0 0 0-1 1v2H9.89A6.977 6.977 0 0 1 12 8v5h-2V8A5 5 0 1 0 0 8v6a1 1 0 0 0 1 1h8v4a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-4h6a1 1 0 0 0 1-1V8a5 5 0 0 0-2.582-4.377ZM6 12H4a1 1 0 0 1 0-2h2a1 1 0 0 1 0 2Z" />
                </svg>
                <span className="flex-1 ms-3 whitespace-nowrap">Chat Box</span>
                <span className="inline-flex items-center justify-center w-3 h-3 p-3 ms-3 text-sm font-medium text-blue-800 bg-blue-100 rounded-full  ">
                  3
                </span>
              </Link>
            </li>
            <li onClick={handleMenuItemClick}>
              <Link
                href="/dashboard/setting"
                className="flex items-center p-2 text-gray-900 rounded-lg  hover:bg-gray-100  group"
              >
                <svg
                  className="shrink-0 w-5 h-5 text-gray-500 transition duration-75  group-hover:text-gray-900 "
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 18"
                >
                  <path d="M14 2a3.963 3.963 0 0 0-1.4.267 6.439 6.439 0 0 1-1.331 6.638A4 4 0 1 0 14 2Zm1 9h-1.264A6.957 6.957 0 0 1 15 15v2a2.97 2.97 0 0 1-.184 1H19a1 1 0 0 0 1-1v-1a5.006 5.006 0 0 0-5-5ZM6.5 9a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM8 10H5a5.006 5.006 0 0 0-5 5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2a5.006 5.006 0 0 0-5-5Z" />
                </svg>
                <span className="flex-1 ms-3 whitespace-nowrap">Setting</span>
              </Link>
            </li>
          </ul>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
