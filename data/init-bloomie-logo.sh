#!/bin/bash
# Bloomie Logo Swap (Text Only)
# Changes "OpenClaw" to "🌸 Bloomie" in Control UI header
# Runs once on first boot

set -e

INIT_LOCK="/data/.bloomie-logo-initialized"

# Check if already done
if [ -f "$INIT_LOCK" ]; then
    exit 0
fi

echo "🌸 Swapping OpenClaw logo to Bloomie..."

# Create minimal CSS override that swaps the header text
# This uses CSS content property to replace "OpenClaw" with "Bloomie"
mkdir -p /openclaw/dist/control-ui/styles

cat > /openclaw/dist/control-ui/styles/bloomie-logo.css << 'CSS'
/* Bloomie Logo Text Swap (Header Only) */

/* Hide OpenClaw text, show Bloomie */
.app-header h1::before {
  content: "🌸 Bloomie";
  display: block;
}

.app-header h1 {
  font-size: 0;
}

.app-header h1::before {
  font-size: 1.875rem;
}

/* Alternative: If header uses different selector */
[class*="logo"] {
  font-size: 0;
}

[class*="logo"]::before {
  content: "🌸 Bloomie";
  font-size: 1.25rem;
}
CSS

# Inject CSS into the main stylesheet by appending to it
if [ -f "/openclaw/dist/control-ui/styles.css" ]; then
    cat /openclaw/dist/control-ui/styles/bloomie-logo.css >> /openclaw/dist/control-ui/styles.css
    echo "✅ Logo CSS appended to main stylesheet"
fi

# Mark as done
touch "$INIT_LOCK"

echo "🌸 Bloomie logo swap complete"
exit 0
