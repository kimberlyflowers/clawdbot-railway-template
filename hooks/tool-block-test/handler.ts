const handler = async (event, api) => {
  console.log("[tool-block-test] Handler loaded, registering before_tool_call");

  // Register for before_tool_call events using API method (like ClawBands)
  if (api && api.on) {
    api.on('before_tool_call', async (toolEvent) => {
      console.log("[tool-block-test] before_tool_call triggered:", toolEvent.toolName);

      // Block the Read tool specifically for clear testing
      if (toolEvent.toolName === "Read") {
        console.log("[tool-block-test] BLOCKING Read tool execution - TEST HOOK ACTIVE");

        return {
          block: true,
          blockReason: "🚫 TEST HOOK: Read tool blocked to test if before_tool_call enforcement works in Railway OpenClaw deployment. If you see this message, structural enforcement is POSSIBLE."
        };
      }

      // Allow all other tools
      return {};
    });
  }

  // Also handle regular message events for fallback
  if (event?.type === "message:received") {
    console.log("[tool-block-test] Message received, hook is active");
  }

  return {};
};

export default handler;