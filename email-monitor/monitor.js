#!/usr/bin/env node

const Imap = require('imap');
const { simpleParser } = require('mailparser');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Load config
const config = require('./config.json');

// Load credentials from files
config.gmail.appPassword = fs.readFileSync(config.gmail.appPasswordFile, 'utf8').trim();
config.yahoo.appPassword = fs.readFileSync(config.yahoo.appPasswordFile, 'utf8').trim();
config.ghlToken = fs.readFileSync(config.ghlTokenFile, 'utf8').trim();

// Pending emails needing approval
const PENDING_FILE = './pending-emails.json';
const PROCESSED_FILE = './processed-emails.json';

function log(msg) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${msg}`);
}

function loadPending() {
  try {
    return JSON.parse(fs.readFileSync(PENDING_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function savePending(pending) {
  fs.writeFileSync(PENDING_FILE, JSON.stringify(pending, null, 2));
}

function loadProcessed() {
  try {
    return new Set(JSON.parse(fs.readFileSync(PROCESSED_FILE, 'utf8')));
  } catch {
    return new Set();
  }
}

function saveProcessed(processed) {
  fs.writeFileSync(PROCESSED_FILE, JSON.stringify([...processed]));
}

// Send SMS via GHL
async function sendSMS(message) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      message: message,
      phoneNumber: config.phoneNumber,
      type: 'SMS'
    });

    const options = {
      hostname: 'api.gohighlevel.com',
      port: 443,
      path: `/v1/conversations/messages`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.ghlToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(body));
          } catch {
            resolve({ ok: true });
          }
        } else {
          reject(new Error(`GHL API error: ${res.statusCode}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Check IMAP account for new emails
async function checkAccount(accountConfig, accountName) {
  return new Promise((resolve) => {
    const imapConfig = {
      user: accountConfig.email,
      password: accountConfig.appPassword,
      host: accountConfig.imap.host,
      port: accountConfig.imap.port,
      tls: accountConfig.imap.secure,
      tlsOptions: { rejectUnauthorized: false }
    };

    const imap = new Imap(imapConfig);
    const newEmails = [];
    const processed = loadProcessed();
    let resolved = false;

    imap.on('ready', function() {
      imap.openBox('INBOX', false, function(err, box) {
        if (err) {
          log(`Error opening inbox for ${accountName}: ${err.message}`);
          imap.end();
          if (!resolved) {
            resolved = true;
            return resolve([]);
          }
        }

        // Search for recent unseen emails (limit to last 100)
        imap.search(['RECENT', 'UNSEEN'], function(err, results) {
          if (err) {
            log(`Search error for ${accountName}: ${err.message}`);
            imap.end();
            if (!resolved) {
              resolved = true;
              return resolve([]);
            }
          }

          if (!results || results.length === 0) {
            log(`No recent unseen emails in ${accountName}`);
            imap.end();
            if (!resolved) {
              resolved = true;
              return resolve([]);
            }
          }

          // Limit to last 50 to avoid overwhelming fetch
          const toFetch = results.slice(-50);
          log(`Found ${results.length} recent unseen email(s) in ${accountName}, fetching last ${toFetch.length}`);

          const f = imap.fetch(toFetch, { bodies: '' });
          let processedCount = 0;

          f.on('message', function(msg, seqno) {
            // Wrap msg in readable stream format for simpleParser
            simpleParser(msg, async (err, parsed) => {
              processedCount++;
              
              if (err) {
                log(`Parse error for message ${seqno}: ${err.message}`);
                checkDone();
                return;
              }

              try {
                const emailId = `${parsed.messageId || seqno}-${accountName}`;

                // Skip if already processed
                if (processed.has(emailId)) {
                  checkDone();
                  return;
                }

                // Check if from watchlist
                const fromEmail = parsed.from?.text || '';
                const isWatched = config.watchSenders.some(sender => 
                  fromEmail.toLowerCase().includes(sender.toLowerCase())
                );

                if (isWatched) {
                  newEmails.push({
                    id: emailId,
                    account: accountName,
                    accountEmail: accountConfig.email,
                    from: parsed.from?.text || '',
                    subject: parsed.subject || '(no subject)',
                    text: (parsed.text || parsed.html || '(no body)').substring(0, 500),
                    timestamp: new Date().toISOString()
                  });

                  log(`✓ Important email from ${fromEmail} in ${accountName}: "${parsed.subject}"`);
                }

                processed.add(emailId);
                checkDone();
              } catch (e) {
                log(`Error processing email: ${e.message}`);
                checkDone();
              }
            }).catch(e => {
              log(`Parser catch error: ${e.message}`);
              processedCount++;
              checkDone();
            });
          });

          function checkDone() {
            if (processedCount >= toFetch.length) {
              saveProcessed(processed);
              imap.end();
              if (!resolved) {
                resolved = true;
                resolve(newEmails);
              }
            }
          }

          f.on('error', function(err) {
            log(`Fetch error: ${err.message}`);
            imap.end();
            if (!resolved) {
              resolved = true;
              resolve([]);
            }
          });
        });
      });
    });

    imap.on('error', function(err) {
      log(`IMAP error for ${accountName}: ${err.message}`);
      if (!resolved) {
        resolved = true;
        resolve([]);
      }
    });

    imap.on('end', function() {
      if (!resolved) {
        resolved = true;
        resolve(newEmails);
      }
    });

    imap.connect();
  });
}

// Main loop
async function monitorEmails() {
  try {
    log('=== Email check cycle starting ===');
    
    const gmailEmails = await checkAccount(config.gmail, 'Gmail');
    const yahooEmails = await checkAccount(config.yahoo, 'Yahoo');
    const allNewEmails = [...gmailEmails, ...yahooEmails];

    if (allNewEmails.length > 0) {
      const pending = loadPending();

      for (const email of allNewEmails) {
        const draftResponse = `Hi,\n\nThank you for your email. I've received it and will respond shortly.\n\nBest regards`;

        pending[email.id] = {
          ...email,
          draftResponse: draftResponse,
          approvalRequested: new Date().toISOString()
        };

        try {
          const alertMsg = `📧 New important email\nFrom: ${email.from}\nSubject: ${email.subject}\n\nWaiting for approval to respond.`;
          await sendSMS(alertMsg);
          log(`✓ SMS alert sent for: ${email.subject}`);
        } catch (err) {
          log(`⚠ Error sending SMS: ${err.message}`);
        }
      }

      savePending(pending);
      log(`✓ ${allNewEmails.length} email(s) flagged for approval`);
    } else {
      log('No new important emails');
    }

    log(`=== Next check in ${config.checkIntervalSeconds}s ===\n`);
  } catch (err) {
    log(`✗ Monitor error: ${err.message}`);
  }

  setTimeout(monitorEmails, config.checkIntervalSeconds * 1000);
}

// Start
log('Email monitor starting...');
log(`Watching Gmail: ${config.gmail.email}`);
log(`Watching Yahoo: ${config.yahoo.email}`);
log(`Alert phone: ${config.phoneNumber}`);
log('---\n');

monitorEmails().catch(err => {
  log(`Fatal error: ${err.message}`);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  log('Shutting down...');
  process.exit(0);
});
