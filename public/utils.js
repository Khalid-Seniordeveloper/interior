//? Function to create widget using chatbotConfig details
const createChatWidget = (chatbotConfig) => {
  //* Create a container which occupies all the screen and displays toggle widget button by default
  const chatWidget = document.createElement("main");
  chatWidget.id = "widget-container";

  //* Add the toggle button and chatbox container element in the main container
  chatWidget.innerHTML = `<div id="chat-box-container" class="hidden">
        <!-- Header -->
        <div id="chat-header">
          <div class="chat-header-icon">
            <img class="bot-image"></img>
          </div>
          <div id="chat-header-text-container">
          </div>
          <div class="chat-header-controls">
            <i id="refresh-chat" class="ri-loop-left-fill icon control-icon"></i>
            <i class="ri-mail-fill icon control-icon"></i>
            <i class="ri-thumb-up-fill icon control-icon"></i>
            <i class="ri-thumb-down-fill icon control-icon"></i>
          </div>
        </div>

        <!-- Chat History -->
        <div id="chat-history">
          <!-- Messages will be dynamically added here -->
        </div>

        <!-- Send Message Area -->
        <div class="chat-send-container">
          <input
            id="chat-input"
            placeholder="Start a new message"
            type="text"
          ></input>
          <button id="send-button">
            <i class="ri-send-plane-fill icon send-icon"></i>
          </button>
        </div>
      </div>
      <button id="widget-button">
        <i class="ri-chat-ai-fill" id="widget-button-icon" />
      </button>`;

  //* Get the button using button's id and add event listener to show/hide chatbox on clicking the button
  const toggleWidgetButtton = chatWidget.querySelector("#widget-button");
  toggleWidgetButtton.addEventListener("click", () =>
    toggleWidgetVisiblity(chatWidget)
  );

  //* Get the chatbox header element using its id
  const chatbotHeaderTextContainer = chatWidget.querySelector(
    "#chat-header-text-container"
  );
  //* Take chatbot's name and tagline from chatbot config and render it in p elements, get imgUrl and add it in img src
  const chatbotName = document.createElement("p");
  chatbotName.id = "chat-header-name";
  chatbotName.innerText = chatbotConfig.name;
  const chatbotTagline = document.createElement("p");
  chatbotTagline.id = "chat-header-tagline";
  chatbotTagline.innerText = chatbotConfig.tagline;
  //* Append the chatbot name and tagline elements in the chatbox header
  chatbotHeaderTextContainer.append(chatbotName);
  chatbotHeaderTextContainer.append(chatbotTagline);

  //* Get image element and add bot's imgUrl in src
  const chatbotImg = chatWidget.querySelector(".bot-image");
  chatbotImg.src = chatbotConfig.img;

  //* 1. Get chat history container element to append messages and render them on DOM
  //* 2. Get message input element to trigger send message function on enter key press
  //* 3. Get send button component to trigger send message function on clicking the send button
  const chatHistoryContainer = chatWidget.querySelector("#chat-history");
  const messageInput = chatWidget.querySelector("#chat-input");
  const sendButton = chatWidget.querySelector("#send-button");
  messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendMessage(chatHistoryContainer, messageInput, chatbotConfig);
    }
  });
  sendButton.addEventListener("click", () =>
    sendMessage(chatHistoryContainer, messageInput, chatbotConfig)
  );

  //* Get the existing messages from local storage and render them in chat history container
  let messageStorage = localStorage.getItem("messageStorage");
  if (messageStorage) {
    messageStorage = JSON.parse(messageStorage);

    const currentThread = messageStorage.find(
      (thread) => thread.id === chatbotConfig.id
    );

    //* If current thread already exists, render existing messages
    if (currentThread && currentThread.messages.length > 0) {
      currentThread.messages.map((message) => {
        return renderMessage(chatHistoryContainer, message, chatbotConfig.img);
      });
    } else {
      //* If current thread doesnot exist, create a new thread and render new thread's messages
      const newThread = initializeThread(chatbotConfig);
      newThread.messages.map((message) => {
        return renderMessage(chatHistoryContainer, message, chatbotConfig.img);
      });
    }
  }

  //* Get the chat refresh button and add event listener to clear chat history
  const refreshChatButton = chatWidget.querySelector("#refresh-chat");
  refreshChatButton.addEventListener("click", () =>
    deleteThread(chatbotConfig.id, chatHistoryContainer)
  );

  //* If movable attribute is true then call moveWidget function to make it movable
  if (chatbotConfig.movable) {
    moveWidget(chatWidget);
  }

  //* Return the chat widget
  return chatWidget;
};

