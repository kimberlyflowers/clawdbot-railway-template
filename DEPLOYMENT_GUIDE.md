# BLOOM Desktop Integration - Deployment Guide

This guide explains how to deploy the new `/desktop` WebSocket endpoint and desktop-control skill to your OpenClaw instances on Railway.

## Files to Update

You need to update these files in your `clawdbot-railway-template` repository:

1. **`package.json`** - Add WebSocket dependency
2. **`src/server.js`** - Add desktop WebSocket endpoint
3. **`SKILL.md`** - Desktop control skill definition
4. **`desktop-control.js`** - Skill implementation
5. **`vision-helper.js`** - Claude Vision integration

## Step 1: Update Repository Files

### 1. Replace `package.json`:
```json
{
  "dependencies": {
    "express": "^5.1.0",
    "http-proxy": "^1.18.1",
    "tar": "^7.5.4",
    "ws": "^8.18.0"
  }
}
```

### 2. Replace `src/server.js`:
Copy the complete `server.js` file that includes:
- WebSocket server setup with `ws` library
- `/desktop` endpoint handling
- Desktop connection management
- Authentication and permission flow
- Global `desktopAPI` for skills to use

### 3. Add skill files:
- `SKILL.md` - Skill documentation and metadata
- `desktop-control.js` - JavaScript implementation
- `vision-helper.js` - Claude Vision integration

## Step 2: Deploy to Railway

### Option A: Git Push (Recommended)

1. **Commit your changes:**
   ```bash
   git add .
   git commit -m "Add desktop WebSocket endpoint and control skill"
   git push origin main
   ```

2. **Railway auto-deploys:** Both Jaden and Johnathon will automatically redeploy from the same repo.

### Option B: Railway CLI

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and deploy:**
   ```bash
   railway login
   railway deploy
   ```

### Option C: Railway Dashboard

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Find your project: `clawdbot-railway-template`
3. Go to **Deployments** tab
4. Click **Deploy Now** (if auto-deploy is disabled)

## Step 3: Verify Deployment

### Check Deployment Status

1. **Railway Dashboard:**
   - Go to your project deployments
   - Wait for "Success" status (usually 2-3 minutes)

2. **Check logs:**
   ```bash
   railway logs
   ```

3. **Test the endpoints:**
   - **Jaden:** https://openclaw-railway-template-production-b301.up.railway.app
   - **Johnathon:** [Your Johnathon Railway URL]

### Verify WebSocket Endpoint

The server logs should show:
```
OpenClaw Railway wrapper listening on port 8080
Desktop WebSocket endpoint available at /desktop
```

## Step 4: Test Desktop Connection

### From BLOOM Desktop App:

1. **Get connection codes:**
   - For Jaden: `openclaw-railway-template-production-b301.up.railway.app/desktop:c31d0146f56acfe073ec2c06f5ca4d672f341e97b19defa45bfabbdcdc5edca9`

2. **Connect desktop app:**
   - Open BLOOM Desktop
   - Enter connection code
   - Grant permission when requested

3. **Test in OpenClaw console:**
   ```javascript
   // Check desktop status
   await getDesktopStatus();

   // Request permission
   await requestDesktopPermission("Test desktop connection");

   // Take screenshot
   await takeScreenshot();

   // Click on screen
   await click(400, 300);
   ```

## Step 5: Environment Variables (Optional)

Add these to Railway if you want Claude Vision integration:

```
ANTHROPIC_API_KEY=your_claude_api_key_here
```

Without this, the system uses mock vision analysis for testing.

## Troubleshooting

### Common Issues:

**1. WebSocket connection fails:**
- Check Railway logs for errors
- Verify the connection code format: `url:token`
- Ensure BLOOM Desktop app is using correct URL

**2. Deploy fails:**
- Check package.json syntax
- Verify all files are committed
- Check Railway build logs

**3. Skill not available:**
- Verify `SKILL.md` has correct YAML frontmatter
- Check `desktop-control.js` exports are correct
- Restart OpenClaw gateway (may require redeploy)

**4. Permission denied errors:**
- Ensure desktop app connection is active
- Check that permission was granted in desktop app
- Verify session IDs match between connections

### Debug Commands:

```bash
# Check Railway service status
railway status

# View deployment logs
railway logs --tail

# Connect to Railway shell
railway shell
```

## What Happens After Deployment

Both **Jaden** and **Johnathon** will have:

✅ **Desktop WebSocket endpoint** at `/desktop`
✅ **Desktop control skill** available in chat
✅ **Vision AI integration** for finding UI elements
✅ **Full desktop automation** capabilities

### New Capabilities:

- **Request desktop permission:** Agents can ask to control customer computers
- **Take screenshots:** See what's currently on screen
- **Click elements:** Use AI vision to find and click buttons, links, etc.
- **Type text:** Enter text into any application
- **Navigate apps:** Open applications, switch windows, use keyboard shortcuts
- **Automate workflows:** Complete complex multi-step tasks

### Security Features:

- **Customer authorization required** for each session
- **Emergency stop** shortcut (Cmd+Shift+Esc / Ctrl+Shift+Esc)
- **Permission revocation** at any time
- **Session logging** and audit trail

## Next Steps

1. **Test the integration** with real desktop tasks
2. **Train your agents** on desktop control capabilities
3. **Create workflows** for common customer requests
4. **Monitor usage** and gather feedback

The desktop control system is now live and ready for use! 🎉