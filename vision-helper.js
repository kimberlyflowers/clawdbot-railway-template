// Claude Vision Integration for Desktop Control
// This module integrates with Claude's vision capabilities to analyze screenshots

const crypto = require('crypto');

class VisionHelper {
  constructor(apiKey = null) {
    this.apiKey = apiKey || process.env.ANTHROPIC_API_KEY;
  }

  // Analyze screenshot and find UI elements
  async analyzeScreenshot(imageData, prompt) {
    if (!this.apiKey) {
      console.warn('No Anthropic API key provided, using mock vision analysis');
      return this.mockVisionAnalysis(prompt);
    }

    try {
      // Convert base64 to the format Claude expects
      const imageBase64 = imageData.toString('base64');

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this screenshot and ${prompt}. Please provide:
1. A description of what you see
2. The locations of interactive elements (buttons, text fields, etc.)
3. Specific coordinates for any elements mentioned in the prompt

Format coordinates as {x: number, y: number, width: number, height: number} for each element found.

If you find the specific element requested, mark it clearly in your response.`
              },
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: imageBase64
                }
              }
            ]
          }],
          system: 'You are a desktop automation assistant that analyzes screenshots to help locate UI elements. Be precise with coordinates and descriptions.'
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return this.parseVisionResponse(result.content[0].text, prompt);

    } catch (error) {
      console.error('Vision analysis error:', error);
      return this.mockVisionAnalysis(prompt);
    }
  }

  // Parse Claude's vision response to extract structured data
  parseVisionResponse(responseText, originalPrompt) {
    const elements = [];

    // Look for coordinate patterns in Claude's response
    const coordinateRegex = /\{?\s*x:\s*(\d+),?\s*y:\s*(\d+),?\s*width:\s*(\d+),?\s*height:\s*(\d+)\s*\}?/gi;
    const matches = responseText.matchAll(coordinateRegex);

    let elementIndex = 0;
    for (const match of matches) {
      const [, x, y, width, height] = match;

      // Try to extract description from surrounding text
      const matchIndex = match.index;
      const surroundingText = responseText.substring(Math.max(0, matchIndex - 100), matchIndex + 100);
      const description = this.extractElementDescription(surroundingText) || `Element ${elementIndex + 1}`;

      elements.push({
        type: this.guessElementType(description),
        description,
        x: parseInt(x),
        y: parseInt(y),
        width: parseInt(width),
        height: parseInt(height),
        confidence: 0.8 // Claude's analysis is generally reliable
      });

      elementIndex++;
    }

    // Also look for simpler coordinate mentions
    const simpleCoordRegex = /(\w+(?:\s+\w+)*)\s*(?:is\s+)?(?:at|located)\s*(?:at\s*)?(?:coordinates?\s*)?(?:\()?(\d+)[,\s]+(\d+)(?:\))?/gi;
    const simpleMatches = responseText.matchAll(simpleCoordRegex);

    for (const match of simpleMatches) {
      const [, description, x, y] = match;

      // Avoid duplicates
      if (!elements.some(el => Math.abs(el.x - parseInt(x)) < 10 && Math.abs(el.y - parseInt(y)) < 10)) {
        elements.push({
          type: this.guessElementType(description),
          description: description.trim(),
          x: parseInt(x),
          y: parseInt(y),
          width: 50, // Default width for simple coordinates
          height: 30, // Default height
          confidence: 0.6
        });
      }
    }

    return {
      analysis: responseText,
      elements,
      found: elements.length > 0,
      prompt: originalPrompt
    };
  }

  // Extract element description from surrounding text
  extractElementDescription(text) {
    // Look for common UI element descriptions
    const patterns = [
      /(?:the\s+)?(\w+(?:\s+\w+)*)\s+(?:button|field|input|text|label|icon|menu|link|checkbox|dropdown)/i,
      /(?:button|field|input|text|label|icon|menu|link|checkbox|dropdown)\s+(?:labeled|titled|named)\s+['""]?([^'""\n]+)['""]?/i,
      /['""]([^'""\n]+)['""](?:\s+(?:button|field|input|text|label|icon|menu|link|checkbox|dropdown))/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return null;
  }

  // Guess element type based on description
  guessElementType(description) {
    const desc = description.toLowerCase();

    if (desc.includes('button') || desc.includes('btn')) return 'button';
    if (desc.includes('field') || desc.includes('input') || desc.includes('textbox')) return 'textfield';
    if (desc.includes('checkbox')) return 'checkbox';
    if (desc.includes('dropdown') || desc.includes('select')) return 'dropdown';
    if (desc.includes('link')) return 'link';
    if (desc.includes('icon')) return 'icon';
    if (desc.includes('menu')) return 'menu';
    if (desc.includes('label') || desc.includes('text')) return 'text';

    return 'element'; // Generic fallback
  }

  // Mock vision analysis for testing/fallback
  mockVisionAnalysis(prompt) {
    console.log('Using mock vision analysis for:', prompt);

    // Return realistic mock data
    return {
      analysis: `Mock analysis: Looking for "${prompt}" on the screen. This is a simulated response for testing purposes.`,
      elements: [
        {
          type: 'button',
          description: `Mock ${prompt.includes('button') ? 'button' : 'element'}`,
          x: 400,
          y: 300,
          width: 100,
          height: 40,
          confidence: 0.5
        }
      ],
      found: true,
      prompt,
      mock: true
    };
  }

  // Find specific element by description
  async findElementOnScreen(imageData, elementDescription) {
    const analysis = await this.analyzeScreenshot(
      imageData,
      `find the ${elementDescription} and provide its exact coordinates`
    );

    // Look for the best match
    let bestMatch = null;
    let bestScore = 0;

    for (const element of analysis.elements) {
      const score = this.calculateMatchScore(elementDescription, element.description);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = element;
      }
    }

    if (bestMatch && bestScore > 0.3) {
      return {
        found: true,
        element: bestMatch,
        center: {
          x: bestMatch.x + bestMatch.width / 2,
          y: bestMatch.y + bestMatch.height / 2
        },
        confidence: bestMatch.confidence * bestScore
      };
    }

    return {
      found: false,
      error: `Could not find "${elementDescription}" on the screen`,
      analysis: analysis.analysis
    };
  }

  // Calculate match score between search term and element description
  calculateMatchScore(searchTerm, elementDescription) {
    const search = searchTerm.toLowerCase();
    const desc = elementDescription.toLowerCase();

    // Exact match
    if (desc === search) return 1.0;

    // Contains search term
    if (desc.includes(search)) return 0.8;

    // Word overlap
    const searchWords = search.split(/\s+/);
    const descWords = desc.split(/\s+/);
    const overlap = searchWords.filter(word => descWords.includes(word));
    const overlapScore = overlap.length / Math.max(searchWords.length, descWords.length);

    return overlapScore;
  }
}

module.exports = VisionHelper;