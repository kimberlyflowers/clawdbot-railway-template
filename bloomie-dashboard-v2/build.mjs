import fs from 'fs';
import { readFileSync } from 'fs';

// Read the component code
const appCode = readFileSync('./src/App.jsx', 'utf8');

// Create an HTML file with the React app bundled
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bloomie Dashboard</title>
  <script crossorigin src="https://unpkg.com/react@19/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@19/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
  <div id="root"></div>
  
  <script type="text/babel">
    const { useState, useEffect, useRef } = React;
    
${appCode.replace('export default', 'const App =')}
    
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);
  </script>
</body>
</html>`;

// Write the HTML
fs.mkdirSync('./dist', { recursive: true });
fs.writeFileSync('./dist/index.html', html);
console.log('✅ Built dist/index.html');
