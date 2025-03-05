"use client";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { Alert } from "@mui/material";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ai from "../../public/images/ai.png";
import googleLogo from "../../public/images/googleLogo.png";

const SignupPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [alertMessage, setAlertMessage] = useState("null");
  const [alertSeverity, setAlertSeverity] = useState("success");

  const SignupUrl = process.env.NEXT_PUBLIC_Signup_Url;
  const baseUrl = process.env.NEXT_PUBLIC_BaseUrl;

  const register = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      name: e.target[0].value,
      email: e.target[1].value,
      password: e.target[2].value,
    };

    if (!data.name || !data.email || !data.password) {
      setAlertMessage("All fields are required.");
      setAlertSeverity("error");
      setShowMessage(true);
      setLoading(false);
      return;
    }
    try {
      const res = await axios.post(`${baseUrl}${SignupUrl}`, data);
      console.log(res);
      setAlertMessage(res?.data?.message);
      setAlertSeverity("success");
      setShowMessage(true);
      router.replace("/login");
      setLoading(false);
      setTimeout(() => {
        setShowMessage(false);
      }, 2000);
    } catch (err) {
      setLoading(false);
      setAlertMessage(err?.response?.data?.message);
      setAlertSeverity("error");
      setShowMessage(true);
      setTimeout(() => {
        setShowMessage(false);
      }, 2000);
    }
  };

  // const googleAuth = async (e) => {
  //   e.preventDefault();

  //   try {
  //     setLoading(true);

  //     const res = await axios.get("https://chatbuilder-puce.vercel.app//auth/login/success", {
  //       withCredentials: true,
  //     });

  //     if (res.data?.user) {
  //       setCookie("Googletoken", res?.data?.accessToken);
  //       setLoading(false);
  //       router.replace("/dashboard");
  //     }
  //   } catch (error) {
  //     setLoading(false);
  //     setAlertMessage(
  //       error?.response?.data?.message || "Something went wrong."
  //     );
  //     setAlertSeverity("error");
  //     setShowMessage(true);
  //     setTimeout(() => {
  //       setShowMessage(false);
  //     }, 3000);
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  const googleAuth = () => {
    // Set a flag to indicate Google authentication
    localStorage.setItem("isGoogleAuth", "true");
    window.location.href = "https://chatbuilder-puce.vercel.app//auth/google";
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
      <div className="flex min-h-screen absolute top-0">
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 bg-white shadow-md text-center">
          <h2 className="text-4xl font-bold mb-4 text-blue-700">
            <i className="fas fa-comments text-5xl text-blue-700 mb-4"></i>{" "}
            Saylani chat
          </h2>
          <p className="text-gray-500 w-80 mb-6">
            Your AI-powered chatbot assistant for seamless conversations and
            instant support.
          </p>
          <div className="max-w-sm w-full">
            <h3 className="text-2xl font-semibold text-blue-700 text-center mb-8">
              Sign in with
            </h3>
            <button
              onClick={googleAuth}
              className="w-full flex items-center justify-center bg-gray-100 text-gray-700 py-3 rounded-md mb-4 shadow hover:bg-gray-200"
            >
              <Image
                src={googleLogo}
                width={70}
                height={70}
                priority={true}
                alt="Google"
              />
            </button>
            <div className="text-center text-gray-400 mb-4">or</div>
            <form onSubmit={register}>
              <input
                type="text"
                placeholder="Your Name"
                className="w-full border rounded-md p-2 mb-4 focus:ring focus:ring-blue-300"
              />
              <input
                type="email"
                placeholder="yourname@gmail.com"
                className="w-full border rounded-md p-2 mb-4 focus:ring focus:ring-blue-300"
              />
              <input
                type="password"
                placeholder="Your Password"
                className="w-full border rounded-md p-2 mb-4 focus:ring focus:ring-blue-300"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-md shadow hover:bg-blue-700"
              >
                {loading ? "Signing up..." : "Sign up"}
              </button>
            </form>
            <p className="text-center text-gray-500 mt-4">
              Have an account?{" "}
              <Link href="/login" className="text-blue-600">
                Login Now
              </Link>
            </p>
            <p className="text-center text-gray-500 mt-2">
              By signing in, you agree to our{" "}
              <Link href="#" className="text-blue-600">
                Terms & Privacy Policy
              </Link>
            </p>
          </div>
        </div>

        <div
          className="hidden md:flex md:w-1/2 items-center justify-center relative bg-cover bg-center"
          style={{ backgroundImage: `url(${ai.src})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-blue-500 opacity-75"></div>
          <div className="relative  w-full text-white text-center p-6">
            <h2 className="text-5xl font-bold">
              Mastermind Better. Succeed Together.
            </h2>
            <p className="mt-4 text-lg">
              Get meaningful results with essential tools for brainstorming,
              goal setting, and accountability.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignupPage;
