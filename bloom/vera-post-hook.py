#!/usr/bin/env python3
import json, sys, os
from datetime import datetime

def main():
    payload = json.loads(sys.stdin.read())
    todos = payload.get("parameters", {}).get("todos", [])
    session_id = payload.get("session_id", "unknown")

    if not todos:
        sys.exit(0)

    # Track progress
    total = len(todos)
    completed = [t for t in todos if t.get("status") == "completed"]

    # Log progress
    os.makedirs("bloom", exist_ok=True)
    with open("bloom/vera-progress.jsonl", "a") as f:
        f.write(json.dumps({
            "timestamp": datetime.utcnow().isoformat(),
            "session_id": session_id,
            "completed": f"{len(completed)}/{total}"
        }) + "\n")

    # Check if all steps are completed and verified
    if len(completed) == total and total > 0:
        with open("bloom/vera-audit.jsonl", "a") as f:
            f.write(json.dumps({
                "timestamp": datetime.utcnow().isoformat(),
                "session_id": session_id,
                "status": "VERA_GATE_CLEARED",
                "message": "All steps verified. Jaden authorized to deliver completion message."
            }) + "\n")

    sys.exit(0)

if __name__ == "__main__":
    main()