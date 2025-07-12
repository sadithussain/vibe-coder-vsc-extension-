// media/main.js

// This special object is provided by VS Code in the webview environment
// to allow for communication with the extension.
const vscode = acquireVsCodeApi();

document.getElementById("send-button").addEventListener("click", () => {
  const promptInput = document.getElementById("prompt-input");
  const promptText = promptInput.value;

  // Send a message to the extension
  vscode.postMessage({
    command: "prompt",
    text: promptText,
  });
});
