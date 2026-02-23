# OpenClaw UI Changes Required

These changes must be applied to the `openclaw/openclaw` source repository to enable live thinking stream visibility.

## File 1: ui/src/styles/chat/agent-chat.css

**ADD** after existing streaming block:

```css
.reasoning-block--streaming .reasoning-block__content {
  display: block;
  border-left-color: var(--accent);
  opacity: 0.85;
}
```

## File 2: ui/src/ui/views/chat.ts

**MODIFY** in 3 locations to add thinkingStream prop and pass through:

1. Add thinkingStream to props interface
2. Pass thinkingStream to grouped-render component
3. Handle thinkingStream events in chat view

*(Exact line numbers and code will need to be determined when openclaw source is available)*

## File 3: ui/src/ui/chat/grouped-render.ts

**CRITICAL FIX** - Change hardcoded value:

```typescript
// BEFORE (line ~98):
{ isStreaming: true, showReasoning: false }

// AFTER:
{ isStreaming: true, showReasoning: true }
```

**ADD** thinkingText parameter handling for live thinking stream display.

## Purpose

These changes enable:
- Live thinking stream visibility in client webchat
- Real-time reasoning display with proper styling
- Fix for hardcoded `showReasoning: false` bug that prevents thinking visibility

## Integration

Once applied, the ThinkingStreamHandler.ts in this repo will:
- Monitor Jaden's reasoning stream
- Send operator-only alerts to bloom/vera-alerts.jsonl
- Log all reasoning to bloom/vera-reasoning.jsonl
- Keep client-visible thinking separate from operator alerts

The UI shows client thinking; Vera alerts remain operator-only.