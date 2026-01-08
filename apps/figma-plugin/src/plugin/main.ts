// Plugin main entry point
import { routeMessage } from "./handlers";
import { startVariableSync } from "./sync/variable-sync";

console.log("Plugin starting...");

// Show UI
figma.showUI(__html__, {
  width: 400,
  height: 600,
  title: "Token Bridge",
});

// Route all messages through handler registry
figma.ui.onmessage = async (msg) => {
  console.log("Plugin received message:", msg.type);
  await routeMessage(msg);
};

// Register menu command
figma.on("run", ({ command }) => {
  console.log("Plugin run command:", command);
  if (command === "open-plugin") {
    figma.showUI(__html__, {
      width: 400,
      height: 600,
      title: "Token Bridge",
    });
  }
});

// Start variable sync
const cleanupSync = startVariableSync();

// Stop sync when plugin closes
figma.on("close", () => {
  // Call the cleanup function returned by startVariableSync
  if (typeof cleanupSync === "function") {
    cleanupSync();
  }
});

console.log("Plugin initialized");
