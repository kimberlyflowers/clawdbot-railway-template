---
name: yt-dlp-downloader
description: Media downloader for YouTube, TikTok, Twitter, Instagram, Bilibili and other supported sites with quality, subtitle, and audio extraction workflows.
---

# yt-dlp Media Downloader Skill

**Download videos and audio from 1000+ websites with quality and format control**

## Supported Sites

- ✅ YouTube
- ✅ TikTok
- ✅ Twitter/X
- ✅ Instagram
- ✅ Bilibili
- ✅ Twitch
- ✅ Reddit
- ✅ And 1000+ more (full list: https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md)

## Features

- 🎬 **Video Download** - Multiple quality levels
- 🔊 **Audio Only** - Extract MP3 from videos
- 📝 **Subtitles** - Auto-download subtitle files
- 📊 **Metadata** - Get info without downloading
- 🎯 **Quality Selection** - Choose resolution, fps, codec
- 📚 **Batch Download** - Download multiple videos/playlists
- 🚀 **Streaming** - Resume interrupted downloads

## Setup

```bash
# Install yt-dlp
npm install yt-dlp

# Or system-wide
pip install yt-dlp
```

## Functions

### Download Video
```javascript
async downloadVideo(url, options)
// options: { quality: '720p', output: './downloads', audioOnly: false }
```

### Download Audio (MP3)
```javascript
async downloadAudio(url, options)
// Extract audio track as MP3
```

### Get Video Info
```javascript
async getInfo(url)
// Get metadata without downloading
```

### Download Subtitles
```javascript
async downloadSubtitles(url, options)
// options: { languages: ['en', 'es'], format: 'vtt' }
```

### Batch Download
```javascript
async batchDownload(urls, options)
// Download multiple videos/playlists
```

## Usage Examples

```javascript
const skill = require('./index.js');

// Download video in best quality
await skill.downloadVideo('https://www.youtube.com/watch?v=...', {
  quality: 'best',
  output: '/data/downloads'
});

// Extract audio as MP3
await skill.downloadAudio('https://www.youtube.com/watch?v=...', {
  output: '/data/downloads',
  format: 'mp3'
});

// Get video info
const info = await skill.getInfo('https://www.youtube.com/watch?v=...');
console.log(info.title, info.duration, info.uploader);

// Download with subtitles
await skill.downloadSubtitles('https://www.youtube.com/watch?v=...', {
  languages: ['en', 'es'],
  output: '/data/downloads'
});

// Download entire playlist
await skill.batchDownload([
  'https://www.youtube.com/watch?v=video1',
  'https://www.youtube.com/watch?v=video2'
], {
  quality: '720p',
  output: '/data/downloads'
});
```

## Quality Options

- `best` - Best overall quality
- `worst` - Smallest file size
- `720p` / `480p` / `360p` - Specific resolution
- `60fps` - High frame rate
- `bestvideo+bestaudio` - Separate video and audio (best quality)

## Output Formats

- `mp4` - Video container
- `mkv` - Video container with better codec support
- `mp3` - Audio only
- `m4a` - Audio container
- `webm` - Web format

## CLI Alternatives

```bash
# Download video
yt-dlp 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' -o '%(title)s.%(ext)s'

# Audio only
yt-dlp -x --audio-format mp3 'https://www.youtube.com/watch?v=...'

# With subtitles
yt-dlp --write-subs --sub-langs en,es 'https://www.youtube.com/watch?v=...'

# Playlist
yt-dlp 'https://www.youtube.com/playlist?list=...'
```

## Docs

- https://github.com/yt-dlp/yt-dlp
- https://github.com/yt-dlp/yt-dlp#usage-and-examples
