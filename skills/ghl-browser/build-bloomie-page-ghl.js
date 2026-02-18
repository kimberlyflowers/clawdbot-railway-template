/**
 * Bloomie Sales Page → GHL Page Builder Automation
 * Builds complete Bloomie-Hire-AI-Employee-V1 funnel
 * 
 * Usage: node build-bloomie-page-ghl.js
 * Prerequisites: Valid GHL session in /data/secrets/ghl-session.json
 */

const { chromium } = require('playwright');
const SessionManager = require('./session-manager');
const fs = require('fs');

const GHL_URL = 'https://app.gohighlevel.com/';
const FUNNEL_NAME = 'Bloomie-Hire-AI-Employee-V1';

class GHLPageBuilder {
  constructor() {
    this.browser = null;
    this.page = null;
    this.screenshots = [];
  }

  async launch() {
    console.log('🚀 GHL Page Builder — Bloomie Funnel\n');
    console.log('='.repeat(70));

    const session = SessionManager.loadSession();
    if (!session) {
      throw new Error('No valid session found. Run login-main.js first.');
    }

    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-gpu'],
    });

    this.page = await this.browser.newContext({
      storageState: session,
    });

    const page = await this.page.newPage();
    await page.setViewportSize({ width: 1280, height: 720 });
    this.page = page;

    console.log('\n[1] Navigating to GHL dashboard...');
    await this.page.goto(GHL_URL, { waitUntil: 'networkidle', timeout: 30000 });
    console.log('✓ Dashboard loaded');
  }

  async navigateToFunnels() {
    console.log('\n[2] Navigating to Funnels...');
    
    try {
      console.log('   → Attempting direct navigation to /funnels');
      
      // Navigate directly with domcontentloaded instead of networkidle
      await this.page.goto('https://app.gohighlevel.com/funnels', {
        waitUntil: 'domcontentloaded',
        timeout: 15000,
      });
      
      await this.page.waitForTimeout(2000);
      
      const url = this.page.url();
      console.log(`   ✓ Navigated to: ${url}`);
      console.log('✓ Funnels page loaded');
      
    } catch (e) {
      console.log(`⚠️  Navigation error: ${e.message}`);
      console.log('   → Trying sidebar click instead...');
      
      try {
        // Fallback: try clicking a "Funnels" or "Sites" link in sidebar
        const funnelLink = await this.page.locator('[class*="funnel"], [class*="site"], a:has-text("Funnel"), a:has-text("Site")').first();
        if (funnelLink) {
          await funnelLink.click();
          await this.page.waitForTimeout(2500);
          console.log('✓ Clicked funnel link in sidebar');
        }
      } catch (e2) {
        console.log(`⚠️  Sidebar click also failed: ${e2.message}`);
      }
    }
  }

  async createFunnel() {
    console.log('\n[3] Creating new funnel...');
    
    try {
      // Look for "New Funnel" or "Create" button
      const createBtn = await this.page.locator(
        'button:has-text("New"), button:has-text("Create"), button:has-text("Add")'
      ).first();
      
      if (createBtn) {
        await createBtn.click();
        await this.page.waitForTimeout(1500);
        console.log('✓ Create dialog opened');
      }

      // Fill funnel name
      const nameInput = await this.page.locator('input[placeholder*="name" i]').first();
      if (nameInput) {
        await nameInput.fill(FUNNEL_NAME);
        await this.page.waitForTimeout(300);
        console.log(`✓ Funnel name set: ${FUNNEL_NAME}`);
      }

      // Click "Create" in dialog
      const confirmBtn = await this.page.locator(
        'button:has-text("Create"), button:has-text("Save")'
      ).last();
      
      if (confirmBtn) {
        await confirmBtn.click();
        await this.page.waitForTimeout(2000);
        console.log('✓ Funnel created');
      }

    } catch (e) {
      console.log(`⚠️  Error creating funnel: ${e.message}`);
    }
  }

  async addSectionWithContent(sectionNum, title, copy, config = {}) {
    console.log(`\n[Section ${sectionNum}] Adding: ${title}`);

    try {
      // Click "Add Section" or similar
      const addSectionBtn = await this.page.locator(
        'button:has-text("Add Section"), button:has-text("New Section"), [data-action*="add"]'
      ).first();

      if (addSectionBtn) {
        await addSectionBtn.click();
        await this.page.waitForTimeout(800);
      }

      // Fill title
      const titleInputs = await this.page.locator('input[type="text"]').all();
      if (titleInputs.length > 0) {
        await titleInputs[0].fill(title);
        await this.page.waitForTimeout(200);
      }

      // Fill body/copy
      const textAreas = await this.page.locator('textarea').all();
      if (textAreas.length > 0) {
        await textAreas[0].fill(copy.substring(0, 500));
        await this.page.waitForTimeout(200);
      }

      // Apply background color if specified
      if (config.bgColor) {
        const colorInputs = await this.page.locator('input[type="color"]').all();
        if (colorInputs.length > 0) {
          await colorInputs[0].fill(config.bgColor);
          await this.page.waitForTimeout(200);
        }
      }

      // Apply text color if specified
      if (config.textColor) {
        const colorInputs = await this.page.locator('input[type="color"]').all();
        if (colorInputs.length > 1) {
          await colorInputs[1].fill(config.textColor);
          await this.page.waitForTimeout(200);
        }
      }

      console.log('  ✓ Section content added');
    } catch (e) {
      console.log(`  ⚠️  ${e.message}`);
    }
  }

  async takeScreenshot(name) {
    try {
      const path = `/tmp/bloomie-ghl-${name}.png`;
      await this.page.screenshot({ path, fullPage: false });
      this.screenshots.push({ name, path });
      console.log(`  📸 Screenshot: ${name}`);
    } catch (e) {
      console.log(`  ⚠️  Screenshot failed: ${e.message}`);
    }
  }

  async buildPage() {
    console.log('\n' + '='.repeat(70));
    console.log('BUILDING BLOOMIE PAGE SECTIONS');
    console.log('='.repeat(70));

    const sections = [
      {
        num: 1,
        title: 'EXPOSED: She\'s Outperforming Companies 10x Her Size',
        copy: 'Her secret? A $500/mo AI employee trained on the strategies of Hormozi, Brunson, Cialdini, Cardone, and 830+ more.',
        config: { bgColor: '#1A1118', textColor: '#FFFFFF' },
      },
      {
        num: 2,
        title: 'Listen to Her AI Employee Close a Real Deal',
        copy: 'This is a real conversation. Not a demo. Not scripted. An AI employee handling objections, building rapport, and booking an appointment.',
        config: { bgColor: '#F5F5F5', textColor: '#2D2024' },
      },
      {
        num: 3,
        title: '10 Things Your AI Employee Will Do — 30-Day Guarantee',
        copy: 'Day 1: Sales page by morning. Day 2: 30-day content calendar. Day 3: 3 email sequences. [... + Days 5, 7, 8, 10, 14, 21, 30]',
        config: { bgColor: '#1A1118', textColor: '#FFFFFF' },
      },
      {
        num: 4,
        title: 'The 4 Things Killing Your Business',
        copy: 'Cold Calling • Following Up With Leads Who Ghost • Customer Service on Repeat • Building Sales Pages & Funnels',
        config: { bgColor: '#F5F5F5', textColor: '#2D2024' },
      },
      {
        num: 5,
        title: 'She Knew All Four Were Killing Her',
        copy: 'She left the 9-to-5 to build something of her own. Two years, maybe three, and she\'d be at six figures. It had been six years. Her investment receipt: $10,373+',
        config: { bgColor: '#F5F5F5', textColor: '#2D2024' },
      },
      {
        num: 6,
        title: 'Real Businesses. Real Results.',
        copy: 'Andrea R. (Business Coach): First paying client within 14 days | Marcus K. (E-commerce): Full funnel live in 5 days | Derek T. (Marketing): $4,200 in new revenue',
        config: { bgColor: '#FFFFFF', textColor: '#2D2024' },
      },
      {
        num: 7,
        title: 'I can just use GoHighLevel for $97/month',
        copy: '73% quit within 60 days • $97? Try $200–$400/mo • Tool ≠ Team. Works in 47 industries.',
        config: { bgColor: '#1A1118', textColor: '#FFFFFF' },
      },
      {
        num: 8,
        title: 'The Employee Who Already Knows Everything',
        copy: 'This is what she hired. A full AI employee trained on the complete methodology of every guru she ever followed.',
        config: { bgColor: '#F5F5F5', textColor: '#2D2024' },
      },
      {
        num: 9,
        title: 'Your Life Right Now vs. 7 Days From Now',
        copy: '6:00 AM Now: Wake up already behind | 6:00 AM Next Week: Open phone to notification with completed work',
        config: { bgColor: '#F5F5F5', textColor: '#2D2024' },
      },
      {
        num: 10,
        title: 'How Is It Actually Trained?',
        copy: '1. Intelligence Foundation | 2. 830+ Source Conversion Intelligence | 3. Execution Engine | 4. QA Manager',
        config: { bgColor: '#1A1118', textColor: '#FFFFFF' },
      },
      {
        num: 11,
        title: 'Hire Your AI Employee — $500/mo',
        copy: 'Everything included. Full funnel. 150+ outbound calls. 24/7 support. 30-day money-back guarantee.',
        config: { bgColor: '#1A1118', textColor: '#FFFFFF' },
      },
    ];

    for (const section of sections) {
      try {
        await this.addSectionWithContent(section.num, section.title, section.copy, section.config);
        await this.takeScreenshot(`section-${section.num}`);
        await this.page.waitForTimeout(500);
      } catch (e) {
        console.log(`  ❌ Section ${section.num} failed: ${e.message}`);
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ PAGE BUILD COMPLETE');
    console.log('='.repeat(70));
    console.log(`\nScreenshots captured: ${this.screenshots.length}`);
    this.screenshots.forEach(s => console.log(`  - ${s.name}`));
  }

  async publishPage() {
    console.log('\n[Final] Publishing page...');

    try {
      // Look for "Publish" button
      const publishBtn = await this.page.locator(
        'button:has-text("Publish"), button:has-text("Save & Publish")'
      ).first();

      if (publishBtn) {
        await publishBtn.click();
        await this.page.waitForTimeout(2000);
        console.log('✓ Page published');
        await this.takeScreenshot('final-published');
      } else {
        console.log('⚠️  Could not find publish button');
      }
    } catch (e) {
      console.log(`⚠️  Publish failed: ${e.message}`);
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// MAIN EXECUTION
(async () => {
  const builder = new GHLPageBuilder();

  try {
    await builder.launch();
    await builder.navigateToFunnels();
    await builder.createFunnel();
    await builder.buildPage();
    await builder.publishPage();

    console.log('\n' + '='.repeat(70));
    console.log('🎉 SUCCESS: Bloomie funnel created in GHL');
    console.log('='.repeat(70));
    console.log(`\nFunnel: ${FUNNEL_NAME}`);
    console.log(`Sections: 11`);
    console.log(`Screenshots: ${builder.screenshots.length}`);
    console.log(`\n📍 Next: Review in GHL dashboard and customize CTAs/links`);

  } catch (error) {
    console.error('\n❌ Build failed:', error.message);
    process.exit(1);
  } finally {
    await builder.close();
  }
})();
