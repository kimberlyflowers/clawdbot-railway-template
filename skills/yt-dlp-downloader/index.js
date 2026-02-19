const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Execute yt-dlp command
 */
const execYtDlp = (args) => {
  return new Promise((resolve, reject) => {
    const child = spawn('yt-dlp', args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 3600000 // 1 hour timeout for large files
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
      process.stdout.write(data);
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
      process.stderr.write(data);
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`yt-dlp exited with code ${code}: ${stderr}`));
      }
    });

    child.on('error', reject);
  });
};

/**
 * Download video
 */
const downloadVideo = async (url, options = {}) => {
  const {
    quality = 'best',
    output = '/data/downloads',
    audioOnly = false,
    subtitles = false,
    format = 'mp4'
  } = options;

  // Ensure output directory exists
  if (!fs.existsSync(output)) {
    fs.mkdirSync(output, { recursive: true });
  }

  const args = [
    url,
    '-f', quality === 'best' ? 'bestvideo[ext=mp4]/best' : `${quality}`,
    '-o', path.join(output, '%(title)s.%(ext)s')
  ];

  if (audioOnly) {
    args.push('-x', '--audio-format', 'mp3');
  }

  if (subtitles) {
    args.push('--write-subs', '--sub-langs', 'en');
  }

  try {
    const result = await execYtDlp(args);
    return {
      success: true,
      message: `Downloaded to ${output}`,
      output
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Download audio only (MP3)
 */
const downloadAudio = async (url, options = {}) => {
  const {
    output = '/data/downloads',
    format = 'mp3'
  } = options;

  if (!fs.existsSync(output)) {
    fs.mkdirSync(output, { recursive: true });
  }

  const args = [
    url,
    '-x',
    '--audio-format', format,
    '--audio-quality', '192',
    '-o', path.join(output, '%(title)s.%(ext)s')
  ];

  try {
    const result = await execYtDlp(args);
    return {
      success: true,
      message: `Downloaded audio to ${output}`,
      format,
      output
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get video info without downloading
 */
const getInfo = async (url) => {
  const args = [
    url,
    '--dump-json',
    '--no-warnings'
  ];

  try {
    const result = await execYtDlp(args);
    const info = JSON.parse(result.stdout);
    
    return {
      success: true,
      title: info.title,
      duration: info.duration,
      uploader: info.uploader,
      uploadDate: info.upload_date,
      viewCount: info.view_count,
      formats: info.formats?.length || 0,
      url: info.original_url,
      thumbnail: info.thumbnail
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Download subtitles
 */
const downloadSubtitles = async (url, options = {}) => {
  const {
    languages = ['en'],
    output = '/data/downloads',
    format = 'vtt'
  } = options;

  if (!fs.existsSync(output)) {
    fs.mkdirSync(output, { recursive: true });
  }

  const args = [
    url,
    '--write-subs',
    '--sub-langs', languages.join(','),
    '--sub-format', format,
    '-o', path.join(output, '%(title)s'),
    '--skip-download'
  ];

  try {
    const result = await execYtDlp(args);
    return {
      success: true,
      message: `Downloaded subtitles in ${languages.join(', ')} to ${output}`,
      languages,
      output
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Download batch (multiple videos/playlist)
 */
const batchDownload = async (urls, options = {}) => {
  const {
    quality = 'best',
    output = '/data/downloads'
  } = options;

  if (!fs.existsSync(output)) {
    fs.mkdirSync(output, { recursive: true });
  }

  const results = [];

  for (const url of urls) {
    try {
      const result = await downloadVideo(url, { quality, output });
      results.push({ url, ...result });
    } catch (error) {
      results.push({ url, success: false, error: error.message });
    }
  }

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  return {
    summary: {
      total: urls.length,
      successful,
      failed
    },
    results
  };
};

module.exports = {
  downloadVideo,
  downloadAudio,
  getInfo,
  downloadSubtitles,
  batchDownload
};
