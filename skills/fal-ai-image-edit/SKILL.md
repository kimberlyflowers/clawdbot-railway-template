---
name: fal-ai-image-edit
description: AI-powered image editing with style transfer, object removal, background changes, and inpainting using fal.ai model workflows.
---

# fal.ai Image Editor Skill

**AI-powered image editing and manipulation via fal.ai API**

## Features

- 🎨 **Style Transfer** - Apply artistic styles to images
- 🗑️ **Object Removal** - Remove unwanted objects from images
- 🌅 **Background Replacement** - Change or replace image backgrounds
- 🖌️ **Inpainting** - Fill in masked regions with AI-generated content
- 📸 **Quality Control** - Batch processing with quality validation

## Setup

### 1. Get API Key
```bash
# Create account at https://www.fal.ai/
# Generate API key from dashboard
# Save to secrets:
echo "your_fal_api_key" > /data/secrets/fal-api-key.txt
```

### 2. Environment
```javascript
const FAL_API_KEY = fs.readFileSync('/data/secrets/fal-api-key.txt', 'utf8').trim();
```

## Functions

### Style Transfer
```javascript
async styleTransfer(imageUrl, styleType)
// styleType: 'oil-painting', 'watercolor', 'cartoon', 'pencil-sketch', 'van-gogh'
```

### Object Removal
```javascript
async removeObject(imageUrl, maskUrl)
// maskUrl: Image with white pixels marking objects to remove
```

### Background Replacement
```javascript
async replaceBackground(imageUrl, backgroundUrl)
// backgroundUrl: New background image
```

### Inpainting
```javascript
async inpaint(imageUrl, maskUrl, prompt)
// maskUrl: White pixels = areas to fill
// prompt: Description of what to generate in masked area
```

## Usage Examples

```javascript
const skill = require('./index.js');

// Remove an object from image
const result = await skill.removeObject(
  'https://example.com/photo.jpg',
  'https://example.com/mask.jpg'
);

// Apply artistic style
const styled = await skill.styleTransfer(
  'https://example.com/photo.jpg',
  'van-gogh'
);

// Replace background
const newBg = await skill.replaceBackground(
  'https://example.com/portrait.jpg',
  'https://example.com/background.jpg'
);

// Inpaint with AI
const filled = await skill.inpaint(
  'https://example.com/photo.jpg',
  'https://example.com/mask.jpg',
  'A sunset sky'
);
```

## API Docs

- https://fal.ai/docs

## Cost

- Pay-per-use, typically $0.01-0.10 per operation
- First 100 calls free during trial