//* Function to get the desired script tag from html
const getScriptTag = () => {
  //* Get all script tags
  const scripts = document.getElementsByTagName("script");
  //* Convert to array and find the one with source of our js file
  return Array.from(scripts).find((script) => script.src.includes("main.js"));
};

//* Function to get chatbot's image url
const getChatbotData = async (chatbotConfig) => {
  const url = `https://chatbuilder-puce.vercel.app/api/chatbot/single/${chatbotConfig.id}`;

  try {
    let res = await fetch(url);
    res = await res.json();
    const { chatbot } = res;
    console.log("Chatbot data fetched successfully =>", res);
    if (chatbot) {
      chatbotConfig.img = chatbot.botPicUrl
        ? chatbot.botPicUrl
        : "https://pics.craiyon.com/2024-01-10/TvlRGJDhR9-J2TbOqngHpw.webp";
      chatbotConfig.greetingMessage = chatbot.greetingMessage
        ? chatbot.greetingMessage
        : "Hello, how may I help you?";
    } else {
      chatbotConfig.img =
        "https://pics.craiyon.com/2024-01-10/TvlRGJDhR9-J2TbOqngHpw.webp";
      chatbotConfig.greetingMessage = "Hello, how may I help you?";
    }
    return chatbotConfig;
  } catch (error) {
    console.log("Error in fetching chatbot data =>", error.message);
  }
};

//* Function to inject css styles in hmtl based on provided size
const injectStyles = (chatbotConfig) => {
  const { size, movable, preview } = chatbotConfig;
  //* Main CSS styles
  const styleSheet = document.createElement("style");
  if (size === "small") {
    styleSheet.textContent = stylesSmall;
  } else if (size === "medium") {
    styleSheet.textContent = stylesMedium;
  } else if (size === "large") {
    styleSheet.textContent = stylesLarge;
  }

  if (movable) {
    styleSheet.textContent += `
    #chat-header {
    cursor: grab;
    }
    #chat-header:active{
    cursor: grabbing;
    }
  `;
  }

  if (!preview) {
    if (size === "small") {
      styleSheet.textContent += stylesSmallOverwrite;
    } else if (size === "medium") {
      styleSheet.textContent += stylesMediumOverwrite;
    } else if (size === "large") {
      styleSheet.textContent += stylesLargeOverwrite;
    }
  }

  document.head.appendChild(styleSheet);

  //* External stylesheet for icons
  const iconStyleSheet = document.createElement("link");
  iconStyleSheet.setAttribute(
    "href",
    "https://cdn.jsdelivr.net/npm/remixicon/fonts/remixicon.css"
  );
  iconStyleSheet.setAttribute("rel", "stylesheet");
  document.head.appendChild(iconStyleSheet);
};

