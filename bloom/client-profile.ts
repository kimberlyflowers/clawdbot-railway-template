export type OutcomeCategory = "send_message" | "send_email" | "manage_crm" | "generate_image"
  | "schedule_meeting" | "store_document" | "voice_call" | "send_invoice";

export interface ClientToolProfile {
  client_id: string;
  client_name: string;
  reply_channel_match: boolean;
  preferences: Partial<Record<OutcomeCategory, {
    primary: { tool: string; label: string };
    fallbacks: { tool: string; label: string }[];
    notes?: string;
  }>>;
}

export function resolveToolForOutcome(outcome: OutcomeCategory, profile: ClientToolProfile, credentials: Record<string, boolean>) {
  const pref = profile.preferences[outcome];
  if (!pref) return null;

  if (credentials[pref.primary.tool] !== false)
    return { tool: pref.primary.tool, label: pref.primary.label, is_fallback: false };

  for (const fb of pref.fallbacks) {
    if (credentials[fb.tool] !== false)
      return { tool: fb.tool, label: fb.label, is_fallback: true, fallback_reason: `${pref.primary.label} not available` };
  }

  return null;
}

export class ClientProfileManager {
  constructor(private workspace: any) {}

  async loadProfile(clientId: string): Promise<ClientToolProfile | null> {
    try {
      return JSON.parse(await this.workspace.read(`bloom/clients/${clientId}.json`));
    } catch {
      return null;
    }
  }
}