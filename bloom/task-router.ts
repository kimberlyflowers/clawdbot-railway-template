import type { Plugin } from "./openclaw-types";
import { checkSkillCredentials } from "./credential-checker";
import { ClientProfileManager, resolveToolForOutcome, OutcomeCategory } from "./client-profile";

const SKILL_REGISTRY = [
  { skill: "imessage", outcome: "send_message" as OutcomeCategory, required: true,
    triggers: [/text (my |him |her |them )?\w+/i, /send (a )?message to/i] },
  { skill: "gmail", outcome: "send_email" as OutcomeCategory, required: true,
    triggers: [/send (an )?email/i, /email (my |him |her |them )?\w+/i, /draft (an )?email/i] },
  { skill: "calendar", outcome: "schedule_meeting" as OutcomeCategory, required: true,
    triggers: [/schedule (a |an )?\w+/i, /add .+ to (my )?calendar/i, /book (a |an )?\w+/i] },
  { skill: "gohighlevel", outcome: "manage_crm" as OutcomeCategory, required: true,
    triggers: [/add (a |the )?lead/i, /update (the )?contact/i, /\bcrm\b/i] },
  { skill: "google-drive", outcome: "store_document" as OutcomeCategory, required: true,
    triggers: [/find (the |my )?(doc|document|file)/i, /google (doc|drive|sheet)/i] },
  { skill: "stripe", outcome: "send_invoice" as OutcomeCategory, required: true,
    triggers: [/send (an |the )?invoice/i, /charge (the )?client/i] },
];

export const bloomTaskRouterPlugin: Plugin = {
  name: "bloom-task-router",
  version: "1.0.0",
  hooks: {
    message_received: async (event, context) => {
      const { content } = event;
      const matched = SKILL_REGISTRY.filter(r => r.triggers.some(p => p.test(content)));

      if (matched.length === 0) return;

      const env = process.env as Record<string, string | undefined>;
      const profileManager = new ClientProfileManager(context.workspace);
      const profile = await profileManager.loadProfile(context.client_id);

      const routed: string[] = [];
      const notices: string[] = [];
      const gaps: string[] = [];

      for (const route of matched) {
        let skill = route.skill;

        if (profile) {
          const resolved = resolveToolForOutcome(route.outcome, profile,
            Object.fromEntries(Object.keys(env).map(k => [k, !!env[k]])));
          if (resolved) {
            if (resolved.is_fallback) {
              notices.push(`Using ${resolved.label} (${resolved.fallback_reason})`);
            }
            skill = resolved.tool;
          }
        }

        const cred = checkSkillCredentials(skill, env);
        if (cred.status === "missing") {
          if (cred.available_fallback) {
            notices.push(cred.gap_report || "");
            skill = cred.available_fallback;
          } else {
            if (route.required) gaps.push(cred.gap_report || "");
            continue;
          }
        }

        routed.push(skill);
      }

      let injection = `## BLOOM Task Router\n\nDirective: "${content}"\n\n`;
      if (routed.length > 0) {
        injection += `### Skills for this task — read SKILL.md before planning:\n`;
        routed.forEach(s => { injection += `- **${s}**\n`; });
      }

      if (notices.length > 0) {
        injection += `\n### Routing notes:\n`;
        notices.forEach(n => { injection += `- ${n}\n`; });
      }

      if (gaps.length > 0) {
        injection += `\n### BLOCKED:\n`;
        gaps.forEach(g => { injection += `${g}\n`; });
      }

      await context.inject_context({
        role: "system",
        content: injection,
        priority: "high"
      });
    }
  }
};