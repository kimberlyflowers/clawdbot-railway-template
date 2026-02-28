---
name: skool-community-scraper
description: Extract member contacts from Skool communities. Get member names, emails, profile URLs, join dates, and engagement metrics. Works with both public communities (web scraping) and via Skool API (if authenticated).
---

# Skool Community Scraper

**What It Does:** Extract all member contacts from a Skool community. Names, emails, profiles, join dates.

## Setup

### Via Skool API (Recommended)
- Get API key from https://skoolapi.com/dashboard
- Set env var: `SKOOL_API_KEY=your_key`
- Authenticate to your Skool account

### Via Web Scraping (Public Communities)
- No API key needed
- Works on any public Skool community URL
- Extracts visible member data

## Core Functions

### `getMembers(communityUrl, options)`
Extract all members from a community.

**Input:**
```javascript
{
  url: "https://www.skool.com/my-community",
  includeEmails: true,
  includeProfiles: true,
  limit: null  // null = all
}
```

**Output:**
```javascript
{
  community: "My Community",
  totalMembers: 1234,
  members: [
    {
      name: "Sarah Rodriguez",
      email: "sarah@email.com",
      profileUrl: "https://www.skool.com/profile/sarah-rodriguez",
      joinDate: "2023-11-15",
      role: "member",
      engagement: "high"
    }
  ],
  scrapedAt: "2026-02-19T09:37:00Z"
}
```

## Use Cases

- **Lead generation** — Extract qualified contacts from relevant communities
- **Community research** — Analyze member composition and growth
- **Integration** — Feed member data into CRM (HubSpot, Salesforce, GHL)
- **Competitor analysis** — See who's in competitor communities

## Authentication

**Via API:**
```bash
export SKOOL_API_KEY=sk_live_xxxxx
```

**Via Session (for private communities):**
Requires Skool login credentials or active browser session.

## Rate Limits

- API: 100 requests/minute
- Web scraping: 1 request/5 seconds (respectful)

## Notes

- Email extraction only works if members have made profiles public
- Role data shows: member, moderator, admin
- Engagement based on posts, comments, reactions in last 30 days

**Agency equivalent value: $1,400**
