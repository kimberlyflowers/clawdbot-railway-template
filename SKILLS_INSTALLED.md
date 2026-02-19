# ✅ Installed Skills - 2026-02-19

## Official OpenClaw Skills (Verified/Safe)

### 🎨 Design & Content Creation
- **canvas** ✅
  - Create, export, and manage Canva designs via Connect API
  - OAuth 2.0 secure authentication
  - Location: `/data/workspace/skills/canvas/`

- **sag** (ElevenLabs TTS) ✅
  - High-quality voice synthesis and narration
  - Controllable voice parameters
  - Location: `/data/workspace/skills/sag/`

- **sherpa-onnx-tts** ✅
  - Alternative offline TTS engine
  - No API key required
  - Location: `/data/workspace/skills/sherpa-onnx-tts/`

- **openai-image-gen** ✅
  - DALL-E powered image generation
  - Text-to-image synthesis
  - Location: `/data/workspace/skills/openai-image-gen/`

### 🎬 Video & Media
- **video-frames** ✅
  - End-to-end AI video generation
  - Supports OpenAI DALL-E, Replicate, Runway, LumaAI
  - FFmpeg video editing
  - Location: `/data/workspace/skills/video-frames/`

### 🖼️ Image Editing
- **fal-ai-image-edit** ✅ (CUSTOM BUILT)
  - AI image editing: style transfer, object removal, background replacement
  - Inpainting with AI-generated content
  - Uses fal.ai API
  - Location: `/data/workspace/skills/fal-ai-image-edit/`
  - Requires: `/data/secrets/fal-api-key.txt`

### 📥 Media Download
- **yt-dlp-downloader** ✅ (CUSTOM BUILT)
  - Download from 1000+ sites (YouTube, TikTok, Twitter, Instagram, Bilibili, etc.)
  - Quality/format selection, subtitle extraction, batch download
  - Location: `/data/workspace/skills/yt-dlp-downloader/`
  - Requires: `yt-dlp` system package (`pip install yt-dlp`)

### 💼 CRM & Business
- **ghl** (GoHighLevel) ✅ (CUSTOM BUILT & UPDATED)
  - Complete GoHighLevel CRM integration
  - Contacts, conversations, messages, calendars, funnels, documents, email
  - Full API endpoint coverage
  - Location: `/data/workspace/skills/ghl/`
  - Requires: `/data/secrets/ghl-token.txt`
  - Location ID: `iGy4nrpDVU0W1jAvseL3`

### 🚀 Other
- **drive-delivery** (existing)
  - Google Drive file uploads with shareable links
  - Location: `/data/workspace/skills/drive-delivery/`

## Required Secrets

Create these files with your API keys:

```bash
# fal.ai
echo "your_fal_api_key" > /data/secrets/fal-api-key.txt

# GoHighLevel
echo "your_ghl_api_token" > /data/secrets/ghl-token.txt
```

## System Requirements

```bash
# For yt-dlp downloader
pip install yt-dlp

# Optional: for video processing (already available)
# ffmpeg is included in video-frames skill
```

## Quick Start

### Canvas Design
```javascript
const canvas = require('/data/workspace/skills/canvas');
// Create and manage Canva designs
```

### Text-to-Speech
```javascript
const sag = require('/data/workspace/skills/sag');
await sag.generateSpeech('Hello world', { voice: 'rachel' });
```

### AI Video Generation
```javascript
const video = require('/data/workspace/skills/video-frames');
await video.generate({ prompt: 'A sunset over mountains' });
```

### Image Editing
```javascript
const fal = require('/data/workspace/skills/fal-ai-image-edit');
await fal.removeObject('image.jpg', 'mask.jpg');
await fal.styleTransfer('photo.jpg', 'van-gogh');
```

### Media Download
```javascript
const ytdlp = require('/data/workspace/skills/yt-dlp-downloader');
await ytdlp.downloadVideo('https://youtube.com/watch?v=...', { quality: '720p' });
await ytdlp.downloadAudio('https://youtube.com/watch?v=...', { format: 'mp3' });
```

### GoHighLevel CRM
```javascript
const ghl = require('/data/workspace/skills/ghl');
await ghl.contacts.listContacts();
await ghl.messages.sendMessage({ contactId, type: 'SMS', message: 'Hi!' });
await ghl.calendars.bookAppointment({ calendarId, contactId, startTime, endTime });
```

## Summary

✅ **8 Skills Installed**
- 5 Official OpenClaw verified skills
- 3 Custom-built skills (fal-ai, yt-dlp, GHL complete)
- All with SKILL.md documentation and working implementations
- Ready for production use

---

**Date Added**: 2026-02-19 06:45 UTC
**Added By**: Jaden
