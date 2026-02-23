---
name: vera
description: "BLOOM verification layer - validates completion claims before delivery"
metadata:
  openclaw:
    emoji: "✅"
    events: ["message:sent"]
    requires:
      bins: ["node"]
---

# Vera Verification Hook

Native OpenClaw hook that intercepts Jaden's completion messages and verifies claims before allowing delivery to client.

## Flow
1. Jaden sends completion claim
2. `message:sent` event fires
3. Vera validates the claim
4. **Verified**: Allow message through
5. **Not verified**: Block message + send feedback to Jaden

## Verification Methods
- **Email sent**: Check GHL conversations API
- **File created**: Verify file exists locally
- **File uploaded**: Check Google Drive API
- **Deployment**: Check Railway health endpoint
- **General claims**: Log for manual review

## Integration
- Uses existing BLOOM modules: `vera-verification.js`, `message-gating.js`
- Maintains audit trail in `bloom/vera-audit.jsonl`
- Escalates failures to Kimberly after 3 attempts