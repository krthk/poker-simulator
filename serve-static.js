const express = require('express');
const path = require('path');
const app = express();
const port = 8080;

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle React Router routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Static server running at http://localhost:${port}`);
});
