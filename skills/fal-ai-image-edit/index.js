const fs = require('fs');
const https = require('https');

const FAL_API_KEY = fs.readFileSync('/data/secrets/fal-api-key.txt', 'utf8').trim();
const FAL_API_BASE = 'https://api.fal.ai/v1';

/**
 * Make request to fal.ai API
 */
const falRequest = async (endpoint, payload) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    
    const options = {
      hostname: 'api.fal.ai',
      port: 443,
      path: `/v1${endpoint}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'Authorization': `Key ${FAL_API_KEY}`
      },
      timeout: 120000
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(parsed.error?.message || `HTTP ${res.statusCode}`));
          }
        } catch (err) {
          reject(new Error(`Parse error: ${err.message}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('API request timeout'));
    });

    req.write(data);
    req.end();
  });
};

/**
 * Style Transfer - Apply artistic style to image
 */
const styleTransfer = async (imageUrl, styleType = 'oil-painting') => {
  try {
    const result = await falRequest('/style-transfer', {
      image_url: imageUrl,
      style: styleType
    });

    return {
      success: true,
      imageUrl: result.image?.url,
      style: styleType
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Remove Object - Remove unwanted objects from image
 */
const removeObject = async (imageUrl, maskUrl) => {
  try {
    const result = await falRequest('/object-removal', {
      image_url: imageUrl,
      mask_url: maskUrl
    });

    return {
      success: true,
      imageUrl: result.image?.url,
      message: 'Object removed successfully'
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Replace Background
 */
const replaceBackground = async (imageUrl, backgroundUrl) => {
  try {
    const result = await falRequest('/background-replacement', {
      image_url: imageUrl,
      background_url: backgroundUrl
    });

    return {
      success: true,
      imageUrl: result.image?.url,
      message: 'Background replaced'
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Inpaint - Fill masked regions with AI-generated content
 */
const inpaint = async (imageUrl, maskUrl, prompt) => {
  try {
    const result = await falRequest('/inpainting', {
      image_url: imageUrl,
      mask_url: maskUrl,
      prompt: prompt
    });

    return {
      success: true,
      imageUrl: result.image?.url,
      prompt: prompt,
      message: 'Inpainting complete'
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = {
  styleTransfer,
  removeObject,
  replaceBackground,
  inpaint
};
