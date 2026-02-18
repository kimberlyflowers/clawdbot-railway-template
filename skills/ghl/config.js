/**
 * bloomie-ghl Configuration
 * Loads GHL API credentials and shared HTTP client
 */
const fs = require('fs');
const axios = require('axios');

const token = fs.readFileSync('/data/secrets/ghl-token.txt', 'utf-8').trim();
if (!token) throw new Error('GHL token is empty');

const locationId = 'iGy4nrpDVU0W1jAvseL3';
const baseUrl = 'https://services.leadconnectorhq.com';

const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
  'Version': '2021-07-28',
  'Accept': 'application/json'
};

const client = axios.create({
  baseURL: baseUrl,
  timeout: 15000,
  headers
});

module.exports = { token, locationId, baseUrl, headers, client };
