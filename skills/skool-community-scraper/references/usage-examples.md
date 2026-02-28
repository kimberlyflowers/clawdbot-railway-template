# Skool Community Scraper — Usage Examples

## Basic Usage

### Get all members from a community

```javascript
const SkoolScraper = require('./scripts/skool-scraper.js');

const scraper = new SkoolScraper({
  apiKey: process.env.SKOOL_API_KEY
});

const members = await scraper.getMembers('https://www.skool.com/my-community', {
  includeEmails: true,
  includeProfiles: true
});

console.log(`Found ${members.members.length} members`);
console.log(members.members[0]);
// Output:
// {
//   name: 'Sarah Rodriguez',
//   email: 'sarah@example.com',
//   profileUrl: 'https://www.skool.com/profile/sarah-rodriguez',
//   joinDate: '2023-11-15',
//   role: 'member',
//   engagement: 'high'
// }
```

## Export to CSV

```javascript
const members = await scraper.getMembers(communityUrl);
const csv = await scraper.exportToCSV(members.members);

// Save to file
const fs = require('fs');
fs.writeFileSync('members.csv', csv);
```

## Real-World Use Cases

### 1. Lead Generation from Relevant Communities

```javascript
// Find all members in AI community
const aiCommunity = await scraper.getMembers('https://www.skool.com/ai-mastery');

// Filter high-engagement members (likely buyers)
const highEngagement = aiCommunity.members.filter(m => m.engagement === 'high');

// Export to CRM
const crmData = highEngagement.map(m => ({
  firstName: m.name.split(' ')[0],
  lastName: m.name.split(' ')[1],
  email: m.email,
  source: 'skool-community',
  tag: 'ai-enthusiast'
}));

// Send to Zapier/Make for CRM import
```

### 2. Competitor Community Analysis

```javascript
// Track members in competitor's community
const competitorMembers = await scraper.getMembers('https://www.skool.com/competitor-community');

console.log(`Competitor community: ${competitorMembers.totalMembers} members`);
console.log(`Top engagers:`);

const topEngagers = competitorMembers.members
  .filter(m => m.engagement === 'high')
  .slice(0, 10);

topEngagers.forEach(m => console.log(`${m.name} (${m.engagement})`));
```

### 3. Integration with GHL (GoHighLevel)

```javascript
const ghl = require('/data/workspace/ghl');

const members = await scraper.getMembers(communityUrl);

// Add each member to GHL
for (const member of members.members) {
  await ghl.contacts.createContact({
    firstName: member.name.split(' ')[0],
    lastName: member.name.split(' ')[1] || '',
    email: member.email,
    customFields: {
      skool_profile: member.profileUrl,
      skool_joined: member.joinDate,
      engagement_level: member.engagement
    }
  });
}

console.log(`Added ${members.members.length} contacts to GHL`);
```

### 4. Build a Community Growth Dashboard

```javascript
// Scrape monthly to track growth
const month1 = await scraper.getMembers(communityUrl);
// ... wait a month ...
const month2 = await scraper.getMembers(communityUrl);

const monthlyGrowth = month2.totalMembers - month1.totalMembers;
const growthRate = ((monthlyGrowth / month1.totalMembers) * 100).toFixed(1);

console.log(`Growth: +${monthlyGrowth} members (${growthRate}%)`);
console.log(`New high-engagement members: ${month2.members.filter(m => m.engagement === 'high').length}`);
```

## Authentication Options

### Option 1: API Key (Recommended)

```bash
# Set environment variable
export SKOOL_API_KEY=sk_live_xxxxx

# Use in code
const scraper = new SkoolScraper();  // Uses env var
```

### Option 2: Browser Automation (for private communities)

```javascript
// Requires Playwright (not yet implemented in basic version)
const scraper = new SkoolScraper({
  browserSession: browserInstance
});
```

## Rate Limits & Best Practices

- **API:** 100 requests/minute
- **Web scraping:** 1 request/5 seconds
- **Batch operations:** Spread over multiple hours to avoid blocks
- **Cache results:** Don't scrape same community multiple times daily

## Troubleshooting

### "Invalid Skool community URL"
Make sure URL format is: `https://www.skool.com/community-name`

### "API error: 401"
Your API key is invalid or expired. Generate a new one at https://skoolapi.com/dashboard

### "No email data"
Member profiles must be public. Private profiles won't show email addresses.

### "Engagement data missing"
Requires API access. Web scraping provides limited engagement data.
