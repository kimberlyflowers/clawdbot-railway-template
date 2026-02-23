#!/usr/bin/env python3
import json, sys, re, os
from datetime import datetime

VAGUE_PATTERNS = [
    r"\betc\b", r"\bhandle it\b", r"\btake care of\b", r"\bcomplete the request\b",
    r"\bdo the task\b", r"\bsend the email\b(?!\s+to\s+\w)", r"\band so on\b",
]

KNOWN_TOOLS = [
    "gmail", "yahoo", "yahoo mail", "imessage", "whatsapp", "sms", "twilio",
    "google calendar", "calendly", "gohighlevel", "hubspot", "stripe", "quickbooks",
    "google drive", "nano banana", "ideogram", "dalle", "notion", "slack",
    "voice call", "twilio voice",
]

def score_plan(plan, profile):
    plan_lower = plan.lower()
    score = 0
    feedback = []

    is_action = bool(re.search(
        r"\b(send|email|text|message|call|schedule|create|update|post|invoice|reply)\b", plan_lower))

    # Dimension 1: Tool specificity (25 pts)
    if is_action:
        if any(tool in plan_lower for tool in KNOWN_TOOLS):
            score += 25
        else:
            feedback.append("Tool specificity (0/25): Name the exact tool. Not 'send an email' — 'send via Gmail' or 'send via Yahoo'.")
    else:
        score += 25

    # Dimension 2: Verification coverage (25 pts)
    has_verification = bool(re.search(
        r"\b(verif|confirm|check.*sent|read.*back|confirm.*delivered|sent folder|delivery receipt|check.*calendar)\b", plan_lower))
    if has_verification:
        score += 25
    elif is_action:
        feedback.append("Verification coverage (0/25): Add a verification step. How will you confirm it actually happened?")
    else:
        score += 25

    # Dimension 3: Language quality (25 pts)
    vague_found = any(re.search(p, plan_lower, re.IGNORECASE) for p in VAGUE_PATTERNS)
    if not vague_found and len(plan.strip()) >= 80:
        score += 25
    elif vague_found:
        feedback.append("Language quality (0/25): Remove vague language ('etc', 'handle it'). Be specific.")
    else:
        feedback.append("Language quality (0/25): Plan is too brief. Include steps, tool, recipient, and verification.")

    # Dimension 4: Client profile match (25 pts)
    profile_score = 25
    if profile and profile.get("reply_channel_match"):
        is_reply = bool(re.search(r"\b(reply|respond|response)\b", plan_lower))
        checked_source = bool(re.search(r"\b(from:|inbound|source|original.*email|same.*channel)\b", plan_lower))
        if is_reply and not checked_source:
            profile_score -= 15
            feedback.append("Client profile (10/25): Read the From: header. Match outbound tool to inbound source domain.")
    score += profile_score

    return min(score, 100), feedback

def main():
    try:
        payload = json.loads(sys.stdin.read())
        plan = payload.get("parameters", {}).get("plan", "")
        session_id = payload.get("session_id", "unknown")
    except Exception:
        sys.exit(0)

    profile = None
    if os.path.exists("bloom/clients/yes-school.json"):
        with open("bloom/clients/yes-school.json") as f:
            profile = json.load(f)

    score, feedback = score_plan(plan, profile)
    status = "APPROVED" if score >= 80 else "RETURNED"

    # Log to audit trail
    os.makedirs("bloom", exist_ok=True)
    with open("bloom/vera-plans.jsonl", "a") as f:
        f.write(json.dumps({
            "timestamp": datetime.utcnow().isoformat(),
            "session_id": session_id,
            "score": score,
            "status": status,
            "feedback": feedback,
            "plan_preview": plan[:300]
        }) + "\n")

    if score >= 80:
        sys.exit(0)  # Allow plan to proceed

    # Return feedback for revision
    response = f"VERA PLAN SCORE: {score}/100 — Revision required.\n\nPoints lost:\n"
    for item in feedback:
        response += f"• {item}\n"
    response += "\nRevise and resubmit via exit_plan_mode."

    print(response, file=sys.stderr)
    sys.exit(2)  # Block plan execution

if __name__ == "__main__":
    main()