// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "vibe-coder" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json

  let getSelectedTextDisposable = vscode.commands.registerCommand(
    "vibe-coder.getSelectedText",
    () => {
      // Get the active text editor
      const editor = vscode.window.activeTextEditor;

      if (editor) {
        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);

        // Display the selected text in an information message
        if (selectedText) {
          vscode.window.showInformationMessage(`You selected: ${selectedText}`);
        } else {
          vscode.window.showInformationMessage("No text selected.");
        }
      } else {
        vscode.window.showWarningMessage("No active editor found.");
      }
    }
  );

  let openChatDisposable = vscode.commands.registerCommand(
    "vibe-coder.openChat",
    () => {
      const panel = vscode.window.createWebviewPanel(
        "vibeCoderChat",
        "Vibe Coder Chat",
        vscode.ViewColumn.Two,
        {
          enableScripts: true, // Keep scripts enabled
        }
      );

      // --- UPDATE THIS SECTION ---

      // Get the special URIs for our local files
      const scriptUri = panel.webview.asWebviewUri(
        vscode.Uri.joinPath(context.extensionUri, "media", "main.js")
      );
      const cssUri = panel.webview.asWebviewUri(
        vscode.Uri.joinPath(context.extensionUri, "media", "chat.css")
      );

      // Read the HTML file and replace placeholders
      const htmlPath = path.join(context.extensionPath, "media", "chat.html");
      let htmlContent = fs.readFileSync(htmlPath, "utf8");
      htmlContent = htmlContent.replace('href="chat.css"', `href="${cssUri}"`);
      htmlContent = htmlContent.replace('src="main.js"', `src="${scriptUri}"`);

      panel.webview.html = htmlContent;

      // Handle messages from the webview
      panel.webview.onDidReceiveMessage(
        (message) => {
          switch (message.command) {
            case "prompt":
              // Display the received text in a VS Code info message
              vscode.window.showInformationMessage(
                `Received prompt: ${message.text}`
              );
              return;
          }
        },
        undefined,
        context.subscriptions
      );
    }
  );

  context.subscriptions.push(getSelectedTextDisposable);
  context.subscriptions.push(openChatDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
