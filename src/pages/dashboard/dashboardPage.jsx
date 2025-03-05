"use client";
import axios from "axios";
import Image from "next/image";
import { Alert } from "@mui/material";
import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import styles from "../../styles/dashboard.module.css";
import ChatbotModal from "../../components/modal/chatbotmodal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEdit,
  faCode,
  faClone,
  faTrash,
  faEllipsisV,
} from "@fortawesome/free-solid-svg-icons";
import loadingImg from "../../public/images/loading.gif";
import { faTimes, faCopy } from "@fortawesome/free-solid-svg-icons";

const Dashboard = () => {
  const router = useRouter();
  const modalRef = useRef(null);
  const dropdownRef = useRef(null);
  const [copied, setCopied] = useState("");
  const [botData, setBotData] = useState([]);
  const [userId, setUserId] = useState(null);
  const [editName, setEditName] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentName, setCurrentName] = useState("");
  const [editTagline, setEditTagline] = useState("");
  const [botStatuses, setBotStatuses] = useState({});
  const [isModalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("widget");
  const [showMessage, setShowMessage] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(null);
  const [currentTagline, setCurrentTagline] = useState("");
  const [alertMessage, setAlertMessage] = useState("null");
  const [alertSeverity, setAlertSeverity] = useState("success");
  const [selectedBotForEmbed, setSelectedBotForEmbed] = useState(null);
  const [config, setConfig] = useState({
    widgetSize: "small",
    buttonSize: "normal",
    offsetRightDesktop: 0,
    offsetRightMobile: 0,
    widgetDisplay: "entire-site",
    isMovable: false,
  });

  useEffect(() => {
    const cookieData = getCookie("userData");
    if (cookieData) {
      const parsedUser = JSON.parse(cookieData);
      setUserId(parsedUser._id);
    }
  }, []);

  const fetchChatBots = async () => {
    if (!userId) return;
    try {
      const response = await axios.post(
        "https://chatbuilder-puce.vercel.app//api/chatbot/getchathistory",
        { id: userId }
      );
      setBotData(response.data);

      const statuses = response.data?.data.reduce((acc, bot) => {
        acc[bot._id] = bot.status;
        return acc;
      }, {});
      setBotStatuses(statuses);
    } catch (error) {
      console.error("Error fetching chatbots:", error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchChatBots();
    }
  }, [userId, isModalOpen]);

  const handleBotClick = (botId) => {
    router.push(`/dashboard/chatbot/${botId}`);
  };

  const handlePreview = (botId) => {
    router.push(`/preview/${botId}`);
  };

  const handlePreviewWidget = (botData) => {
    router.push(
      `/widget?name=${botData.name}&tagline=${botData.tagline}&id=${botData._id}&size=${config.widgetSize}&movable=${config.isMovable}`
    );
  };

  const toggleDropdown = (botId) => {
    setDropdownOpen((prev) => (prev === botId ? null : botId));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(null);
      }
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setEditModalOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const deleteChatbot = async (botId) => {
    try {
      const response = await axios.delete(
        "https://chatbuilder-puce.vercel.app//api/chatbot/delete",
        { data: { chatbotId: botId } }
      );
      setAlertMessage(`Chat bot deleted.`);
      setAlertSeverity("success");
      setShowMessage(true);
      setTimeout(() => {
        setShowMessage(false);
      }, 2000);
      await fetchChatBots();
    } catch (error) {
      setAlertMessage(`Failed to delete the bot`);
      setAlertSeverity("error");
      setShowMessage(true);
      setTimeout(() => {
        setShowMessage(false);
      }, 2000);
    }
  };

  const generateWidgetScriptCode = (bot) => {
    return `
  <script
   type="module"
   src="http://localhost:3000/main.js"
   data-name="${bot.name}"
   data-tagline="${bot.tagline}"
   data-id="${bot._id}"
   data-size="${config.widgetSize}"
   data-movable=${config.isMovable}
   >
  </script>
    `;
  };

  const generateIframeCode = (bot) => {
    return `
    <iframe
        src="http://localhost:3000/preview/${bot._id}?userId=${userId}"
        style="
        border: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 9999;"
        allow="clipboard-read; clipboard-write">
    </iframe>`;
  };

  const copyToClipboard = async (text, type) => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(""), 2000);
    setAlertMessage(`Copied`);
    setAlertSeverity("success");
    setShowMessage(true);
    setTimeout(() => {
      setShowMessage(false);
    }, 1000);
  };

  const handleStatusToggle = async (chatBotId) => {
    try {
      const response = await axios.post(
        "https://chatbuilder-puce.vercel.app//api/chatbot/toggleChatbotStatus",
        {
          chatBotId,
        }
      );

      if (response.data.success) {
        const updatedStatus = response.data.data.status;
        setBotStatuses((prevStatuses) => ({
          ...prevStatuses,
          [chatBotId]: updatedStatus,
        }));
        setAlertMessage(`The bot is now ${updatedStatus}`);
        setAlertSeverity("success");
        setShowMessage(true);
        setTimeout(() => {
          setShowMessage(false);
        }, 2000);
      } else {
        setAlertMessage(`Failed to update the status.`);
        setAlertSeverity("error");
        setShowMessage(true);
        setTimeout(() => {
          setShowMessage(false);
        }, 2000);
      }
    } catch (error) {
      setAlertMessage(`Failed to update the status.`);
      setAlertSeverity("error");
      setShowMessage(true);
      setTimeout(() => {
        setShowMessage(false);
      }, 2000);
    }
  };

  const editChatbot = async (botId) => {
    if (!botId) {
      console.error("Bot ID is undefined");
      return;
    }

    if (editName === currentName && editTagline === currentTagline) {
      setEditModalOpen(null);
      return;
    }

    try {
      const response = await axios.put(
        ` https://chatbuilder-puce.vercel.app//api/chatbot/edit/${botId}`,
        {
          name: editName || currentName,
          tagline: editTagline || currentTagline,
        }
      );

      setAlertMessage(response?.data?.message);
      setAlertSeverity("success");
      setShowMessage(true);
      setTimeout(() => {
        setShowMessage(false);
      }, 2000);
      fetchChatBots();
      setEditModalOpen(null);
      setEditName("");
      setEditTagline("");
    } catch (error) {
      setAlertMessage("Failed to update chatbot. Please try again.");
      setAlertSeverity("error");
      setShowMessage(true);
      setTimeout(() => {
        setShowMessage(false);
      }, 2000);
    }
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
      <div className="flex flex-col md:flex-row justify-between overflow-x-auto h-auto items-start md:items-center p-3 bg-white shadow-md w-full  gap-2">
        <div className="flex items-center space-x-2 flex-wrap">
          <span className="bg-blue-100 text-blue-600 font-bold px-3 py-1 rounded text-xs md:text-sm">
            FREE
          </span>
          <span className="text-gray-600 text-xs md:text-sm font-semibold">
            10 messages remaining
          </span>
          <div className="h-2 w-16 md:w-24 bg-green-500 rounded-full"></div>
        </div>

        <div className="hidden min-[1000px]:flex flex-wrap gap-2 w-full md:w-auto">
          <button className="bg-blue-600 text-white text-xs md:text-sm font-semibold px-3 md:px-4 py-1.5 md:py-2 rounded">
            Upgrade
          </button>
          <button className="bg-green-500 text-white px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-semibold rounded">
            Chatbot underperforming?
          </button>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <div className={styles.btnFlex}>
          <div className="">
            <h2 className="text-xl font-semibold mt-3 mb-3">Dashboard</h2>
            <div className="flex flex-wrap sm-block items-center bg-gray-200 p-1 rounded-full w-fit">
              <button className="px-4 py-2 text-sm font-medium rounded-full bg-white shadow text-black">
                Personal
              </button>
              <button className="px-4 py-2 text-sm font-medium rounded-full text-gray-500">
                Shared with me
              </button>
            </div>
          </div>
          {botData?.data?.length > 5 ? (
            <>
              <div className="relative group inline-block">
                <button
                  className={`${styles.createBotBtn}  rounded-lg cursor-not-allowed flex items-center space-x-2`}
                  disabled
                >
                  <i className="fa-solid fa-plus"></i>
                  <span>Create Bot</span>
                </button>

                <div className="absolute left-3 transform -translate-x-1/2 mt-2 w-64 text-sm bg-gray-900 text-white p-3 rounded-lg invisible group-hover:visible group-hover:opacity-100 opacity-0 transition-opacity duration-300 shadow-lg z-50">
                  You have reached the maximum number of Chatbots for your
                  current plan. If you need more Chatbots, please head to
                  Subscription and upgrade your plan.
                  <div className="absolute left-1/2 transform -translate-x-1/2 -top-1 w-4 h-4 bg-gray-900 rotate-45"></div>
                </div>
              </div>
            </>
          ) : (
            <>
              <button
                className={styles.createBotBtn}
                onClick={() => setModalOpen(true)}
              >
                <i className="fa-solid fa-plus mr-2"></i> Create Bot
              </button>
            </>
          )}
        </div>

        <div className="p-4 bg-white rounded-xl overflow-x-auto">
          <div className="h-[100vh] w-full">
            <table className="w-max sm:w-max md:w-max lg:w-full bg-[#fff]">
              <thead>
                <tr className="bg-white border-b">
                  <th className="px-4 py-3 text-center text-xs md:text-[13px] text-gray-700">
                    BOT NAME
                  </th>
                  <th className="px-4 py-3 text-center text-xs md:text-[13px] text-gray-700">
                    STATUS
                  </th>
                  <th className="px-4 py-3 text-center text-xs md:text-[13px] text-gray-700">
                    PAGES CRAWLED
                  </th>
                  <th className="px-4 py-3 text-center text-xs md:text-[13px] text-gray-700">
                    FILES INDEXED
                  </th>
                  <th className="px-4 py-3 text-center text-xs md:text-[13px] text-gray-700">
                    PDF FILE
                  </th>
                  <th className="px-4 py-3 text-center text-xs md:text-[13px] text-gray-700">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {botData?.data?.length > 0 ? (
                  botData?.data?.map((bot) => (
                    <tr key={bot._id} className="border-b">
                      <td className="px-4 py-4 flex items-center space-x-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-300 rounded-full">
                          <img
                            src={
                              bot?.botPicUrl ||
                              "https://pics.craiyon.com/2024-01-10/TvlRGJDhR9-J2TbOqngHpw.webp"
                            }
                            alt="Chatbot Logo"
                            className="w-full h-full rounded-full object-cover"
                          />
                        </div>
                        <div>
                          <p
                            className="text-blue-500 text-sm md:text-[16px] capitalize font-semibold cursor-pointer"
                            onClick={() => handleBotClick(bot._id)}
                          >
                            {bot.name}
                          </p>
                          <p className="text-[#718096] font-semibold text-xs">
                            Customer Support
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        {bot.status === "pending" ? (
                          <div className="flex items-center">
                            <Image
                              src={loadingImg}
                              priority={true}
                              className="w-4 h-4"
                              width={18}
                              height={18}
                              alt="Loading..."
                            />
                          </div>
                        ) : bot.status === "failed" ? (
                          <div className="flex items-center space-x-2 text-red-500">
                            <span className="text-xs md:text-sm font-semibold">
                              Failed
                            </span>
                            <button className="bg-red-500 text-white px-2 py-1 rounded-md text-xs hover:bg-red-600 transition">
                              Retry
                            </button>
                          </div>
                        ) : (
                          <label className="relative inline-flex cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={botStatuses[bot._id] === "active"}
                              onChange={() => handleStatusToggle(bot._id)}
                            />
                            <div
                              className={`w-10 h-5 ${
                                botStatuses[bot._id] === "active"
                                  ? "bg-green-500"
                                  : "bg-gray-300"
                              } rounded-full peer peer-checked:after:translate-x-full
                      after:absolute after:top-0.5 after:left-1 after:bg-white 
                      after:border after:rounded-full after:h-4 after:w-4 after:transition`}
                            ></div>
                          </label>
                        )}
                      </td>

                      <td className="px-4 py-4 text-blue-500 font-semibold text-xs md:text-sm">
                        {bot.PagesCrawled}
                      </td>
                      <td className="px-4 py-4 text-gray-700 font-semibold text-xs md:text-sm">
                        0
                      </td>
                      <td className="px-4 py-4 text-gray-700 font-semibold text-xs md:text-sm">
                        {bot?.pdfFile}
                      </td>

                      <td className="px-4 py-4 relative">
                        <button
                          className="px-3 py-1 bg-gray-200 font-bold rounded text-gray-700 hover:bg-gray-300 text-xs md:text-sm"
                          onClick={() => setEditModalOpen(bot._id)}
                        >
                          Edit
                        </button>
                        <button
                          className="ml-2 text-gray-500 hover:text-gray-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDropdown(bot._id);
                          }}
                        >
                          <FontAwesomeIcon icon={faEllipsisV} />
                        </button>

                        {dropdownOpen === bot._id && (
                          <div
                            ref={dropdownRef}
                            className="absolute right-10 mt-2 z-[9999] w-56 bg-white  shadow-lg rounded-lg py-2 "
                          >
                            <button
                              onClick={() => handleBotClick(bot._id)}
                              className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                            >
                              <FontAwesomeIcon icon={faEye} className="mr-2" />
                              View Chatbot
                            </button>
                            <button
                              className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                              onClick={() => setEditModalOpen(bot._id)}
                            >
                              <FontAwesomeIcon icon={faEdit} className="mr-2" />
                              Edit Chatbot
                            </button>
                            <button
                              onClick={() => {
                                setSelectedBotForEmbed(bot);
                                setDropdownOpen(null);
                              }}
                              className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                            >
                              <FontAwesomeIcon icon={faCode} className="mr-2" />
                              Embed to website
                            </button>

                            <button className="flex items-center w-full px-4 py-2 text-gray-400 cursor-not-allowed">
                              <FontAwesomeIcon
                                icon={faClone}
                                className="mr-2"
                              />
                              Duplicate chatbot
                            </button>
                            <button
                              onClick={() => deleteChatbot(bot._id)}
                              className="flex items-center w-full px-4 py-2 text-red-500 hover:bg-red-100"
                            >
                              <FontAwesomeIcon
                                icon={faTrash}
                                className="mr-2"
                              />
                              Delete chatbot
                            </button>
                          </div>
                        )}

                        {editModalOpen === bot._id && (
                          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                            <div
                              ref={modalRef}
                              className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
                            >
                              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                                Edit Chatbot
                              </h2>

                              <div className="flex items-center space-x-4 mb-4">
                                <div className="relative w-16 h-16">
                                  <img
                                    src={
                                      bot?.botPicUrl ||
                                      "https://www.pngall.com/wp-content/uploads/5/User-Profile-PNG-Image.png"
                                    }
                                    alt="Profile"
                                    className="w-16 h-16 rounded-full object-cover border"
                                  />

                                  <button
                                    className="absolute bottom-0 right-0 w-8 h-8 bg-gray-800 text-white p-1 rounded-full flex items-center justify-center"
                                    onClick={() =>
                                      document.getElementById("upload").click()
                                    }
                                  >
                                    <i className="fa-solid fa-camera"></i>
                                  </button>

                                  <input
                                    type="file"
                                    id="upload"
                                    className="hidden"
                                    // onChange={handleImageUpload}
                                  />
                                </div>
                              </div>

                              <label className="block text-gray-600 text-sm font-medium">
                                Name of Chatbot *
                              </label>
                              <input
                                type="text"
                                placeholder={bot?.name}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300 mb-3"
                              />

                              <label className="block text-gray-600 text-sm font-medium">
                                Tagline
                              </label>
                              <input
                                type="text"
                                placeholder={bot.tagline}
                                value={editTagline}
                                onChange={(e) => setEditTagline(e.target.value)}
                                className="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300 mb-3"
                              />

                              <div className="flex justify-end space-x-2 mt-4">
                                <button
                                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                                  onClick={() => setEditModalOpen(null)}
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => editChatbot(bot?._id)}
                                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center p-4 text-gray-500 text-sm"
                    >
                      No chatbots found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedBotForEmbed && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-lg w-[100%] md:w-[100%] sm:w-[100%] max-w-5xl z-[10000]">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">
                Embed {selectedBotForEmbed.name} into your website
              </h3>
              <button
                onClick={() => setSelectedBotForEmbed(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="flex items-center ml-8 mb-4 mt-4 bg-gray-200 p-1 rounded-full w-fit">
              <button
                onClick={() => setActiveTab("widget")}
                className={`px-4 py-2 text-sm font-bold rounded-full ${
                  activeTab === "widget"
                    ? "bg-white shadow text-black"
                    : "text-gray-500"
                }`}
              >
                Widget
              </button>
              <button
                onClick={() => setActiveTab("page")}
                className={`px-4 py-2 text-sm font-bold rounded-full transition-colors ${
                  activeTab === "page"
                    ? "bg-white shadow text-black"
                    : "text-gray-500"
                }`}
              >
                Page
              </button>
            </div>

            <div
              className="p-4 md:p-6 max-h-[70vh] overflow-y-auto "
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#b0b0b0 #F3F4F6",
              }}
            >
              {activeTab === "widget" ? (
                <>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-2/3">
                      <h4 className="font-bold mb-3">How to Embed</h4>
                      <p className="mb-4 text-gray-600 text-sm">
                        Copy and paste this code at the end of the &lt;body&gt;
                        tag
                      </p>

                      <div className="relative">
                        <pre className="bg-gray-100 p-3 rounded-lg mb-4 overflow-x-auto text-sm">
                          {generateWidgetScriptCode(selectedBotForEmbed)}
                        </pre>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              generateWidgetScriptCode(selectedBotForEmbed),
                              "widget"
                            )
                          }
                          className="absolute top-3 right-3 text-gray-500 hover:text-blue-500"
                        >
                          <FontAwesomeIcon icon={faCopy} size="sm" />
                        </button>
                        {copied === "widget" && (
                          <span className="absolute top-3 right-10 text-green-500 text-sm">
                            Copied!
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-8 pl-6 border-l">
                      <h4 className="font-bold mb-4">Configuration</h4>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-1 text-sm">
                        <div className="grid grid-cols-4 col-span-4 gap-2 sm:grid-cols-1 p-2">
                          <div className="font-medium">Widget size:</div>
                          <div>
                            <select
                              value={config.widgetSize}
                              onChange={(e) =>
                                setConfig({
                                  ...config,
                                  widgetSize: e.target.value,
                                })
                              }
                              className="w-full border rounded cursor-pointer px-2 py-1"
                            >
                              <option value="small">Small</option>
                              <option value="medium">Medium</option>
                              <option value="large">Large</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 col-span-4 gap-2 sm:grid-cols-1 p-2">
                          <div className="font-medium">Widget Button size:</div>
                          <div className="sm:col-span-1 col-span-3">
                            <select
                              value={config.buttonSize}
                              onChange={(e) =>
                                setConfig({
                                  ...config,
                                  buttonSize: e.target.value,
                                })
                              }
                              className="w-full border cursor-pointer rounded px-2 py-1"
                            >
                              <option value="medium">Normal</option>
                              <option value="large">Large</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 col-span-4 gap-2 p-2">
                          <div className="font-medium">Widget Display</div>
                          <div className="col-span-3">
                            <select
                              value={config.widgetDisplay}
                              onChange={(e) =>
                                setConfig({
                                  ...config,
                                  widgetDisplay: e.target.value,
                                })
                              }
                              className="w-full border rounded px-2 py-1 cursor-pointer"
                            >
                              <option value="entire-site">Entire Site</option>
                              <option value="hide-specific">
                                Hide for specific URLs
                              </option>
                              <option value="show-specific">
                                Only show on specific URLs
                              </option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 col-span-4 gap-2 p-2">
                          <div className="font-medium">
                            Allow widget to be movable
                          </div>
                          <div className="col-span-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={config.isMovable}
                              onChange={(e) =>
                                setConfig({
                                  ...config,
                                  isMovable: e.target.checked,
                                })
                              }
                              className="h-4 w-4 cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => handlePreviewWidget(selectedBotForEmbed)}
                      className="mt-4 bg-[#399363] font-semibold text-white px-2 py-2 rounded hover:bg-[#2f855a]"
                    >
                      <i className="fa-solid fa-eye mr-2"></i> Review Widget
                    </button>

                    <button
                      onClick={() =>
                        copyToClipboard(
                          generateWidgetScriptCode(selectedBotForEmbed),
                          "widget"
                        )
                      }
                      className="mt-4 bg-blue-500 font-semibold text-white px-2 py-2 rounded hover:bg-blue-600"
                    >
                      <i className="fa-regular fa-clipboard mr-2"></i> Copy to
                      clipboard
                    </button>
                  </div>
                </>
              ) : (
                <div>
                  <h4 className="font-bold mb-3">How to Embed</h4>
                  <p className="mb-4 text-gray-600 text-sm">
                    Copy and paste this code into a page on your website
                  </p>

                  <div className="relative">
                    <pre className="bg-gray-100 p-3 rounded-lg mb-4 overflow-x-auto text-sm">
                      {generateIframeCode(selectedBotForEmbed)}
                    </pre>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          generateIframeCode(selectedBotForEmbed),
                          "page"
                        )
                      }
                      className="absolute top-3 right-3 text-gray-500 hover:text-blue-500"
                    >
                      <FontAwesomeIcon icon={faCopy} size="sm" />
                    </button>
                    {copied === "page" && (
                      <span className="absolute top-3 right-10 text-green-500 text-sm">
                        Copied!
                      </span>
                    )}
                    <div className="flex justify-end gap-4">
                      <button
                        onClick={() => handlePreview(selectedBotForEmbed._id)}
                        className="mt-4 bg-[#399363] font-semibold text-white px-2 py-2 rounded hover:bg-[#2f855a]"
                      >
                        <i className="fa-solid fa-eye mr-2"></i> Review Page
                      </button>

                      <button
                        onClick={() =>
                          copyToClipboard(
                            generateWidgetScriptCode(selectedBotForEmbed),
                            "page"
                          )
                        }
                        className="mt-4 bg-blue-500 font-semibold text-white px-2 py-2 rounded hover:bg-blue-600"
                      >
                        <i className="fa-regular fa-clipboard mr-2"></i> Copy to
                        clipboard
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <ChatbotModal
          isOpen={isModalOpen}
          fetchChatBots={fetchChatBots}
          modalLoading={loading}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
};

export default Dashboard;
