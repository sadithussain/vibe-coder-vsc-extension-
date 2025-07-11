// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "vibe-coder" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand(
    "vibe-coder.helloWorld",
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      vscode.window.showInformationMessage("Hello World from Vibe Coder!");
    }
  );

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

  context.subscriptions.push(disposable);
  context.subscriptions.push(getSelectedTextDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
