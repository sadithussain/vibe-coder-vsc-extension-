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

  const openChatDisposable = vscode.commands.registerCommand(
    "vibe-coder.openChat",
    () => {
      let chatPanel = vscode.window.createWebviewPanel(
        "vibe-coder",
        "Vibe Coder",
        vscode.ViewColumn.Two,
        {
          // Enable scripts in the webview
          enableScripts: true,

          // Keep the webview's content and state even when it's not visible
          retainContextWhenHidden: true, // <-- THIS IS THE LINE YOU NEED TO ADD

          // Restrict the webview to only loading content from your extension's `media` directory.
          localResourceRoots: [
            vscode.Uri.joinPath(context.extensionUri, "media"),
          ],
        }
      );

      const htmlFilePath = path.join(
        context.extensionPath,
        "media",
        "chat.html"
      );
      let htmlContent = fs.readFileSync(htmlFilePath, "utf8");

      const stylesDiskPath = vscode.Uri.joinPath(
        context.extensionUri,
        "media",
        "style.css"
      );
      const stylesWebviewUri = chatPanel.webview.asWebviewUri(stylesDiskPath);

      htmlContent = htmlContent.replace(
        'href="style.css"',
        `href=${stylesWebviewUri}`
      );

      const scriptsDiskPath = vscode.Uri.joinPath(
        context.extensionUri,
        "media",
        "main.js"
      );
      const scriptsWebviewuri = chatPanel.webview.asWebviewUri(scriptsDiskPath);

      htmlContent = htmlContent.replace(
        'src="main.js"',
        `src=${scriptsWebviewuri}`
      );

      chatPanel.webview.html = htmlContent;

      chatPanel.webview.onDidReceiveMessage(async (message) => {
        switch (message.command) {
          case "prompt":
            const config = vscode.workspace.getConfiguration("vibe-coder");
            const apiKey = config.get("geminiApiKey");

            if (!apiKey || typeof apiKey !== "string") {
              vscode.window.showErrorMessage(
                "Gemini API Key not found. Please set it in the settings."
              );
              return;
            }

            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

            const requestBody = {
              contents: [
                {
                  parts: [
                    {
                      text: message.text, // The user's prompt from the webview
                    },
                  ],
                },
              ],
            };

            try {
              const apiResponse = await fetch(apiUrl, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
              });

              if (!apiResponse.ok) {
                const errorData: any = await apiResponse.json();
                console.error("Gemini API Error:", errorData);
                vscode.window.showErrorMessage(
                  `API Error: ${errorData.error.message}`
                );
                return;
              }

              const responseData: any = await apiResponse.json();

              const responseText =
                responseData?.candidates?.[0]?.content?.parts?.[0]?.text ||
                "Sorry, I couldn't get a response.";

              chatPanel.webview.postMessage({
                command: "response",
                text: responseText,
              });
            } catch (error) {
              console.error("Failed to call Gemini API:", error);
              vscode.window.showErrorMessage(
                "An error occurred while contacting the Gemini API. Check the developer console for details."
              );
            }
        }
      });
    }
  );

  context.subscriptions.push(openChatDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
