"use client"; // Ensure this is a Client Component

import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getCookie } from "cookies-next";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function PreviewPageContent({ chatId }) {
  const messagesEndRef = useRef(null);
  const searchParams = useSearchParams();
  const [botPic, setBotPic] = useState();
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatMessages, setChatMessages] = useState({});
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageId, setMessageId] = useState(chatId || null);

  useEffect(() => {
    const userIdFromQuery = searchParams.get("userId");
    if (userIdFromQuery) {
      setUserId(userIdFromQuery);
    }

    const receiveMessage = (event) => {
      if (event.origin !== "http://localhost:3000") return;
      if (event.data.userId) {
        setUserId(event.data.userId);
      }
    };

    window.addEventListener("message", receiveMessage);
    return () => window.removeEventListener("message", receiveMessage);
  }, [searchParams]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages[selectedChat], isTyping]);

  useEffect(() => {
    const cookieData = getCookie("userData");
    if (cookieData) {
      const parsedUser = JSON.parse(cookieData);
      setUserId(parsedUser._id);
    }
  }, []);

  useEffect(() => {
    if (selectedChat) {
      const fetchMessages = async () => {
        try {
          const response = await axios.get(
            `https://chatbuilder-puce.vercel.app/api/chatbot/getmessages/${selectedChat}`
          );
          setChatMessages((prev) => ({
            ...prev,
            [selectedChat]: response.data.data || [],
          }));
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      };
      fetchMessages();
    }
  }, [selectedChat]);

  useEffect(() => {
    if (chatId) {
      setMessageId(chatId);
      setSelectedChat(chatId);
    }
  }, [chatId]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sendMessage = async () => {
    if (message.trim() === "" || !selectedChat) return;
    const botMessageId = `bot-${Date.now()}`;
    const userMessage = {
      text: message,
      sender: "user",
      _id: `user-${Date.now()}`,
      timestamp: Date.now(),
    };

    setChatMessages((prev) => ({
      ...prev,
      [selectedChat]: [...(prev[selectedChat] || []), userMessage],
    }));
    setMessage("");

    try {
      setIsTyping(true);
      const response = await fetch(
        `https://chatbuilder-puce.vercel.app/api/chatbot/ask?question=${encodeURIComponent(
          message
        )}&chatbotId=${selectedChat}`
      );

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let botResponse = "";

      setChatMessages((prev) => ({
        ...prev,
        [selectedChat]: [
          ...(prev[selectedChat] || []),
          {
            _id: botMessageId,
            text: "...",
            sender: "bot",
            timestamp: Date.now(),
          },
        ],
      }));

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setIsTyping(false);

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.replace("data: ", "").trim();
            if (data === "[DONE]") {
              setChatMessages((prev) => ({
                ...prev,
                [selectedChat]: prev[selectedChat].map((msg) =>
                  msg._id === botMessageId
                    ? { ...msg, text: botResponse.trim() }
                    : msg
                ),
              }));
            } else {
              botResponse += data + " ";
              setChatMessages((prev) => ({
                ...prev,
                [selectedChat]: prev[selectedChat].map((msg) =>
                  msg._id === botMessageId
                    ? { ...msg, text: botResponse.trim() + "..." }
                    : msg
                ),
              }));
            }
          }
        }
      }
    } catch (error) {
    } finally {
      setIsTyping(false);
    }
  };

  const fetchChatHistory = async () => {
    try {
      const response = await axios.post(
        "https://chatbuilder-puce.vercel.app/api/chatbot/getchathistory",
        { id: userId }
      );
      setChatHistory(response.data.data);
    } catch (error) {
      console.error(
        "Error fetching chat history:",
        error.response?.data || error.message
      );
    }
  };

  useEffect(() => {
    if (chatHistory.length > 0) {
      const currentChat = chatHistory.find((chat) => chat._id === selectedChat);
      setBotPic(currentChat?.botPicUrl || "");
    }
  }, [chatHistory, selectedChat]);

  useEffect(() => {
    if (userId) {
      fetchChatHistory();
    }
  }, [userId]);

  const MessageBubble = ({ msg }) => (
    <div
      className={`flex items-start gap-2 mb-3 pr-1 ${
        msg.sender === "user" ? "justify-end" : "justify-start"
      }`}
    >
      {msg.sender === "bot" && (
        <img
          src={
            botPic ||
            "https://pics.craiyon.com/2024-01-10/TvlRGJDhR9-J2TbOqngHpw.webp"
          }
          alt="Bot"
          className="w-10 h-10 bg-gray-300 rounded-full object-cover"
        />
      )}

      <div className="px-3 py-2 rounded-lg shadow-sm bg-white border border-gray-200 min-h-[40px] max-w-[85%]">
        <ReactMarkdown children={msg.text} remarkPlugins={[remarkGfm]} />
        {msg.timestamp && (
          <p className="text-xs text-gray-500 mt-0.5">
            {new Date(msg.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </p>
        )}
      </div>

      {msg.sender === "user" && (
        <img
          src="https://www.pngall.com/wp-content/uploads/5/User-Profile-PNG-Image.png"
          alt="User"
          className="w-10 h-10 bg-gray-300 rounded-full object-cover"
        />
      )}
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">
      <nav className="bg-gray-100 p-4 shadow-md flex justify-between items-center border-b border-gray-300">
        <h1 className="text-lg font-semibold text-center">Review Page</h1>
      </nav>

      <section className="w-full max-w-4xl mb-4 mt-4 h-auto md:h-[70vh] flex flex-col bg-gray-50 shadow-lg rounded-xl overflow-hidden m-auto flex-grow border border-gray-200">
        <div className="flex items-center bg-blue-500 p-4 space-x-3 text-white">
          <img
            src={
              botPic ||
              "https://pics.craiyon.com/2024-01-10/TvlRGJDhR9-J2TbOqngHpw.webp"
            }
            className="w-12 h-12 rounded-full object-cover border-2 border-white"
            alt="Bot"
          />
          <div>
            <h2 className="text-lg font-semibold">
              {chatHistory.find((chat) => chat._id === selectedChat)?.name ||
                "Chat"}
            </h2>
            <p className="text-sm">
              {new Date(
                chatHistory.find((chat) => chat._id === selectedChat)
                  ?.createdAt || Date.now()
              ).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-4 bg-white h-[70vh] space-y-3 border-b border-gray-200">
          {chatMessages[selectedChat]?.map((msg) => (
            <MessageBubble key={msg._id} msg={msg} />
          ))}
          {isTyping && (
            <div className="flex items-center space-x-2">
              <img
                src={
                  botPic ||
                  "https://pics.craiyon.com/2024-01-10/TvlRGJDhR9-J2TbOqngHpw.webp"
                }
                alt="Bot"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="px-3 py-2 rounded-lg bg-gray-200 flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-400"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex items-center bg-gray-50 p-3 border-t border-gray-300">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-grow p-2 bg-white text-gray-900 rounded-lg outline-none border border-gray-300 focus:border-blue-500"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            disabled={isTyping}
          />
          <button
            onClick={sendMessage}
            disabled={isTyping}
            className="ml-3 w-10 h-10 flex items-center justify-center bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 disabled:opacity-50"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </section>

      <footer className="bg-gray-100 text-gray-600 text-center p-3 text-sm border-t border-gray-300">
        &copy; {new Date().getFullYear()} Chat App. All rights reserved.
      </footer>
    </div>
  );
}

export default function PreviewPage({ chatId }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PreviewPageContent chatId={chatId} />
    </Suspense>
  );
}