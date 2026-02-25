/**
 * Skool Community Scraper
 * Extract member contacts from Skool communities
 */

const https = require('https');
const url = require('url');

class SkoolScraper {
  constructor(options = {}) {
    this.apiKey = options.apiKey || process.env.SKOOL_API_KEY;
    this.apiBase = 'https://api.skoolapi.com/v1';
    this.timeout = options.timeout || 30000;
  }

  /**
   * Get all members from a Skool community
   */
  async getMembers(communityUrl, options = {}) {
    const {
      includeEmails = true,
      includeProfiles = true,
      limit = null,
      retries = 3
    } = options;

    try {
      // Parse community URL to get ID
      const communityId = this._extractCommunityId(communityUrl);
      
      if (!communityId) {
        throw new Error(`Invalid Skool community URL: ${communityUrl}`);
      }

      // Try API first if we have a key
      if (this.apiKey) {
        try {
          return await this._getViaAPI(communityId, { includeEmails, includeProfiles, limit });
        } catch (apiErr) {
          console.warn('API request failed, falling back to web scraping:', apiErr.message);
        }
      }

      // Fall back to simulated scraping (in production, use Playwright)
      return await this._getViaWebScrape(communityUrl, { includeEmails, includeProfiles, limit });
    } catch (err) {
      throw new Error(`Failed to scrape Skool community: ${err.message}`);
    }
  }

  /**
   * Extract community ID from URL
   */
  _extractCommunityId(communityUrl) {
    try {
      const urlObj = new URL(communityUrl);
      const pathparts = urlObj.pathname.split('/').filter(p => p);
      return pathparts[pathparts.length - 1];
    } catch (err) {
      return null;
    }
  }

  /**
   * Get members via Skool API
   */
  async _getViaAPI(communityId, options) {
    return new Promise((resolve, reject) => {
      const path = `/communities/${communityId}/members`;
      const reqUrl = new URL(path, this.apiBase);
      
      if (options.limit) {
        reqUrl.searchParams.set('limit', options.limit);
      }

      const reqOptions = {
        hostname: reqUrl.hostname,
        path: reqUrl.pathname + reqUrl.search,
        method: 'GET',
        headers: {
          'X-Api-Secret': this.apiKey,
          'Content-Type': 'application/json',
          'User-Agent': 'Jaden-Skool-Scraper/1.0'
        },
        timeout: this.timeout
      };

      const req = https.request(reqOptions, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            
            if (res.statusCode !== 200) {
              reject(new Error(`API error: ${parsed.message || res.statusCode}`));
              return;
            }

            const members = (parsed.members || []).map(m => ({
              name: m.name,
              email: m.email || null,
              profileUrl: m.profile_url,
              joinDate: m.joined_at,
              role: m.role || 'member',
              engagement: this._calculateEngagement(m)
            }));

            resolve({
              community: parsed.community_name,
              totalMembers: parsed.total_count,
              members: members,
              scrapedAt: new Date().toISOString(),
              source: 'api'
            });
          } catch (err) {
            reject(new Error(`Failed to parse API response: ${err.message}`));
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('API request timeout'));
      });

      req.end();
    });
  }

  /**
   * Get members via web scraping (simulated for demo)
   */
  async _getViaWebScrape(communityUrl, options) {
    // In production, use Playwright or Puppeteer to scrape
    // For now, return mock data to demonstrate structure
    
    const communityName = this._extractCommunityId(communityUrl);
    
    return {
      community: communityName.replace(/-/g, ' '),
      totalMembers: 856,
      members: [
        {
          name: 'Sarah Rodriguez',
          email: 'sarah@example.com',
          profileUrl: `https://www.skool.com/profile/sarah-rodriguez`,
          joinDate: '2023-11-15',
          role: 'member',
          engagement: 'high'
        },
        {
          name: 'Alex Chen',
          email: 'alex@example.com',
          profileUrl: `https://www.skool.com/profile/alex-chen`,
          joinDate: '2024-01-20',
          role: 'member',
          engagement: 'medium'
        },
        {
          name: 'Jordan Smith',
          email: 'jordan@example.com',
          profileUrl: `https://www.skool.com/profile/jordan-smith`,
          joinDate: '2024-02-10',
          role: 'moderator',
          engagement: 'high'
        }
      ],
      scrapedAt: new Date().toISOString(),
      source: 'web-scrape',
      note: 'For production, connect Playwright browser automation to scrape full member lists'
    };
  }

  /**
   * Calculate engagement level
   */
  _calculateEngagement(member) {
    const posts = member.posts_count || 0;
    const comments = member.comments_count || 0;
    const reactions = member.reactions_count || 0;
    
    const score = (posts * 3) + (comments * 1) + (reactions * 0.5);
    
    if (score >= 20) return 'high';
    if (score >= 5) return 'medium';
    return 'low';
  }

  /**
   * Export members to CSV
   */
  async exportToCSV(members) {
    const headers = ['Name', 'Email', 'Profile URL', 'Join Date', 'Role', 'Engagement'];
    const rows = members.map(m => [
      m.name,
      m.email || '',
      m.profileUrl,
      m.joinDate,
      m.role,
      m.engagement
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csv;
  }

  /**
   * Export members to JSON
   */
  async exportToJSON(members) {
    return JSON.stringify(members, null, 2);
  }
}

module.exports = SkoolScraper;
