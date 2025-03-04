//? Import utility functions from utils module
import {
  createChatWidget,
  getChatbotData,
  getScriptTag,
  injectStyles,
} from "./utils.js";

//? The main function which extracts chatbot config details from the script and injects chatbot widget in the DOM
async function injectWidget() {
  //* Create an object to contain chabot details
  const chatbotConfig = {
    name: "",
    tagline: "",
    id: "",
    size: "",
  };

  //* Get the script tag from html
  const script = getScriptTag();

  //* Extract the chatbot details from script tag attributes
  chatbotConfig.name = script.getAttribute("data-name");
  chatbotConfig.tagline = script.getAttribute("data-tagline");
  chatbotConfig.id = script.getAttribute("data-id");
  chatbotConfig.size = script.getAttribute("data-size");

  //* Throw error if any of the required attributes is missing
  for (const key in chatbotConfig) {
    if (!chatbotConfig[key]) {
      throw Error(`Missing required attribute ${key}.`);
    }
  }

  const preview = script.getAttribute("data-preview");
  if (preview === "true") {
    chatbotConfig.preview = true;
  }
  const isMovable = script.getAttribute("data-movable");
  if (isMovable === "true") {
    chatbotConfig.movable = true;
  }

  //* Throw error if the size attribute does not contain a valid size value
  if (!["small", "medium", "large"].includes(chatbotConfig.size)) {
    throw Error(`Invalid attribute value data-size : ${chatbotConfig.size}`);
  }

  //* Fetch the chatbot's data using its id and grab its img url
  await getChatbotData(chatbotConfig);

  //* Log the attributes to the console for debugging
  console.log("Chatbot Name ===>>>", chatbotConfig.name);
  console.log("Chatbot Tagline ===>>>", chatbotConfig.tagline);
  console.log("Chatbot ID ===>>>", chatbotConfig.id);
  console.log("Chatbot Movable ===>>>", chatbotConfig.movable);

  //* Inject the stylessheet for styling the elements
  injectStyles(chatbotConfig);
  console.log("Injected css styles");

  //* The function which creates widget by passing chatbotConfig details to createChatbotWidget funciton and appends the widget in the main document
  const createAndAppendWidget = () => {
    const widget = createChatWidget(chatbotConfig);
    widget.className = "widget-container";
    document.body.appendChild(widget);
    document.documentElement.lang = "en";
    console.log("Widget created and appended");
  };

  //* Create and append widget immediately when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createAndAppendWidget);
  } else {
    createAndAppendWidget();
  }
}

//* Call the main fucntion to inject widget having chatbot details and styles
injectWidget();
