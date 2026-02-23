#!/usr/bin/env python3
import json, sys, os, re
from datetime import datetime

ACTION_PATTERNS = [
    (r"\b(send|email|text|message|call|schedule|book|create|update|post|invoice|reply|respond)\b", 4),
    (r"\b(find|search|look up|check|get|fetch|pull)\b.{0,20}\b(contact|email|number|file|doc)\b", 4),
    (r"\b(remind|follow.?up|reach out|let .+ know)\b", 4),
    (r"\b(draft|write|prepare|set up|arrange|coordinate)\b", 3),
    (r"\b(add|remove|delete|move|copy|attach)\b", 3),
    (r"\b(need|want|should|please|can you|could you)\b.{0,30}\b(send|email|call|schedule)\b", 2),
]

CONVERSATIONAL_SIGNALS = [
    r"^(thanks|thank you|ok|okay|got it|sounds good|perfect|great|yes|no|sure|alright)[\s!.]*$",
    r"^(what did you|did you|have you|when did|how did).{0,50}\?$",
    r"^(nice|good|excellent|wonderful|awesome)[\s!.]*$",
]

ACTION_THRESHOLD = 6

def classify(prompt):
    prompt_lower = prompt.lower().strip()

    # Check conversational signals first
    for pattern in CONVERSATIONAL_SIGNALS:
        if re.match(pattern, prompt_lower, re.IGNORECASE):
            return False, 0

    # Score action patterns
    score = 0
    for pattern, points in ACTION_PATTERNS:
        if re.search(pattern, prompt_lower, re.IGNORECASE):
            score += points

    return score >= ACTION_THRESHOLD, score

def load_client_profile(session_id):
    profile_path = "bloom/clients/yes-school.json"
    if os.path.exists(profile_path):
        with open(profile_path) as f:
            return json.load(f)
    return None

def main():
    try:
        payload = json.loads(sys.stdin.read())
        prompt = payload.get("prompt", "")
        session_id = payload.get("session_id", "unknown")
    except Exception:
        sys.exit(0)

    is_action, score = classify(prompt)

    if not is_action:
        sys.exit(0)

    # Load client profile
    profile = load_client_profile(session_id)

    # Build context injection
    context = "BLOOM DIRECTIVE DETECTED — PLAN REQUIRED\n\n"
    context += f"Directive: \"{prompt}\"\n\n"

    if profile:
        context += f"Client: {profile.get('client_name', 'Unknown')}\n"

        # Extract client profile rules
        notes = []
        for outcome, pref in profile.get("preferences", {}).items():
            if pref.get("notes"):
                notes.append(f"- {outcome}: {pref['notes']}")

        if profile.get("reply_channel_match"):
            notes.append("- REPLY RULE: Match outbound channel to inbound source domain")

        if notes:
            context += "Client profile rules:\n" + "\n".join(notes) + "\n\n"

    context += "You MUST now:\n"
    context += "1. Research read-only (skill docs, client profile, contacts) — no external actions yet\n"
    context += "2. Present your numbered plan via exit_plan_mode — name the tool, recipient, and verification method\n"
    context += "3. Wait for Vera's score. ≥80 = proceed. <80 = revise and resubmit.\n"
    context += "4. Execute via TodoWrite after approval. Verify before marking complete.\n"

    print(context)
    sys.exit(0)

if __name__ == "__main__":
    main()