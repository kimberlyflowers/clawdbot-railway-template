export const CREDENTIAL_REGISTRY = [
  { skill: "imessage", fallbacks: ["sms-twilio", "whatsapp", "gmail"], credentials: [
    { key: "IMESSAGE_BRIDGE_URL", label: "iMessage Bridge URL", how_to_get: "BlueBubbles on your Mac.", required: true },
    { key: "IMESSAGE_BRIDGE_API_KEY", label: "iMessage Bridge API Key", how_to_get: "BlueBubbles → API Settings.", required: true }
  ]},
  { skill: "gmail", fallbacks: [], credentials: [
    { key: "GMAIL_CLIENT_ID", label: "Gmail OAuth Client ID", how_to_get: "Google Cloud Console → Credentials.", required: true },
    { key: "GMAIL_CLIENT_SECRET", label: "Gmail OAuth Client Secret", how_to_get: "Same location.", required: true },
    { key: "GMAIL_REFRESH_TOKEN", label: "Gmail Refresh Token", how_to_get: "Run BLOOM Gmail auth setup script.", required: true }
  ]},
  { skill: "gohighlevel", fallbacks: ["hubspot"], credentials: [
    { key: "GHL_API_KEY", label: "GoHighLevel API Key", how_to_get: "GoHighLevel → Settings → API Keys.", required: true }
  ]},
  { skill: "stripe", fallbacks: ["quickbooks"], credentials: [
    { key: "STRIPE_SECRET_KEY", label: "Stripe Secret Key", how_to_get: "stripe.com → Developers → API Keys.", required: true }
  ]}
];

export function checkSkillCredentials(skill: string, env: Record<string, any>) {
  const def = CREDENTIAL_REGISTRY.find(d => d.skill === skill);
  if (!def) return { skill, status: "ready" as const, missing: [] };

  const missing = def.credentials.filter(c => c.required && !env[c.key]);
  if (missing.length === 0) return { skill, status: "ready" as const, missing: [] };

  // Check fallbacks
  for (const fallback of def.fallbacks) {
    const r = checkSkillCredentials(fallback, env);
    if (r.status === "ready") {
      return {
        skill,
        status: "missing" as const,
        missing,
        available_fallback: fallback,
        gap_report: `${skill} isn't connected — using ${fallback} instead.`
      };
    }
  }

  const lines = missing.map(m => `• ${m.label}: ${m.how_to_get}`).join("\n");
  return {
    skill,
    status: "missing" as const,
    missing,
    gap_report: `I want to complete this but I'm missing a connection.\n\nNeeded:\n${lines}\n\nWould you like help setting these up?`
  };
}