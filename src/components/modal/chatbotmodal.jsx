"use client";
import axios from "axios";
import { Alert } from "@mui/material";
import { useEffect, useState } from "react";
import { getCookie, setCookie } from "cookies-next";
import {
  deleteObject,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";
import { ref, storage } from "../../firebase/config";

const ChatbotModal = ({ isOpen, onClose, modalLoading, fetchChatBots }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [webURL, setWebURL] = useState("");
  const [progress, setProgress] = useState(0);
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(false);
  const [dataType, setDataType] = useState("URL");
  const [uploading, setUploading] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [chatbotName, setChatbotName] = useState("");
  const [citeSources, setCiteSources] = useState(true);
  const [showMessage, setShowMessage] = useState(false);
  const [tagline, setTagline] = useState("AI Assistant");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [alertMessage, setAlertMessage] = useState("null");
  const [fallbackMessage, setFallbackMessage] = useState("");
  const [greetingMessage, setGreetingMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("success");
  const [progressInterval, setProgressInterval] = useState(null);
  const [currentBotProfile, setCurrentBotProfile] = useState(null);
  const [prompt, setPrompt] = useState(
    `You are an AI Customer support agent. Embodying the traits of helpfulness, professionalism, cleverness, and friendliness, your primary role is to assist users with their queries. You act as an expert in all things related to your knowledge base, providing answers and assistance based on your extensive knowledge of the product.\n\nRemember, your responses should be based exclusively on your understanding of your knowledge base. Abstain from responding to queries unrelated to your knowledge base, and always adhere strictly to the following rules:\n\nRULES:\n\n1. Always adhere to these rules without exception.\n2. Your answers should solely be based on your comprehensive understanding of your knowledge base.\n3. Do not respond to queries unrelated to your knowledge base.\n4. Only share links that are part of your knowledge base.\n5. Consistently maintain your role as an AI Customer Support Agent in all interactions.\n6. Ensure that every answer you provide is something you are confident is true, based solely on your knowledge base. Do not give an answer that you are not confident is in your knowledge base.\n\nBy strictly adhering to these rules, you will effectively fulfil your role as an AI Customer Support agent, providing users with accurate and trustworthy information from your knowledge base.`
  );
  const progressSteps = [
    10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100,
  ];

  useEffect(() => {
    const cookieData = getCookie("userData");
    if (cookieData) {
      setUserData(JSON.parse(cookieData));
    }
  }, []);

  if (!isOpen) return null;

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      const fileType = selectedFile.type;
      if (fileType === "application/pdf" || fileType === "text/plain") {
        setFile(selectedFile);
        setError("");
      } else {
        setFile(null);
        setError(
          `"${selectedFile.name}" is not a valid file. Only PDF or Text files are allowed.`
        );
      }
    }
  };

  // firebase

  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setProfilePic(reader.result);
        }
      };
      reader.readAsDataURL(selectedFile);
      uploadProfile(selectedFile);
    }
  };

  const uploadProfile = async (file) => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      if (currentBotProfile) {
        const oldImageRef = ref(storage, currentBotProfile);
        await deleteObject(oldImageRef);
      }

      // Upload new image
      const storageRef = ref(storage, `chatBotProfile/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
        },
        (error) => {
          setAlertMessage("Upload error: ", error);
          setAlertSeverity("error");
          setShowMessage(true);
          setUploading(false);
          setTimeout(() => {
            setShowMessage(false);
          }, 2000);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log("File available at", downloadURL);
          setCurrentBotProfile(downloadURL);
          setUploading(false);
        }
      );
    } catch (error) {
      setAlertMessage("Error uploading image: ", error);
      setAlertSeverity("error");
      setShowMessage(true);
      setUploading(false);
      setTimeout(() => {
        setShowMessage(false);
      }, 2000);
    }
  };

  const handleButtonClick = () => {
    document.getElementById("fileInput").click();
  };

  useEffect(() => {
    if (progress >= 100 && progressInterval) {
      clearInterval(progressInterval);
      setProgressInterval(null);
    }
  }, [progress, progressInterval]);

  const startProgress = () => {
    if (progressInterval) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        const nextStep = progressSteps.find((step) => step > prev) || 100;
        return nextStep;
      });
    }, 6000);
    setProgressInterval(interval);
  };

  const stopProgress = () => {
    if (progressInterval) {
      clearInterval(progressInterval);
      setProgressInterval(null);
      setProgress(100);
    }
  };

  const handleCreateChatbot = async () => {
    if (
      !chatbotName ||
      (!webURL && dataType === "URL") ||
      (dataType === "File" && !file)
    ) {
      setAlertMessage(`Please fill in all required fields.`);
      setAlertSeverity("error");
      setShowMessage(true);
      setTimeout(() => {
        setShowMessage(false);
      }, 2000);
      return;
    }
    await fetchChatBots();

    try {
      setLoading(true);
      startProgress();
      const formData = {
        name: chatbotName,
        tagline,
        userId: userData._id,
        botPicUrl: currentBotProfile,
        greetingMessage,
        fallbackMessage,
        prompt,
      };

      let response;

      if (dataType === "URL") {
        formData.webURL = webURL;

        response = await axios.post(
          "https://chatbuilder-puce.vercel.app/api/chatbot/create",
          formData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      } else if (dataType === "File") {
        formData.file = file;

        response = await axios.post(
          "https://chatbuilder-puce.vercel.app/api/chatbot/pdfScrape",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }
      setAlertMessage("Chat Bot Created");
      setAlertSeverity("success");
      setShowMessage(true);

      fetchChatBots();
      setLoading(false);
      stopProgress();
      setCookie("botDetail", response?.data);
      setTimeout(() => {
        setShowMessage(false);
        onClose();
      }, 2000);
    } catch (error) {
      setAlertMessage(
        error.response?.data?.message || error.message || "Something went wrong"
      );
      setAlertSeverity("error");
      setShowMessage(true);
      setTimeout(() => {
        setLoading(false);
        stopProgress();
        setAlertMessage(
          error.response?.data?.message ||
            error.message ||
            "Something went wrong"
        );
        setAlertSeverity("error");
        setShowMessage(true);
      }, 2000);
      setTimeout(() => {
        setShowMessage(false);
        onClose();
      }, 2000);
    }
  };

  const createBot = async () => {
    await handleCreateChatbot();

    await fetchChatBots();
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
      {loading ? (
        <div className="fixed inset-0 bg-white w-[100%] max-w-full max-h-[100vh] backdrop-blur-sm z-50 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md px-4">
            <div className="p-6 bg-white rounded-2xl shadow-xl border border-gray-100 animate-pulse">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative size-12">
                  <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
                </div>

                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Crafting Your Chatbot...
                  </h3>
                  <p className="text-sm text-gray-500">
                    We're assembling your AI companion with care
                  </p>
                </div>

                <div className="w-full space-y-3">
                  <div className="h-2.5 bg-gray-100 rounded-full w-full">
                    <div
                      className="h-2.5 bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Initializing modules</span>
                    <span>{progress}%</span>
                  </div>
                </div>

                <div className="flex space-x-4 opacity-75">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <div className="size-6 bg-gradient-to-r from-blue-400 to-purple-400 rounded-md"></div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-lg animate-bounce-slow">
                    <div className="size-6 bg-gradient-to-r from-green-400 to-blue-400 rounded-md"></div>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <div className="size-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-md"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div
          className="bg-white rounded-lg shadow-lg w-[90%] max-w-[90vw] max-h-[90vh] overflow-y-auto lg:p-6 md:p-5 sm:p-4 p-3"



              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#b0b0b0 #F3F4F6",
              }}
            >
              <div className="flex justify-between items-center border-b pb-3">
                <h2 className="text-xl font-semibold text-gray-800">
                  Create an AI Chatbot
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <i className="fa-solid fa-xmark text-lg"></i>
                </button>
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  Step 1 of 3: Basic Details
                </h3>
                <div className="mx-auto lg:p-6 md:p-5 sm:p-4 p-3 bg-white shadow-lg rounded-lg mt-5 border border-gray-200">
                  <div className="flex items-center space-x-4">
                    <label className="relative cursor-pointer">
                      <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center cursor-pointer overflow-hidden border border-gray-400 relative">
                        {profilePic ? (
                          <img
                            src={profilePic}
                            alt="Profile Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : currentBotProfile ? (
                          <img
                            src={currentBotProfile}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-500">
                            📷
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>

                    <div className="w-full">
                      <label className="block text-gray-700 font-semibold">
                        Name of Chatbot *
                      </label>
                      <input
                        type="text"
                        className="border border-gray-300 rounded-md p-2 w-full mt-1"
                        placeholder="Enter chatbot name"
                        value={chatbotName}
                        onChange={(e) => setChatbotName(e.target.value)}
                      />
                    </div>
                  </div>
                  {uploading && (
                    <div className="w-[100%] text-center mt-4">
                      <p className="text-sm text-gray-600">
                        Uploading: {uploadProgress}%
                      </p>
                      <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                        <div
                          className="h-2 bg-blue-500 rounded-full"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  {error && (
                    <p className="text-red-500 text-sm mt-2">{error}</p>
                  )}

                  <div className="mt-3">
                    <label className="block text-gray-700 font-semibold">
                      Tagline
                    </label>
                    <input
                      type="text"
                      className="border border-gray-300 rounded-md p-2 w-full mt-1"
                      value={tagline}
                      readOnly
                      disabled
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg mt-4 font-semibold text-gray-700">
                  Step 2: Data Source
                </h3>
                <div className="mx-auto lg:p-6 md:p-5 sm:p-4 p-3 bg-white shadow-lg rounded-lg mt-5 border border-gray-200">
                  <div className="flex space-x-4">
                    <label className="flex items-center font-semibold space-x-2">
                      <input
                        type="radio"
                        name="dataType"
                        value="URL"
                        checked={dataType === "URL"}
                        onChange={() => setDataType("URL")}
                      />
                      <span>URL</span>
                    </label>
                    <label className="flex items-center font-semibold space-x-2">
                      <input
                        type="radio"
                        name="dataType"
                        value="File"
                        checked={dataType === "File"}
                        onChange={() => setDataType("File")}
                      />
                      <span>PDF & TXT</span>
                    </label>
                  </div>

                  {dataType === "URL" && (
                    <div className="mt-3">
                      <input
                        type="text"
                        className="border border-gray-300 rounded-md p-2 w-full"
                        placeholder="Enter a link to your knowledge base"
                        value={webURL}
                        onChange={(e) => setWebURL(e.target.value)}
                      />
                    </div>
                  )}
                  {dataType === "File" && (
                    <div className="mt-3">
                      <p className="border border-gray-500 text-gray-500 mb-2 font-bold text-[10px] mt-1 w-max px-2 rounded">
                        <span className="text-red-500 font-bold text-[10px]">
                          Supported:
                        </span>{" "}
                        PDF & TXT
                      </p>
                      <button
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                        onClick={handleButtonClick}
                      >
                        <i className="fa-solid fa-file-arrow-up mr-2"></i>{" "}
                        Upload File
                      </button>
                      <input
                        type="file"
                        id="fileInput"
                        className="hidden"
                        accept=".pdf,.txt"
                        onChange={handleFileChange}
                      />

                      {file && (
                        <p className="mt-3 text-gray-700 text-[12px]">
                          Selected file:{" "}
                          <span className="font-semibold">{file.name}</span>
                        </p>
                      )}
                      {error && (
                        <p className="mt-2 text-red-500 font-bold text-[12px]">
                          {error}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-700">
                  Step 3: Customise Response
                </h3>
                <div className="mx-auto lg:p-6 md:p-5 sm:p-4 p-3 bg-white shadow-lg rounded-lg mt-5 border border-gray-200">
                  <div className="mb-4">
                    <label className="block text-sm font-medium">
                      AI Model
                    </label>
                    <select className="w-full mt-1 p-2 border rounded-md">
                      <option>gemini-2.0-flash (uses 1 message)</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium">
                      Chatbot Role
                    </label>
                    <select className="w-full mt-1 p-2 border rounded-md">
                      <option>Custom</option>
                    </select>
                    <textarea
                      style={{
                        scrollbarWidth: "thin",
                        scrollbarColor: "#b0b0b0 #F3F4F6",
                      }}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="w-full mt-2 p-2 border rounded-md h-64"
                    />
                  </div>

                  <div className="mb-4 flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4" />
                    <label className="text-sm">
                      Override prompt safeguards
                    </label>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium">
                      Language
                    </label>
                    <select className="w-full mt-1 p-2 border rounded-md">
                      <option>English</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium">
                      Greeting Message
                    </label>
                    <input
                      type="text"
                      className="w-full mt-1 p-2 border rounded-md"
                      placeholder="Enter a default greeting message for your bot"
                      value={greetingMessage}
                      onChange={(e) => setGreetingMessage(e.target.value)}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium">
                      Fallback Message
                    </label>
                    <input
                      type="text"
                      className="w-full mt-1 p-2 border rounded-md"
                      placeholder="Enter a default fallback message for your bot"
                      value={fallbackMessage}
                      onChange={(e) => setFallbackMessage(e.target.value)}
                    />
                  </div>

                  <div className="mb-4 flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="w-4 h-4"
                      checked={citeSources}
                      onChange={() => setCiteSources(!citeSources)}
                    />
                    <label className="text-sm">
                      Cite URL sources when answering?
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="bg-gray-300 font-semibold text-gray-700 px-4 py-2 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={createBot}
                  className={`bg-blue-500 text-white px-4 py-2 rounded-md font-semibold ${
                    modalLoading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-blue-600"
                  }`}
                  disabled={modalLoading}
                >
                  {modalLoading ? "Creating..." : "Create Now"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ChatbotModal;
