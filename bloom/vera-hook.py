#!/usr/bin/env python3
import json, sys, os
from datetime import datetime

def main():
    payload = json.loads(sys.stdin.read())
    todos = payload.get("parameters", {}).get("todos", [])
    session_id = payload.get("session_id", "unknown")

    issues = []

    # Check for multiple steps in progress
    in_progress = [t for t in todos if t.get("status") == "in_progress"]
    if len(in_progress) > 1:
        issues.append("VERA: Multiple steps in_progress. Complete current step before starting next.")

    # Check completed steps for proper verification
    for todo in todos:
        if todo.get("status") != "completed":
            continue

        metadata = todo.get("metadata", {})
        method = metadata.get("verification_method", "none")
        evidence = metadata.get("verification_evidence", "").strip()

        # Require evidence for non-none verification methods
        if method != "none" and not evidence:
            issues.append(f"VERA: '{todo.get('content')}' needs verification_evidence. Go check and report what you observed.")

        # Check evidence quality
        elif evidence and len(evidence) < 25:
            issues.append(f"VERA: Evidence too vague: \"{evidence}\". Be specific about what you saw.")

        # Check for failure indicators in evidence
        if any(w in evidence.lower() for w in ["error", "failed", "couldn't", "unable", "no result"]):
            issues.append(f"VERA: '{todo.get('content')}' evidence indicates failure. Resolve before marking complete.")

    # Log audit trail
    os.makedirs("bloom", exist_ok=True)
    with open("bloom/vera-audit.jsonl", "a") as f:
        f.write(json.dumps({
            "timestamp": datetime.utcnow().isoformat(),
            "session_id": session_id,
            "event": "TodoWrite.PreToolUse",
            "blocked": bool(issues),
            "issues": issues
        }) + "\n")

    if issues:
        print("\n\n".join(issues), file=sys.stderr)
        sys.exit(2)  # Block TodoWrite execution

    sys.exit(0)  # Allow TodoWrite to proceed

if __name__ == "__main__":
    main()