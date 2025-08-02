const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

const poemsDir = path.join(__dirname, 'poems');
if (!fs.existsSync(poemsDir)) fs.mkdirSync(poemsDir);

// --- Logging Middleware ---
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// --- Static files ---
app.use(express.static('public'));

// --- Body parsers ---
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// --- Multer setup for file uploads ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, poemsDir),
  filename: (req, file, cb) => {
    const name = Date.now() + '-' + file.originalname;
    cb(null, name);
  }
});
const upload = multer({ storage });

// --- Routes ---

// Test route
app.get('/hello', (req, res) => {
  console.log("👋 /hello route was called!");
  res.send("Hey there, poetry lover!");
});

// Upload poem as text
app.post('/upload-text', (req, res) => {
  const { poemText } = req.body;
  if (!poemText || poemText.trim() === '') {
    return res.status(400).json({ message: 'Empty poem not allowed!' });
  }
  const filename = Date.now() + '.txt';
  fs.writeFile(path.join(poemsDir, filename), poemText.trim(), (err) => {
    if (err) {
      console.error('Error saving poem:', err);
      return res.status(500).send('Error saving poem.');
    }
    res.json({ message: 'Poem saved!' });
  });
});

// Upload poem as file
app.post('/upload-file', upload.single('poemFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded!' });
  }
  res.json({ message: `Poem uploaded as ${req.file.filename}!` });
});

// List poems with pagination
app.get('/poems', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = 10;

  fs.readdir(poemsDir, (err, files) => {
    if (err) {
      console.error('Error reading poems directory:', err);
      return res.status(500).send('Error reading poems.');
    }
    // Sort newest first
    const poems = files.sort().reverse();
    const start = (page - 1) * perPage;
    const pagePoems = poems.slice(start, start + perPage);
    res.json({ poems: pagePoems });
  });
});

// Get single poem content
app.get('/poem/:filename', (req, res) => {
  const filepath = path.join(poemsDir, req.params.filename);

  // Basic security check to prevent path traversal
  if (path.dirname(filepath) !== poemsDir) {
    return res.status(400).send('Invalid filename.');
  }

  fs.readFile(filepath, 'utf-8', (err, data) => {
    if (err) {
      console.error('Error reading poem:', err);
      return res.status(404).send('Poem not found.');
    }
    res.send(data);
  });
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