//* Function to interact with api, send/recieve and render messages
const sendMessage = async (container, input, chatbotConfig) => {
  //* Destructure the chatbot config
  const { id, img } = chatbotConfig;

  //* Create message objects for user's message and chatbot response to save it in local storage and render it on the screen
  const question = {
    type: "question",
    message: input.value,
    time: new Date(Date.now()).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
  };

  const answer = {
    type: "answer",
    message: "",
    time: "",
  };

  //* Proceed further if the message content is not an empty string
  if (question.message) {
    //* Immediately render the message on screen, clear input and show loader to improve UX and then save the message in local storage
    renderMessage(container, question, img);
    input.value = "";
    const botMessageElem = showLoading(container, img);
    const loader = botMessageElem.querySelector("#loader");
    saveMsgToStorage(id, question);

    //* Construct the url for API's response
    const url = `https://chatbuilder-puce.vercel.app/api/chatbot/ask?question=${encodeURIComponent(
      question.message
    )}&chatbotId=${id}`;

    //* Start interaction with the API
    try {
      //* Send the request
      const response = await fetch(url);
      // console.log(response);

      //* Throw error in case of an error
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      //* Handle the streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let botResponse = "";

      //* Start UI manipulation
      loader.style.display = "none";
      const messageBubble = botMessageElem.querySelector("#message-bubble");
      const messageContent = botMessageElem.querySelector("#message-content");
      const text = document.createElement("p");
      const time = document.createElement("p");
      time.className = "message-time";
      answer.time = new Date(Date.now()).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      time.innerText = answer.time;

      messageBubble.appendChild(text);
      messageContent.appendChild(time);

      //* Run a loop to keep adding the incpming streamed response in message content and render it on screen
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.replace("data: ", "").trim();
            if (data === "[DONE]") {
              botResponse = botResponse.trim();
              text.innerText = botResponse;
              answer.message = botResponse;
              saveMsgToStorage(id, answer);
              // console.log("Response rendered and saved in LS =>", botResponse);
            } else {
              botResponse += data + " ";
              text.innerText = botResponse;
              const messageTopPositon = botMessageElem.offsetTop;
              container.scrollTop = messageTopPositon;
              // console.log("Incoming streamed response =>", botResponse);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      loader.style.display = "none";
      const messageBubble = botMessageElem.querySelector("#message-bubble");
      const messageContent = botMessageElem.querySelector("#message-content");
      const text = document.createElement("p");
      answer.message = "Oops! something went wrong.";
      text.innerText = answer.message;
      const time = document.createElement("p");
      time.className = "message-time";
      answer.time = new Date(Date.now()).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      time.innerText = answer.time;
      messageBubble.appendChild(text);
      messageContent.appendChild(time);
      saveMsgToStorage(id, answer);
    }
  }
};

//* Function to receive a message as argumet and save it to local storage
const saveMsgToStorage = (chatbotId, message) => {
  //* Get existing messages from local storage
  let messageStorage = localStorage.getItem("messageStorage");

  //* If there are existing messages, parse, push new message and the save the updated array in storage
  if (messageStorage) {
    messageStorage = JSON.parse(messageStorage);
    const currentThread = messageStorage.find(
      (thread) => thread.id === chatbotId
    );
    if (currentThread) {
      currentThread.messages.push(message);
      messageStorage = JSON.stringify(messageStorage);
      localStorage.setItem("messageStorage", messageStorage);
    } else {
      let newThread = {
        id: chatbotId,
        messages: [],
      };
      newThread.messages.push(message);
      messageStorage.push(newThread);
      messageStorage = JSON.stringify(messageStorage);
      localStorage.setItem("messageStorage", messageStorage);
    }
  } else {
    //* If there are no existing messages, create an array, push new message and the save the array in storage
    let messageStorage = [];
    let newThread = {
      id: chatbotId,
      messages: [],
    };
    newThread.messages.push(message);
    messageStorage.push(newThread);
    messageStorage = JSON.stringify(messageStorage);
    localStorage.setItem("messageStorage", messageStorage);
  }
};

//* Function to create a new thread with greeting message and save it to local storage
const initializeThread = (chatbotConfig) => {
  //* Create a new message object for greeting message
  const greetingMessage = {
    type: "answer",
    message: chatbotConfig.greetingMessage,
    time: new Date(Date.now()).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
  };

  //* Create an object for new thread
  let newThread = {
    id: chatbotConfig.id,
    messages: [greetingMessage],
  };
  console.log("New thread created", newThread);

  //* Get message storage from db
  let messageStorage = localStorage.getItem("messageStorage");

  //* If there are existing messages, parse, push new message and the save the updated array in storage
  if (messageStorage) {
    messageStorage = JSON.parse(messageStorage);
  } else {
    messageStorage = [];
  }

  messageStorage.push(newThread);
  console.log("New thread pushed", messageStorage);
  messageStorage = JSON.stringify(messageStorage);
  localStorage.setItem("messageStorage", messageStorage);
  return newThread;
};

//* Function to receive a message as argumet and save it to local storage
const deleteThread = (chatbotId, chatHistoryContainer) => {
  let messageStorage = localStorage.getItem("messageStorage");
  if (messageStorage) {
    messageStorage = JSON.parse(messageStorage);
    const threadIndex = messageStorage.findIndex(
      (thread) => thread.id === chatbotId
    );
    if (threadIndex !== -1) {
      messageStorage.splice(threadIndex, 1);
      messageStorage = JSON.stringify(messageStorage);
      localStorage.setItem("messageStorage", messageStorage);
      chatHistoryContainer.innerText = "";
    }
  }
};

//* Function to render a message in the chat container
const renderMessage = (container, message, img) => {
  //* Create a wrapper for the message content
  const messageWrapper = document.createElement("div");
  messageWrapper.className = "message-container";

  //* Add HTML in the container based on message type
  if (message.type === "question") {
    messageWrapper.classList.add("message-container-question");
    messageWrapper.innerHTML = `
  <div class="message-icon-wrapper">
    <i class="ri-chat-ai-fill message-icon"></i>
  </div>
  <div id="message-content">
  <div class="question-bubble" id="message-bubble">
  </div>
  </div>
  `;
  } else {
    messageWrapper.innerHTML = `
  <div class="bot-img-wrapper">
    <img src=${img} class="bot-message-image"></img>
  </div>
  <div id="message-content">
  <div class="answer-bubble" id="message-bubble">
  </div>
  </div>
  `;
  }

  //* Container which contains messsage text
  const messageBubble = messageWrapper.querySelector("#message-bubble");
  //* Container which contains messsage bubble and time
  const messageContent = messageWrapper.querySelector("#message-content");
  //* Create <p> element and add message text in it
  const text = document.createElement("p");
  text.innerText = message.message;

  //* Create <p> element and add message time in it
  const time = document.createElement("p");
  time.className = "message-time";
  time.innerText = message.time;

  //* Append the message text in message bubble
  messageBubble.appendChild(text);
  //* Append the message time in message content
  messageContent.appendChild(time);
  //* Append the complete message wrapper in chat container
  container.append(messageWrapper);

  //* Get the messages position and scroll the container to the current message
  const messageTopPositon = messageWrapper.offsetTop;
  container.scrollTop = messageTopPositon;

  //* Return the container with the message appended
  return container;
};

//* Fucntion to open/close the chatbox
const toggleWidgetVisiblity = (chatWidget) => {
  //* Get the sound effect mp3 file source
  const sound = new Audio("http://localhost:3000/chat.mp3");
  sound.play();

  const chatbox = chatWidget.querySelector("#chat-box-container");
  const toggleWidgetButtonIcon = chatWidget.querySelector(
    "#widget-button-icon"
  );

  if (chatbox.classList.contains("hidden")) {
    chatbox.classList.remove("hidden");
    toggleWidgetButtonIcon.classList.remove("ri-chat-ai-fill");
    toggleWidgetButtonIcon.classList.add("ri-close-fill");
  } else {
    chatbox.classList.add("hidden");
    toggleWidgetButtonIcon.classList.remove("ri-close-fill");
    toggleWidgetButtonIcon.classList.add("ri-chat-ai-fill");
  }
};

//* Function to make the widget moveable
const moveWidget = (widget) => {
  if (widget.getAttribute("data-draggable") === "true") return;
  widget.setAttribute("data-draggable", "true");
  const header = widget.querySelector("#chat-header");

  if (!widget.style.top) widget.style.top = "0px";
  if (!widget.style.left) widget.style.left = "0px";

  header.addEventListener("mousedown", dragMouseDown);
  let pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;

  header.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    //* Get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    //* Call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    //* Calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    //* Set the element's new position using the widget element:
    widget.style.top = widget.offsetTop - pos2 + "px";
    widget.style.left = widget.offsetLeft - pos1 + "px";
  }

  function closeDragElement() {
    //* Stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
};

//* Function to show loader untill the fetch promise resolves
const showLoading = (container, img) => {
  const messageWrapper = document.createElement("div");
  messageWrapper.className = "message-container";
  messageWrapper.innerHTML = `
   <div class="bot-img-wrapper">
    <img src=${img} class="bot-message-image"></img>
  </div>
  <div id="message-content">
  <div class="answer-bubble" id="message-bubble">
  </div>
  </div>
  `;
  const messageBubble = messageWrapper.querySelector("#message-bubble");
  const loader = document.createElement("div");
  loader.id = "loader";

  messageBubble.appendChild(loader);
  container.append(messageWrapper);

  const messageTopPositon = messageWrapper.offsetTop;
  container.scrollTop = messageTopPositon;
  return messageWrapper;
};

//* StylesSheet for small widget size
const stylesSmall = `
  ::-webkit-scrollbar {
  width: 4px; 
  }
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: Arial, sans-serif;
  scrollbar-width: thin;
}
#widget-container {
  position: absolute;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-end;
  gap: 1rem;
  padding: 2rem;
}

/* Button that opens the chatbox */
#widget-button {
  background-color: #007bff;
  border: none;
  border-radius: 9999px;
  padding: 4px 9px;
  cursor: pointer;
}
#widget-button-icon {
  color: white;
  font-size: 24px;
}

/* Chat Box Container */
#chat-box-container {
  border: 1px solid #ccc;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 25%;
  height: 90%;
  border-radius: 1.5rem;
  overflow: hidden;
  background: white;
  position: relative;
}

/* Utility to hide element */
.hidden {
  display: none;
}

/* Chat Header */
#chat-header {
  width: 100%;
  height: 15%;
  display: flex;
  background: linear-gradient(to bottom, #007bff, #3881ce);
}

/* Header Icon */
.chat-header-icon {
  width: 20%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  overflow: hidden
}

.bot-image {
width: 70%;
height: 60%;
border-radius: 9999px;
}

/* Header Title */
#chat-header-text-container {
  width: 40%;
  color: white;
  padding: 0.5rem 0;
  margin: auto 0px;
}

#chat-header-name {
  font-size: 12px;
  margin-bottom: 0px;
  text-transform: capitalize;
  font-weight: 600;
  font-family: "Lucida Sans", "Lucida Sans Regular", "Lucida Grande",
    "Lucida Sans Unicode", Geneva, Verdana, sans-serif;
}

#chat-header-tagline {
  font-size: 10px;
  font-family: Arial, Helvetica, sans-serif;
}

/* Header Controls */
.chat-header-controls {
  width: 40%;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding-right: 1rem;
}

/* Chat History */
#chat-history {
  width: 100%;
  height: 70%;
  padding: 0px 0px 8px 0px;
  overflow-y: auto;
}

/* Send Message Container */
.chat-send-container {
  border-top: 1px solid #ccc;
  width: 100%;
  height: 15%;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0px 0.5rem;
}

/* Chat Input */
#chat-input {
  border: 2px solid #ccc;
  border-radius: 0.5rem;
  width: 85%;
  padding: 1rem 0.5rem;
  outline: none;
  resize: none;
  overflow: hidden;
  height: 40%;
  font-size: 12px;
  }

/* Send Button */
#send-button {
  cursor: pointer;
  background: none;
  border: none;
}

/* Icon styling */
.icon {
  font-size: 20px;
}

/* Smaller icons for controls */
.control-icon {
  font-size: 14px;
  color: #fff;
  cursor: pointer;
}

/* Send icon styling */
.send-icon {
  color: #007bff;
  font-size: 20px;
}

/* Message component styling */
.message-container {
  display: flex;
  align-items: center;
  gap:4px;
  padding: 0 8px;
  margin-top:8px;
  }
  
  .message-container-question {
  flex-direction: row-reverse;
  justify-content: flex-start;
}

.message-icon-wrapper {
  background: linear-gradient(to bottom, #007bff, #3881ce);
  border-radius: 50%;
  padding: 2px 5px;
  font-size: 14px;
  width:24px;
  height:24px;
  margin-bottom:16px
}

.message-icon {
  color: white;
}


#message-bubble {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 8px;
}

.answer-bubble {
  background-color: #e0e0e0;
  color: black;
  border-top-left-radius: 0;
}

.question-bubble {
  background-color: #007bff;
  color: white;
  border-top-right-radius: 0;
}

.message-time {
  color: #555;
  font-size: 8px;
  margin-top: 4px;
  margin-left: 4px;
}

.bot-img-wrapper {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  margin-bottom: 16px;
  align-self: flex-end;
}

.bot-message-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  display: block;
}

/* Loader */
#loader {
  width: 12px; 
  color: "#007bff";
  aspect-ratio: 2;
  --_g: no-repeat radial-gradient(circle closest-side, #000 90%, #0000);
  background: 
    var(--_g) 0%   50%,
    var(--_g) 50%  50%,
    var(--_g) 100% 50%;
  background-size: calc(100%/3) 50%;
  animation: l3 1s infinite linear;
}

@keyframes l3 {
  20% { background-position: 0% 0%, 50% 50%, 100% 50%; }
  40% { background-position: 0% 100%, 50% 0%, 100% 50%; }
  60% { background-position: 0% 50%, 50% 100%, 100% 0%; }
  80% { background-position: 0% 50%, 50% 50%, 100% 100%; }
}

/* Responsive media queries */
/* Extra small devices */
@media (max-width: 576px) {
#chat-box-container {
  width: 80%;
  height: 70%;
  }
}  
@media (min-width: 576px) and (max-width: 768px) {
    #chat-box-container {
      width: 80%;
      height: 70%;
      }
}
  
/* Tablets */      
@media (min-width: 768px) and (max-width: 991.98px) {
    #chat-box-container {
        width: 50%;
        height: 80%;
        }
    .bot-img-wrapper {
    width: 35px;
    height: 35px;
  }
}
@media (min-width: 992px) {
    #chat-box-container {
      width: 30%;
      height: 80%;
    }
  .bot-image {
width: 50%;
height: 60%;
border-radius: 9999px;
}
}
`;

const stylesSmallOverwrite = `  
    #widget-button {
    padding: 9px;
  }   
  .message-icon-wrapper {
  padding: 4px 5px;
  }
    `;

//* StylesSheet for medium widget size
const stylesMedium = `
  ::-webkit-scrollbar {
    width: 4px;
  }
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: Arial, sans-serif;
    scrollbar-width: thin;
  }
  #widget-container {
    position: absolute;
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: flex-end;
    gap: 1rem;
    padding: 2rem;
  }

  /* Button that opens the chatbox */
  #widget-button {
    background-color: #007bff;
    border: none;
    border-radius: 9999px;
    padding: 6px 12px;
    cursor: pointer;
  }
  #widget-button-icon {
    color: white;
    font-size: 26px;
  }

  /* Chat Box Container */
  #chat-box-container {
    border: 1px solid #ccc;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    width: 30%;
    height: 90%;
    border-radius: 1.5rem;
    overflow: hidden;
    background: white;
    position: relative;
  }

  /* Utility to hide element */
  .hidden {
    display: none;
  }

  /* Chat Header */
  #chat-header {
    width: 100%;
    height: 15%;
    display: flex;
    background: linear-gradient(to bottom, #007bff, #3881ce);
  }

  /* Header Icon */
  .chat-header-icon {
    width: 20%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
  }

  .bot-image {
    width: 75%;
    height: 75%;
    border-radius: 9999px;
  }

  /* Header Title */
  #chat-header-text-container {
    width: 40%;
    color: white;
    padding: 0.5rem 0;
    margin: auto 0;
  }

  #chat-header-name {
    font-size: 14px;
    margin-bottom: 2px;
    text-transform: capitalize;
    font-weight: 600;
    font-family: "Lucida Sans", "Lucida Sans Regular", "Lucida Grande",
      "Lucida Sans Unicode", Geneva, Verdana, sans-serif;
  }

  #chat-header-tagline {
    font-size: 12px;
    font-family: Arial, Helvetica, sans-serif;
  }

  /* Header Controls */
  .chat-header-controls {
    width: 40%;
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding-right: 1rem;
  }

  /* Chat History */
  #chat-history {
    width: 100%;
    height: 65%;
    padding: 2px 0 10px 0;
    overflow-y: auto;
  }

  /* Send Message Container */
  .chat-send-container {
    border-top: 1px solid #ccc;
    width: 100%;
    height: 15%;
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 0 0.5rem;
  }

  /* Chat Input */
  #chat-input {
    border: 2px solid #ccc;
    border-radius: 0.5rem;
    width: 85%;
    padding: 1.2rem 0.6rem;
    outline: none;
    resize: none;
    overflow: hidden;
    height: 40%;
    font-size: 14px;
  }

  /* Send Button */
  #send-button {
    cursor: pointer;
    background: none;
    border: none;
  }

  /* Icon styling */
  .icon {
    font-size: 22px;
  }

  /* Smaller icons for controls */
  .control-icon {
    font-size: 14px;
    color: #fff;
    cursor: pointer;
  }

  /* Send icon styling */
  .send-icon {
    color: #007bff;
    font-size: 22px;
  }

  /* Message component styling */
  .message-container {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 8px;
    margin-top: 8px;
  }
  
  .message-container-question {
    flex-direction: row-reverse;
    justify-content: flex-start;
  }

  .message-icon-wrapper {
    background: linear-gradient(to bottom, #007bff, #3881ce);
    border-radius: 50%;
    padding: 2px 6px;
    font-size: 16px;
    width: 28px;
    height: 28px;
    margin-bottom: 16px;
  }

  .message-icon {
    color: white;
  }

  #message-bubble {
    font-size: 12px;
    padding: 8px 12px;
    border-radius: 8px;
  }

  .answer-bubble {
    background-color: #e0e0e0;
    color: black;
    border-top-left-radius: 0;
  }

  .question-bubble {
    background-color: #007bff;
    color: white;
    border-top-right-radius: 0;
  }

  .message-time {
    color: #555;
    font-size: 10px;
    margin-top: 4px;
    margin-left: 4px;
  }

  .bot-img-wrapper {
    width: 28px;
    height: 28px;
    flex-shrink: 0;
    margin-bottom: 16px;
    align-self: flex-end;
  }

  .bot-message-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
    display: block;
  }

  /* Loader */
  #loader {
    width: 14px;
    color: "#007bff";
    aspect-ratio: 2;
    --_g: no-repeat radial-gradient(circle closest-side, #000 90%, #0000);
    background: 
      var(--_g) 0% 50%,
      var(--_g) 50% 50%,
      var(--_g) 100% 50%;
    background-size: calc(100%/3) 50%;
    animation: l3 1s infinite linear;
  }

  @keyframes l3 {
    20% { background-position: 0% 0%, 50% 50%, 100% 50%; }
    40% { background-position: 0% 100%, 50% 0%, 100% 50%; }
    60% { background-position: 0% 50%, 50% 100%, 100% 0%; }
    80% { background-position: 0% 50%, 50% 50%, 100% 100%; }
  }

  /* Responsive media queries */
  /* Extra small devices */
  @media (max-width: 576px) {
    #chat-box-container {
      width: 90%;
      height: 80%;
    }
  }

  /* Small devices (576px to 768px) */
  @media (min-width: 576px) and (max-width: 768px) {
    #chat-box-container {
      width: 80%;
      height: 70%;
    }
  }

  /* Tablets (768px to 991.98px) */
  @media (min-width: 768px) and (max-width: 991.98px) {
    #chat-box-container {
      width: 60%;
      height: 80%;
    }
    .bot-img-wrapper {
      width: 35px;
      height: 35px;
    }
    .bot-image {
    width: 60%;
    height: 50%;
    border-radius: 9999px;
  }
}
  
    /* Desktop screens */
  @media (min-width: 992px) {
     .bot-image {
    width: 50%;
    height: 55%;
    border-radius: 9999px;
  }

  }
`;

const stylesMediumOverwrite = `  
    #widget-button {
    padding: 11px 12px;
  }   
  .message-icon-wrapper {
    padding: 6px;
  }
    `;

//* StylesSheet for large widget size
const stylesLarge = `
  ::-webkit-scrollbar {
    width: 4px; 
  }
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: Arial, sans-serif;
    scrollbar-width: thin;
  }
  #widget-container {
    position: absolute;
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: flex-end;
    gap: 1rem;
    padding: 2rem;
  }
  
  /* Button that opens the chatbox */
  #widget-button {
    background-color: #007bff;
    border: none;
    border-radius: 9999px;
    padding: 5px 12px;
    cursor: pointer;
  }
  #widget-button-icon {
    color: white;
    font-size: 30px;
  }
  
  /* Chat Box Container */
  #chat-box-container {
    border: 1px solid #ccc;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    width: 40%;
    height: 90%;
    border-radius: 1.5rem;
    overflow: hidden;
    background: white;
    position: relative;
  }
  
  /* Utility to hide element */
  .hidden {
    display: none;
  }
  
  /* Chat Header */
  #chat-header {
    width: 100%;
    height: 20%;
    display: flex;
    background: linear-gradient(to bottom, #007bff, #3881ce);
  }
  /* Header Icon */
  .chat-header-icon {
    width: 20%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    overflow: hidden;
  }
  
  .bot-image {
    width: 70%;
    height: 60%;
    border-radius: 9999px;
  }
  
  /* Header Title */
  #chat-header-text-container {
    width: 40%;
    color: white;
    padding: 0.6rem 0;
    margin: auto 0;
  }
  
  #chat-header-name {
    font-size: 18px;
    margin-bottom: 0px;
    text-transform: capitalize;
    font-weight: 600;
    font-family: "Lucida Sans", "Lucida Sans Regular", "Lucida Grande", "Lucida Sans Unicode", Geneva, Verdana, sans-serif;
  }
  
  #chat-header-tagline {
    font-size: 16px;
    font-family: Arial, Helvetica, sans-serif;
  }
  
  /* Header Controls */
  .chat-header-controls {
    width: 40%;
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding-right: 1rem;
  }
  
  /* Chat History */
  #chat-history {
    width: 100%;
    height: 65%;
    padding: 2px 0 10px 0;
    overflow-y: auto;
  }
  
  /* Send Message Container */
  .chat-send-container {
    border-top: 1px solid #ccc;
    width: 100%;
    height: 15%;
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 0 0.5rem;
  }
  
  /* Chat Input */
  #chat-input {
    border: 2px solid #ccc;
    border-radius: 0.5rem;
    width: 85%;
    padding: 1.2rem 0.8rem;
    outline: none;
    resize: none;
    overflow: hidden;
    height: 40%;
    font-size: 18px;
  }
  
  /* Send Button */
  #send-button {
    cursor: pointer;
    background: none;
    border: none;
  }
  
  /* Icon styling */
  .icon {
    font-size: 24px;
  }
  
  /* Smaller icons for controls */
  .control-icon {
    font-size: 16px;
    color: #fff;
    cursor: pointer;
  }
  
  /* Send icon styling */
  .send-icon {
    color: #007bff;
    font-size: 24px;
  }
  
  /* Message component styling */
  .message-container {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 8px;
    margin-top: 8px;
  }
  
  .message-container-question {
    flex-direction: row-reverse;
    justify-content: flex-start;
  }
  
  .message-icon-wrapper {
    background: linear-gradient(to bottom, #007bff, #3881ce);
    border-radius: 50%;
    padding: 0px 6px;
    font-size: 28px;
    width: 40px;
    height: 40px;
    margin-bottom: 22px;
  }
  
  .message-icon {
    color: white;
  }
  
  #message-bubble {
    font-size: 16px;
    padding: 10px 14px;
    border-radius: 8px;
  }
  
  .answer-bubble {
    background-color: #e0e0e0;
    color: black;
    border-top-left-radius: 0;
  }
  
  .question-bubble {
    background-color: #007bff;
    color: white;
    border-top-right-radius: 0;
  }
  
  .message-time {
    color: #555;
    font-size: 14px;
    margin-top: 4px;
    margin-left: 4px;
  }
  
  .bot-img-wrapper {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    align-self: flex-end;
    margin-bottom: 26px;
  }
  
  .bot-message-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
    display: block;
  }
  
  /* Loader */
  #loader {
    width: 16px;
    color: "#007bff";
    aspect-ratio: 2;
    --_g: no-repeat radial-gradient(circle closest-side, #000 90%, #0000);
    background: 
      var(--_g) 0% 50%,
      var(--_g) 50% 50%,
      var(--_g) 100% 50%;
    background-size: calc(100%/3) 50%;
    animation: l3 1s infinite linear;
  }
  
  @keyframes l3 {
    20% { background-position: 0% 0%, 50% 50%, 100% 50%; }
    40% { background-position: 0% 100%, 50% 0%, 100% 50%; }
    60% { background-position: 0% 50%, 50% 100%, 100% 0%; }
    80% { background-position: 0% 50%, 50% 50%, 100% 100%; }
  }
  
  /* Responsive media queries */
  /* Extra small devices */
  @media (max-width: 576px) {
    #chat-box-container {
      width: 90%;
      height: 90%;
    }
   .bot-image {
    width: 70%;
    height: 40%;
    border-radius: 9999px;
  }
  
  }
  
  /* Small devices (576px to 768px) */
  @media (min-width: 576px) and (max-width: 768px) {
    #chat-box-container {
      width: 80%;
      height: 70%;
    }
  }
  
  /* Tablets (768px to 991.98px) */
  @media (min-width: 768px) and (max-width: 991.98px) {
  #chat-box-container {
      width: 70%;
      height: 80%;
    }
  .bot-image {
    width: 60%;
    height: 50%;
    border-radius: 9999px;
  }
  #chat-header {
    height: 10%;
  }
  }
  
  /* Desktop screens */
  @media (min-width: 992px) {
    #chat-box-container {
      width: 40%;
      height: 90%;
    }
       .bot-image {
    width: 45%;
    height: 50%;
    border-radius: 9999px;
  }
  }
`;

const stylesLargeOverwrite = `  
    #widget-button {
    padding: 11px 12px;
  }   
  .message-icon-wrapper {
    padding: 4px 6px;
  }
    `;

export { getScriptTag, createChatWidget, injectStyles, getChatbotData };
