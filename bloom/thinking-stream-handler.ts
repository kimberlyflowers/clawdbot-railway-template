import * as fs from "fs";
import * as path from "path";

const UNCERTAINTY_PATTERNS = [
  { pattern: /not sure (which|what|who)/i, reason: "Jaden is uncertain — may need your input" },
  { pattern: /\bassume|assuming\b/i, reason: "Jaden is making an assumption" },
  { pattern: /skip.{0,30}verif/i, reason: "Jaden considered skipping verification" },
  { pattern: /can'?t find|cannot find|no results/i, reason: "Jaden couldn't find something" },
  { pattern: /wrong\s+(repo|contact|person|email|number)/i, reason: "Jaden may have the wrong target" },
];

export class ThinkingStreamHandler {
  private step = 0;

  constructor(private sessionId: string, private workspaceRoot: string) {
    fs.mkdirSync(path.join(workspaceRoot, "bloom"), { recursive: true });
  }

  handleStreamEvent(event: any) {
    if (event.type === "content_block_start" && event.content_block.type === "thinking") {
      this.step++;
    }

    if (event.type === "content_block_delta" && event.delta.type === "thinking_delta") {
      this.emit("thinking", event.delta.thinking);
    }
  }

  private emit(type: string, text: string) {
    const thought = {
      timestamp: new Date().toISOString(),
      session_id: this.sessionId,
      step: this.step,
      type,
      text
    };

    let flagged = false, reason = "";

    // Check for uncertainty patterns (Phase 1)
    for (const { pattern, reason: r } of UNCERTAINTY_PATTERNS) {
      if (pattern.test(text)) {
        flagged = true;
        reason = r;
        break;
      }
    }

    // Log all reasoning
    fs.appendFileSync(
      path.join(this.workspaceRoot, "bloom/vera-reasoning.jsonl"),
      JSON.stringify(thought) + "\n"
    );

    // Log alerts for operator dashboard (never client webchat)
    if (flagged) {
      const alert = {
        timestamp: thought.timestamp,
        session_id: this.sessionId,
        type: "VERA_INTERCEPT",
        phase: 1,
        reason,
        text_snippet: text.substring(0, 100)
      };

      fs.appendFileSync(
        path.join(this.workspaceRoot, "bloom/vera-alerts.jsonl"),
        JSON.stringify(alert) + "\n"
      );

      // Operator dashboard only — never client webchat
      console.error(`⚠️ VERA [Phase 1]: ${reason}`);
    }
  }
}