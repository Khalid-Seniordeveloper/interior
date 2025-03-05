"use client";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Alert } from "@mui/material";
import { setCookie } from "cookies-next";
import ai from "../../public/images/ai.png";
import { useRouter } from "next/navigation";
import googleLogo from "../../public/images/googleLogo.png";

const LoginPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [alertMessage, setAlertMessage] = useState("null");
  const [alertSeverity, setAlertSeverity] = useState("success");

  const loginUrl = process.env.NEXT_PUBLIC_Login_Url;
  const baseUrl = process.env.NEXT_PUBLIC_BaseUrl;

  const handleLogin = async (e) => {
    e.preventDefault();

    const loginData = {
      email: e.target[0].value,
      password: e.target[1].value,
    };
    try {
      setLoading(true);
      const { data } = await axios.post(`${baseUrl}${loginUrl}`, loginData);
      localStorage.setItem("userData",JSON.stringify(data.result))
      setCookie("token", data.result.token);
      setCookie("userData", JSON.stringify(data.result));
      router.replace("/dashboard");
    } catch (error) {
      setLoading(false);
      setAlertMessage(
        error?.response?.data?.message || "Something went wrong."
      );
      setAlertSeverity("error");
      setShowMessage(true);
      setTimeout(() => {
        setShowMessage(false);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  // const googleAuth = async (e) => {
  //   e.preventDefault();

  //   try {
  //     setLoading(true);

  //     const res = await axios.get("https://chatbuilder-puce.vercel.app//auth/login/success", {
  //       withCredentials: true,
  //     });

  //     if (res?.data) {
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
      <div className="flex min-h-screen absolute top-0 w-full">
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 bg-white shadow-md text-center">
          <h2 className="text-3xl font-bold mb-4 text-blue-700">
            {" "}
            <i className="fas fa-comments text-5xl text-blue-700 mb-4"></i>{" "}
            Saylani chat
          </h2>
          <p className="text-gray-500 w-80 mb-4">
            Your AI-powered chatbot assistant.
          </p>
          <div className="max-w-sm w-full">
            <h3 className="text-2xl font-semibold text-blue-700 text-center mb-8">
              Login in with
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
            <form onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="yourname@gmail.com"
                className="w-full border rounded-md p-2 mb-4 focus:ring focus:ring-blue-300"
                defaultValue="meeer@gmail.com"
              />
              <input
                type="password"
                placeholder="Enter Your Password"
                defaultValue="123456"
                className="w-full border rounded-md p-2 mb-4 focus:ring focus:ring-blue-300"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-md shadow hover:bg-blue-700"
              >
                {loading ? "Logging" : "Login with email"}
              </button>
            </form>
            <p className="text-center text-gray-500 mt-4">
              Don'thave an Account?{" "}
              <Link href="/signup" className="text-blue-600">
                Signup
              </Link>{" "}
            </p>
            <p className="text-center text-gray-500 mt-4">
              By logging in, you agree to our{" "}
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
          <div className="relative max-w-md text-white text-center p-6">
            <h2 className="text-4xl font-bold">
              Empower Conversations, Elevate Experiences.
            </h2>
            <p className="mt-4 text-lg">
              Seamlessly interact with AI to enhance productivity,
              collaboration, and engagement.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
