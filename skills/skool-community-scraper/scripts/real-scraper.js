/**
 * Real Skool Community Scraper using Playwright
 * Actually visits communities and extracts real member data from the DOM
 */

const { chromium } = require('playwright');

class RealSkoolScraper {
  constructor(options = {}) {
    this.headless = options.headless !== false;
    this.timeout = options.timeout || 30000;
  }

  /**
   * Scrape real Skool community members
   */
  async scrapeCommunity(communityUrl, options = {}) {
    const browser = await chromium.launch({ headless: this.headless });
    const page = await browser.newPage();

    try {
      console.log('🌐 Visiting: ' + communityUrl);
      await page.goto(communityUrl, { waitUntil: 'networkidle', timeout: this.timeout });

      console.log('⏳ Extracting member data from DOM...');

      // Extract members from the page
      const members = await page.evaluate(() => {
        const memberElements = document.querySelectorAll('[class*="member"], [class*="profile"]');
        const extracted = [];

        // Look for member cards, names, emails in common Skool DOM patterns
        memberElements.forEach((el) => {
          const name = el.querySelector('[class*="name"]')?.textContent?.trim() ||
                      el.getAttribute('data-name') ||
                      el.textContent?.split('\n')[0]?.trim();

          const email = el.querySelector('[class*="email"]')?.textContent?.trim() ||
                       el.getAttribute('data-email') ||
                       (el.textContent?.match(/[\w.-]+@[\w.-]+\.\w+/) || [null])[0];

          const profileUrl = el.querySelector('a')?.href;
          const joinDate = el.getAttribute('data-joined') || el.querySelector('[class*="date"]')?.textContent?.trim();
          const engagement = el.getAttribute('data-engagement') || 'medium';

          if (name && name.length > 2) {
            extracted.push({
              name,
              email: email || null,
              profileUrl: profileUrl || null,
              joinDate: joinDate || null,
              engagement: engagement,
              role: el.getAttribute('data-role') || 'member'
            });
          }
        });

        // Remove duplicates by name
        const seen = new Set();
        return extracted.filter((m) => {
          if (seen.has(m.name)) return false;
          seen.add(m.name);
          return true;
        });
      });

      // Scroll and wait for lazy-loaded members
      if (members.length < 5) {
        console.log('⏳ Scrolling to load more members...');
        for (let i = 0; i < 3; i++) {
          await page.evaluate(() => window.scrollBy(0, window.innerHeight));
          await page.waitForTimeout(1000);
        }

        // Try extracting again
        const moreMembers = await page.evaluate(() => {
          const memberElements = document.querySelectorAll('[class*="member"], [class*="profile"], [class*="user"]');
          const extracted = [];

          memberElements.forEach((el) => {
            const text = el.textContent?.trim() || '';
            const name = el.querySelector('[class*="name"]')?.textContent?.trim() || text.split('\n')[0];
            const email = (text.match(/[\w.-]+@[\w.-]+\.\w+/) || [null])[0];

            if (name && name.length > 3 && !name.includes('Member') && !name.includes('Profile')) {
              extracted.push({
                name,
                email: email || null,
                profileUrl: el.querySelector('a')?.href || null,
                joinDate: null,
                engagement: 'medium',
                role: 'member'
              });
            }
          });

          const seen = new Set();
          return extracted.filter((m) => {
            if (seen.has(m.name)) return false;
            seen.add(m.name);
            return true;
          });
        });

        members.push(...moreMembers);
      }

      // Get community metadata
      const communityInfo = await page.evaluate(() => {
        const title = document.querySelector('h1')?.textContent?.trim() ||
                      document.querySelector('title')?.textContent?.trim() ||
                      'Unknown Community';

        const description = document.querySelector('[class*="description"]')?.textContent?.trim() ||
                           document.querySelector('[class*="bio"]')?.textContent?.trim() ||
                           '';

        const memberCount = document.body.textContent?.match(/(\d+)\s*(members?|people)/i)?.[1] || 'Unknown';

        return { title, description, memberCount };
      });

      await browser.close();

      return {
        url: communityUrl,
        community: communityInfo.title,
        description: communityInfo.description,
        totalMembers: communityInfo.memberCount,
        membersExtracted: members.length,
        members: members,
        scrapedAt: new Date().toISOString(),
        method: 'playwright-real',
        success: true
      };
    } catch (err) {
      await browser.close();
      throw new Error('Failed to scrape community: ' + err.message);
    }
  }

  /**
   * Batch scrape multiple communities
   */
  async scrapeCommunities(urls) {
    const results = [];

    for (const url of urls) {
      try {
        console.log('\n▶️  Scraping: ' + url);
        const result = await this.scrapeCommunity(url);
        results.push(result);
        console.log('✅ Found ' + result.members.length + ' members');
      } catch (err) {
        console.error('❌ Error:', err.message);
        results.push({
          url: url,
          success: false,
          error: err.message
        });
      }
    }

    return results;
  }
}

module.exports = RealSkoolScraper;
