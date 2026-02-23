---
name: tool-block-test
description: "Test if before_tool_call can synchronously block tool execution"
metadata:
  openclaw:
    emoji: "🚫"
    events: ["before_tool_call"]
    requires:
      bins: ["node"]
---

# Tool Block Test Hook

Simple test to determine if `before_tool_call` hook can synchronously prevent tool execution in this Railway OpenClaw deployment.

Blocks the `Read` tool with a clear test message.