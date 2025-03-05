"use client";
import axios from "axios";
import remarkGfm from "remark-gfm";
import { getCookie } from "cookies-next";
import ReactMarkdown from "react-markdown";
import { useState, useEffect, useRef } from "react";

const ChatbotHistory = () => {
  const [botPic, setBotPic] = useState();
  const [userId, setUserId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [viewMode, setViewMode] = useState("history");
  const [chatMessages, setChatMessages] = useState({});
  const [selectedChat, setSelectedChat] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages[selectedChat]]);

  useEffect(() => {
    const cookieData = getCookie("userData");
    if (cookieData) {
      const parsedUser = JSON.parse(cookieData);
      setUserId(parsedUser._id);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchChatHistory();
    }
  }, [userId]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat) return;
      try {
        const response = await axios.get(
          `https://chatbuilder-puce.vercel.app//api/chatbot/getmessages/${selectedChat}`
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
  }, [selectedChat]);

  const fetchChatHistory = async () => {
    try {
      const response = await axios.post(
        "https://chatbuilder-puce.vercel.app//api/chatbot/getchathistory",
        { id: userId }
      );
      setChatHistory(response.data.data);
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (chatHistory.length > 0) {
      const currentChat = chatHistory.find((chat) => chat._id === selectedChat);
      setBotPic(currentChat?.botPicUrl || "");
    }
  }, [chatHistory, selectedChat]);

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
          className="w-10 h-10 bg-gray-300 rounded-full object-cover "
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
    <section className="w-full h-auto md:h-[80vh] max-w-6xl mx-auto rounded-lg overflow-hidden border shadow-lg flex flex-col md:flex-row">
      <div className="md:hidden bg-gray-100 p-3 border-b flex justify-between items-center">
        <label className="font-semibold text-sm">View:</label>
        <select
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value)}
          className="border p-1.5 font-bold rounded-md text-sm"
        >
          <option value="history">History</option>
          <option value="chat">Current Chat</option>
        </select>
      </div>
      <div
        className={`w-full md:w-1/3 bg-gray-100 p-4 border-r ${
          isMobile && viewMode !== "history" ? "hidden" : "block"
        }`}
      >
        {chatHistory.length > 0 ? (
          <>
            <h3 className="font-semibold text-lg mb-3">Chat History</h3>
            <div
              className="max-h-[60vh] md:max-h-[calc(85vh-150px)] overflow-y-auto pr-4"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#b0b0b0 #F3F4F6",
              }}
            >
              {chatHistory.map((chat) => (
                <div
                  key={chat._id}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedChat === chat._id
                      ? "bg-blue-600 text-white"
                      : "bg-white hover:bg-gray-50"
                  } shadow-sm mb-2`}
                  onClick={() => {
                    setSelectedChat(chat._id);
                    setViewMode("chat");
                  }}
                >
                  <p className="text-sm md:text-base">{chat.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(chat.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <p className="text-lg md:text-xl font-semibold">No chatlogs</p>
            </div>
          </>
        )}
      </div>

      <div
        className={`w-full md:w-2/3 flex flex-col ${
          isMobile && viewMode !== "chat" ? "hidden" : "block"
        }`}
      >
        {selectedChat ? (
          <>
            <div className="bg-blue-600 text-white p-4 flex items-center">
              <img
                src={
                  botPic ||
                  "https://pics.craiyon.com/2024-01-10/TvlRGJDhR9-J2TbOqngHpw.webp"
                }
                className="w-10 h-10 bg-gray-300 rounded-full object-cover mr-2"
                alt="Bot"
              />
              <h2 className="text-lg font-semibold">
                {chatHistory.find((chat) => chat._id === selectedChat)?.name}
              </h2>
            </div>
            <div
              className="flex-grow p-4 overflow-y-auto bg-gray-100 md:max-h-[calc(95vh-150px)]"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#b0b0b0 #F3F4F6",
              }}
            >
              {chatMessages[selectedChat]?.map((msg) => (
                <MessageBubble key={msg._id} msg={msg} />
              ))}
              {isTyping && (
                <div className="flex items-start gap-2 mb-3 pr-1">
                  <img
                    src={
                      botPic ||
                      "https://pics.craiyon.com/2024-01-10/TvlRGJDhR9-J2TbOqngHpw.webp"
                    }
                    alt="Bot"
                    className="w-8 h-8 rounded-full flex-shrink-0"
                  />
                  <div className="px-2 py-2 rounded-lg shadow-sm bg-white border border-gray-200 min-h-[32px] w-35">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="text-lg md:text-xl p-4 font-semibold">
              Chatbot not found
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ChatbotHistory;