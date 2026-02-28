const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function generateReport() {
  try {
    await client.connect();
    
    // Query both tables
    const bloomResult = await client.query(
      'SELECT title, category, created_at, content FROM bloom_kb ORDER BY id'
    );
    
    const jadenResult = await client.query(
      'SELECT title, category, created_at, content FROM jaden_kb ORDER BY id'
    );
    
    await client.end();
    
    // Build HTML
    const timestamp = new Date().toISOString();
    
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KB Status Report - ${timestamp.split('T')[0]}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 20px;
      background: #f5f5f5;
      color: #333;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 28px;
    }
    .timestamp {
      opacity: 0.9;
      font-size: 14px;
    }
    .section {
      margin-bottom: 40px;
    }
    .section-title {
      font-size: 20px;
      font-weight: bold;
      color: #667eea;
      border-bottom: 2px solid #667eea;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      border-radius: 8px;
      overflow: hidden;
    }
    th {
      background: #667eea;
      color: white;
      padding: 15px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #667eea;
    }
    td {
      padding: 12px 15px;
      border-bottom: 1px solid #e0e0e0;
    }
    tr:hover {
      background: #f9f9f9;
    }
    tr:last-child td {
      border-bottom: none;
    }
    .category {
      display: inline-block;
      background: #e3f2fd;
      color: #1976d2;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
    }
    .category.starter-brain {
      background: #fff3e0;
      color: #f57c00;
    }
    .category.ghl {
      background: #f3e5f5;
      color: #7b1fa2;
    }
    .category.monitoring {
      background: #e8f5e9;
      color: #388e3c;
    }
    .category.drive {
      background: #fce4ec;
      color: #c2185b;
    }
    .category.onboarding {
      background: #e0f2f1;
      color: #00796b;
    }
    .category.architecture {
      background: #ede7f6;
      color: #512da8;
    }
    .content-preview {
      color: #666;
      font-size: 13px;
      line-height: 1.4;
      font-family: 'Courier New', monospace;
      background: #fafafa;
      padding: 8px;
      border-radius: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: pre-wrap;
      word-wrap: break-word;
      max-height: 100px;
    }
    .date {
      color: #999;
      font-size: 12px;
    }
    .summary {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .summary h3 {
      margin-top: 0;
      color: #667eea;
    }
    .stat {
      display: inline-block;
      margin-right: 30px;
      font-size: 14px;
    }
    .stat strong {
      font-size: 18px;
      color: #667eea;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📚 KB Status Report</h1>
    <div class="timestamp">Generated: ${timestamp}</div>
  </div>
  
  <div class="summary">
    <h3>📊 Summary</h3>
    <div class="stat">
      <strong>${bloomResult.rows.length}</strong> bloom_kb entries
    </div>
    <div class="stat">
      <strong>${jadenResult.rows.length}</strong> jaden_kb entries
    </div>
    <div class="stat">
      <strong>${bloomResult.rows.length + jadenResult.rows.length}</strong> total
    </div>
  </div>
`;

    // BLOOM_KB section
    html += `
  <div class="section">
    <div class="section-title">🌸 BLOOM_KB - Shared Foundation</div>
    <table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Category</th>
          <th>Created</th>
          <th>Preview (200 chars)</th>
        </tr>
      </thead>
      <tbody>
`;

    bloomResult.rows.forEach(row => {
      const preview = row.content.substring(0, 200).replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const created = new Date(row.created_at).toLocaleDateString();
      const categoryClass = row.category.toLowerCase().replace(/_/g, '-');
      
      html += `
        <tr>
          <td><strong>${row.title}</strong></td>
          <td><span class="category ${categoryClass}">${row.category}</span></td>
          <td><span class="date">${created}</span></td>
          <td><div class="content-preview">${preview}...</div></td>
        </tr>
`;
    });

    html += `
      </tbody>
    </table>
  </div>
`;

    // JADEN_KB section
    html += `
  <div class="section">
    <div class="section-title">💾 JADEN_KB - Personal Knowledge Base</div>
    <table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Category</th>
          <th>Created</th>
          <th>Preview (200 chars)</th>
        </tr>
      </thead>
      <tbody>
`;

    jadenResult.rows.forEach(row => {
      const preview = row.content.substring(0, 200).replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const created = new Date(row.created_at).toLocaleDateString();
      const categoryClass = row.category.toLowerCase().replace(/_/g, '-');
      
      html += `
        <tr>
          <td><strong>${row.title}</strong></td>
          <td><span class="category ${categoryClass}">${row.category}</span></td>
          <td><span class="date">${created}</span></td>
          <td><div class="content-preview">${preview}...</div></td>
        </tr>
`;
    });

    html += `
      </tbody>
    </table>
  </div>

  <div class="summary" style="margin-top: 40px; text-align: center; color: #999; font-size: 12px;">
    <p>Report generated by Jaden | Bloomie AI Assistant | ${timestamp}</p>
  </div>

</body>
</html>
`;

    // Save to file
    const reportPath = '/data/workspace/KB-STATUS-REPORT.html';
    fs.writeFileSync(reportPath, html);
    
    console.log('✓ HTML report generated:', reportPath);
    console.log('  - bloom_kb entries:', bloomResult.rows.length);
    console.log('  - jaden_kb entries:', jadenResult.rows.length);
    
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

generateReport();
