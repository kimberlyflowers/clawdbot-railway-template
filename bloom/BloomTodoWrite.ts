/**
 * BloomTodoWrite — Do It Right.
 *
 * BLOOM Ecosystem's structural task enforcement tool.
 * Bloomies cannot proceed from directive to execution without calling this first.
 * Vera watches every state transition against this plan.
 * The client is never notified until Vera approves the final step.
 *
 * Modeled after Claude Code's TodoWrite but built for business tasks,
 * not coding tasks — with verification signatures Vera can match against.
 */

import type { Plugin, ToolCallEvent, ToolResultEvent } from "./openclaw-types";

// ─────────────────────────────────────────────
// SCHEMA — What a BloomTask looks like
// ─────────────────────────────────────────────

export type TaskStatus = "pending" | "in_progress" | "completed" | "failed" | "blocked";

export type VerificationMethod =
  | "read_confirmation"      // Agent must read back the thing it just wrote/sent
  | "status_check"           // Agent must query status of an external action
  | "count_verification"     // Agent must confirm a count matches expectation
  | "content_verification"   // Agent must confirm content matches directive
  | "delivery_confirmation"  // Agent must confirm receipt/delivery
  | "manual_check"           // Agent must explicitly state what it observed
  | "none";                  // Simple steps with no external action (planning, drafting)

export interface BloomStep {
  id: number;
  description: string;
  status: TaskStatus;
  verification_method: VerificationMethod;
  verification_evidence?: string;
  attempts: number;
  blocked_by?: number[];
}

export interface BloomTask {
  task_id: string;
  session_id: string;
  agent_id: string;
  client_directive: string;
  agent_understanding: string;
  steps: BloomStep[];
  status: TaskStatus;
  vera_approved: boolean;
  vera_notes?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

// ─────────────────────────────────────────────
// TOOL DEFINITION
// ─────────────────────────────────────────────

export const BLOOM_TODO_WRITE_TOOL = {
  name: "BloomTodoWrite",
  description: `
BLOOM's task planning and verification tool. You MUST call this tool before
beginning any non-trivial task. This is not optional. This is not a suggestion.

WHEN TO USE:
- Any task with more than one step
- Any task that touches external systems (email, calendar, CRM, files)
- Any task where the client is waiting for a result
- When you receive new instructions mid-task

WHEN NOT TO USE:
- Single, trivial responses (answering a simple question)
- Tasks that require no external action

RULES — these are structural, not cultural:
1. Call BloomTodoWrite FIRST before any execution
2. Mark a step "in_progress" BEFORE you begin it
3. Mark a step "completed" ONLY after you have verified it — not assumed it
4. Include verification_evidence when marking complete — what did you actually observe?
5. You cannot notify the client that work is done — only Vera can do that
6. If you are uncertain about a step, mark it "blocked" and state why

VERIFICATION MATTERS:
Saying something is done is not the same as verifying it is done.
- Sent an email? Read the sent folder. That is your evidence.
- Created a file? Read it back. That is your evidence.
- Updated a record? Query it and confirm the value changed. That is your evidence.
- Vera is watching. She will catch the difference between a guess and a check.

DO IT RIGHT. BLOOM's reputation depends on it.
`.trim(),

  input_schema: {
    type: "object",
    properties: {
      action: {
        type: "string",
        enum: ["create_plan", "update_step", "add_steps", "get_status"],
        description: "What you are doing with this tool call"
      },
      task_id: {
        type: "string",
        description: "Unique ID for this task. Generate one if creating a new plan."
      },
      client_directive: {
        type: "string",
        description: "The client's exact words. Do not paraphrase."
      },
      agent_understanding: {
        type: "string",
        description: "Your plain-language understanding of what needs to be done."
      },
      steps: {
        type: "array",
        description: "The steps you will take. Be specific. Vague steps get returned by Vera.",
        items: {
          type: "object",
          required: ["id", "description", "verification_method"],
          properties: {
            id: { type: "number" },
            description: { type: "string" },
            verification_method: {
              type: "string",
              enum: [
                "read_confirmation",
                "status_check",
                "count_verification",
                "content_verification",
                "delivery_confirmation",
                "manual_check",
                "none"
              ]
            },
            blocked_by: {
              type: "array",
              items: { type: "number" },
              description: "Step IDs that must complete before this one starts"
            }
          }
        }
      },
      step_id: {
        type: "number",
        description: "The step ID you are updating (for update_step action)"
      },
      new_status: {
        type: "string",
        enum: ["pending", "in_progress", "completed", "failed", "blocked"],
        description: "New status for the step (for update_step action)"
      },
      verification_evidence: {
        type: "string",
        description: "What you actually observed when completing this step. Required for 'completed' status."
      }
    },
    required: ["action"]
  }
};

// ─────────────────────────────────────────────
// PLUGIN IMPLEMENTATION
// ─────────────────────────────────────────────

export const bloomTodoWritePlugin: Plugin = {
  name: "bloom-todo-write",
  version: "1.0.0",
  tools: [BLOOM_TODO_WRITE_TOOL],

  async onToolCall(event: ToolCallEvent): Promise<void> {
    // Implementation handled by external verification system
  },

  async onToolResult(event: ToolResultEvent): Promise<void> {
    // Post-processing handled by vera-post-hook.py
  }
};