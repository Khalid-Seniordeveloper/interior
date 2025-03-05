"use client";
import axios from "axios";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { getCookie } from "cookies-next";
import ReactMarkdown from "react-markdown";
import { useState, useEffect, useRef } from "react";

const CurrentChatbox = ({ chatId, chatbot }) => {
  const messagesEndRef = useRef(null);
  const [botPic, setBotPic] = useState("");
  const [userId, setUserId] = useState(null);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatMessages, setChatMessages] = useState({});
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageId, setMessageId] = useState(chatId || null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;
    try {
      const response = await axios.get(
        `https://chatbuilder-puce.vercel.app//api/chatbot/getmessages/${selectedChat}`
      );
      const fetchedMessages = response.data.data || [];
      console.log(fetchedMessages);
      setChatMessages((prev) => ({
        ...prev,
        [selectedChat]: [...(prev[selectedChat] || []), ...fetchedMessages],
      }));
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
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
    if (chatId) {
      setMessageId(chatId);
      setSelectedChat(chatId);

      if (chatbot?.greetingMessage) {
        setChatMessages((prev) => ({
          ...prev,
          [chatId]: [
            {
              _id: chatbot._id,
              text: chatbot.greetingMessage,
              sender: "bot",
              timestamp: Date.now(),
            },
          ],
        }));
      } else {
        setChatMessages((prev) => ({
          ...prev,
          [chatId]: [
            {
              _id: chatbot._id,
              text: "Hello, how may I help you?",
              sender: "bot",
              timestamp: Date.now(),
            },
          ],
        }));
      }
    }
  }, [chatId, chatbot]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [selectedChat]);

  const sendMessage = async () => {
    if (message.trim() === "" || !selectedChat) return;

    // Create dummy IDs for now.
    const dummyUserMessageId = `user-${Date.now()}`;
    const dummyBotMessageId = `bot-${Date.now()} + 1`;

    // Create and add the user message using the dummy ID.
    const userMessage = {
      text: message,
      sender: "user",
      _id: dummyUserMessageId,
      timestamp: Date.now(),
    };

    const soundEffect = new Audio("/chat.mp3");
    soundEffect.play();
    setChatMessages((prev) => ({
      ...prev,
      [selectedChat]: [...(prev[selectedChat] || []), userMessage],
    }));
    setMessage("");

    try {
      setIsTyping(true);

      const response = await fetch(
        `https://chatbuilder-puce.vercel.app//api/chatbot/ask?question=${encodeURIComponent(
          message
        )}&chatbotId=${selectedChat}`
      );
      console.log("Response", response);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let botResponse = "";

      // Add a dummy bot message to the state.
      setChatMessages((prev) => ({
        ...prev,
        [selectedChat]: [
          ...(prev[selectedChat] || []),
          {
            _id: dummyBotMessageId,
            text: "Thinking...",
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

            // Check if this is the final chunk that contains the real message IDs.
            if (data.startsWith("[DONE")) {
              // Expected format: "[DONE} {\"userMessageId\": \"real-user-id\", \"botMessageId\": \"real-bot-id\"}"
              const jsonStartIndex = data.indexOf("{");
              if (jsonStartIndex !== -1) {
                const jsonStr = data.substring(jsonStartIndex);
                try {
                  const { userMessageId, botMessageId } = JSON.parse(jsonStr);
                  // Update state: replace dummy IDs with the real ones and finalize the bot response.
                  setChatMessages((prev) => ({
                    ...prev,
                    [selectedChat]: prev[selectedChat].map((msg) => {
                      if (msg._id === dummyUserMessageId) {
                        return { ...msg, _id: userMessageId };
                      } else if (msg._id === dummyBotMessageId) {
                        return {
                          ...msg,
                          _id: botMessageId,
                          text: botResponse.trim(),
                        };
                      }
                      return msg;
                    }),
                  }));
                } catch (err) {
                  console.error("Error parsing message IDs:", err);
                }
              }
              // End the stream processing.
              return;
            } else {
              // Append the data chunk to the botResponse.
              botResponse += data + " ";

              // Update the dummy bot message text with the current botResponse.
              setChatMessages((prev) => {
                const updatedMessages = prev[selectedChat].map((msg) =>
                  msg._id === dummyBotMessageId
                    ? { ...msg, text: botResponse.trim() + "..." }
                    : msg
                );
                return { ...prev, [selectedChat]: updatedMessages };
              });
            }
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsTyping(false);
    }
  };

  // const fetchMessages = async () => {
  //   if (!selectedChat) return;
  //   try {
  //     const response = await axios.get(
  //       https://chatbuilder-puce.vercel.app//api/chatbot/getmessages/${selectedChat}
  //     );
  //     const fetchedMessages = response.data.data || [];
  //     setChatMessages((prev) => ({
  //       ...prev,
  //       [selectedChat]: fetchedMessages, // Replace the existing messages with the fetched ones
  //     }));
  //   } catch (error) {
  //     console.error("Error fetching messages:", error);
  //   }
  // };
  const fetchChatHistory = async () => {
    try {
      const response = await axios.post(
        "https://chatbuilder-puce.vercel.app//api/chatbot/getchathistory",
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

  const MessageBubble = ({ msg, onDelete }) => {
    // console.log("Message ID:", msg._id, "| Sender:", msg.sender);
    const [showDeleteButton, setShowDeleteButton] = useState(false);

    return (
      <div
        className={`flex items-start gap-2 mb-3 pr-1 ${
          msg.sender === "user" ? "justify-end" : "justify-start"
        }`}
        onMouseEnter={() => setShowDeleteButton(true)}
        onMouseLeave={() => setShowDeleteButton(false)}
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

        <div className="relative px-3 py-2 rounded-lg shadow-sm bg-white border border-gray-200 min-h-[40px] max-w-[85%]">
          {showDeleteButton && (
            <button
              onClick={() => onDelete(msg._id)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              style={{ width: "24px", height: "24px" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}

          <ReactMarkdown
            key={msg.text}
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            className="markdown-content"
          >
            {msg.text}
          </ReactMarkdown>
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
  };

  const deleteMessage = async (messageId) => {
    try {
      console.log("MessageId", messageId);
      console.log("Chatbot Id", chatbot._id);
      // Call the backend API to delete the message
      await axios.delete(`https://chatbuilder-puce.vercel.app//api/chatbot/deletemessage`, {
        params: { messageId, chatbotId: chatbot._id },
      });

      // Update the local state to remove the deleted message
      setChatMessages((prev) => {
        if (!prev[selectedChat]) return prev; // Ensure selectedChat exists

        const updatedMessages = prev[selectedChat].filter(
          (msg) => msg._id !== messageId
        );
        return { ...prev, [selectedChat]: updatedMessages };
      });
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  return (
    <>
      <section className="w-full h-auto md:h-[80vh] mx-auto rounded-lg overflow-hidden border shadow-lg flex flex-col md:flex-row">
        <div className="w-full h-full flex flex-col">
          <div className="bg-blue-600 flex text-white p-4 items-center">
            <img
              src={
                botPic ||
                "https://pics.craiyon.com/2024-01-10/TvlRGJDhR9-J2TbOqngHpw.webp"
              }
              className="w-10 h-10 bg-gray-300 rounded-full object-cover mr-3"
              alt="Bot"
            />
            <div>
              <h2 className="text-lg font-semibold">
                {chatHistory.find((chat) => chat._id === selectedChat)?.name}
              </h2>
              <p className="text-xs text-white-500">
                {new Date(
                  chatHistory.find(
                    (chat) => chat._id === selectedChat
                  )?.createdAt
                ).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div
            className="flex-grow p-4 overflow-y-auto bg-gray-100 h-[80vh]"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#b0b0b0 #F3F4F6",
            }}
          >
            {chatMessages[selectedChat]?.map((msg) => (
              <MessageBubble key={msg._id} msg={msg} onDelete={deleteMessage} />
            ))}

            {isTyping && (
              <div className="flex items-start gap-2 mb-3 pr-1">
                <img
                  src={
                    botPic ||
                    "https://pics.craiyon.com/2024-01-10/TvlRGJDhR9-J2TbOqngHpw.webp"
                  }
                  alt="Bot"
                  className="w-10 h-10 bg-gray-300 rounded-full object-cover"
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
          <div className="flex items-center bg-white border-t p-2 md:p-3">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-grow p-2 border rounded-lg outline-none"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              disabled={isTyping}
            />
            <button
              onClick={sendMessage}
              disabled={isTyping}
              className="ml-2 w-9 h-9 bg-blue-600 text-white p-2 rounded-full shadow-md hover:bg-blue-700 disabled:opacity-50"
            >
              <svg
                className="w-5 h-5"
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
        </div>
      </section>
    </>
  );
};

export default CurrentChatbox;
