// This MUST be the first line in your script
const vscode = acquireVsCodeApi();

// Get references to the DOM elements we will need to interact with.
const chatMessages = document.getElementById("chat-messages");
const chatInput = document.getElementById("chat-input");
const sendButton = document.getElementById("send-button");

/**
 * Creates a new message bubble and adds it to the chat window.
 * @param {string} sender - Who is sending the message ('bot' or 'user').
 * @param {string} text - The content of the message.
 */
function appendMessage(sender, text) {
  const messageBubble = document.createElement("div");

  if (sender === "user") {
    // For user messages, ALWAYS use textContent to prevent security risks (XSS).
    messageBubble.classList.add("user-bubble");
    messageBubble.textContent = text;
  } else {
    // For bot messages, convert basic Markdown to HTML to show formatting.
    messageBubble.classList.add("bot-bubble");

    // Convert **bold** text to <strong> HTML tags.
    let html = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Convert * list items to bullet points.
    // The 'gm' flags are for global (all instances) and multiline.
    html = html.replace(/^\* (.*$)/gm, "&bull; $1");

    // Convert newline characters to <br> tags so they are rendered.
    html = html.replace(/\n/g, "<br>");

    // Set the bubble's content to the formatted HTML.
    messageBubble.innerHTML = html;
  }

  chatMessages.appendChild(messageBubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Handles the logic for sending a user's message.
 */
function handleUserMessage() {
  const inputText = chatInput.value.trim();

  if (inputText) {
    // Add the user's message to the chat
    appendMessage("user", inputText);

    // Send the message to the extension
    vscode.postMessage({
      command: "prompt", // Changed from 'userMessage' to match your extension
      text: inputText,
    });

    // Clear the input field
    chatInput.value = "";
  }
}

// --- Event Listeners for User Input ---
sendButton.addEventListener("click", handleUserMessage);
chatInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    handleUserMessage();
  }
});

// --- NEW: Event Listener for Messages FROM the Extension ---
window.addEventListener("message", (event) => {
  // The message from the extension is in event.data
  const message = event.data;

  // Use a switch statement to handle different commands from the extension
  switch (message.command) {
    case "response":
      // We received a response from the bot (Gemini)
      // Use our existing function to display it!
      appendMessage("bot", message.text);
      break;
    // You could add other cases here, like 'error' or 'clear'
  }
});
