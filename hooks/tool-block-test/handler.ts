const handler = async (event) => {
  // Test if any hook system is working at all
  console.log("[tool-block-test] Hook triggered with event:", event?.type);

  if (event?.type === "message:received") {
    console.log("[tool-block-test] 🟢 MESSAGE HOOK WORKING - got message:", event.content?.substring(0, 50));

    // Add a visible response to confirm hook is working
    if (event.messages && Array.isArray(event.messages)) {
      event.messages.push("🟢 TEST HOOK CONFIRMED WORKING: message:received event detected");
    }
  }

  if (event?.type === "before_tool_call") {
    console.log("[tool-block-test] 🔥 before_tool_call triggered for tool:", event.toolName || event.tool);

    // Block Read tool if this event type exists
    if ((event.toolName === "Read" || event.tool === "Read")) {
      return {
        block: true,
        blockReason: "🚫 STRUCTURAL ENFORCEMENT CONFIRMED: before_tool_call hook successfully blocked Read tool"
      };
    }
  }

  return {};
};

export default handler;