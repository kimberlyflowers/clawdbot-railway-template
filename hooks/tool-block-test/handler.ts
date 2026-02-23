const handler = async (event) => {
  // Only intercept before_tool_call events
  if (event.type !== "before_tool_call") {
    return;
  }

  // Block the Read tool specifically for clear testing
  if (event.tool === "Read") {
    console.log("[tool-block-test] BLOCKING Read tool execution - TEST HOOK ACTIVE");

    return {
      block: true,
      blockReason: "🚫 TEST HOOK: Read tool blocked to test if before_tool_call enforcement works in Railway OpenClaw deployment. If you see this message, structural enforcement is POSSIBLE."
    };
  }

  // Allow all other tools
  return {};
};

export default handler;