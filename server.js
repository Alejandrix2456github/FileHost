const express = require('express');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const multer = require('multer');

const app = express();
const PORT = 3000;

// Configure paths
const viewsPath = path.join(__dirname, 'views');
const publicPath = path.join(__dirname, 'public');
const uploadsPath = path.join(__dirname, 'uploads');
const usersDBPath = path.join(__dirname, 'users.json');

// Create directories if they don't exist
[viewsPath, publicPath, uploadsPath].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Initialize users database
if (!fs.existsSync(usersDBPath)) {
  const defaultAdmin = {
    id: 1,
    username: 'admin',
    password: bcrypt.hashSync('admin123', 10)
  };
  fs.writeFileSync(usersDBPath, JSON.stringify([defaultAdmin], null, 2));
  console.log('Created users database with default admin: admin/admin123');
}

// Configure file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicPath));
app.use('/uploads', express.static(uploadsPath));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Configure view engine
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);
app.set('views', viewsPath);

// Helper functions
function getUsers() {
  try {
    return JSON.parse(fs.readFileSync(usersDBPath));
  } catch (err) {
    console.error('Error reading users database:', err);
    return [];
  }
}

function saveUsers(users) {
  fs.writeFileSync(usersDBPath, JSON.stringify(users, null, 2));
}

function getFiles() {
  try {
    return fs.readdirSync(uploadsPath);
  } catch (err) {
    console.error('Error reading uploads directory:', err);
    return [];
  }
}

// Authentication middleware
function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login?error=Please login first');
  }
  next();
}

// Routes
app.get('/', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  res.render('index.html');
});

app.get('/login', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  res.render('login.html', { error: req.query.error });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const users = getUsers();
  const user = users.find(u => u.username === username);
  
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.redirect('/login?error=Invalid username or password');
  }
  
  req.session.userId = user.id;
  req.session.username = user.username;
  res.redirect('/dashboard');
});

app.get('/register', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  res.render('register.html', { error: req.query.error });
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const users = getUsers();
  
  if (users.some(u => u.username === username)) {
    return res.redirect('/register?error=Username already exists');
  }
  
  const newUser = {
    id: users.length + 1,
    username,
    password: bcrypt.hashSync(password, 10)
  };
  
  users.push(newUser);
  saveUsers(users);
  
  req.session.userId = newUser.id;
  req.session.username = newUser.username;
  res.redirect('/dashboard');
});

app.get('/dashboard', requireLogin, (req, res) => {
  res.render('dashboard.html', { username: req.session.username });
});

app.get('/files', requireLogin, (req, res) => {
  const files = getFiles();
  res.render('files.html', { 
    username: req.session.username,
    files: files.map(file => ({
      name: file,
      url: `/uploads/${file}`
    })),
    error: req.query.error,
    success: req.query.success
  });
});

app.post('/upload', requireLogin, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.redirect('/files?error=No file selected');
  }
  res.redirect('/files?success=File uploaded successfully');
});

app.post('/delete/:filename', requireLogin, (req, res) => {
  const filePath = path.join(uploadsPath, req.params.filename);
  
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Error deleting file:', err);
      return res.redirect('/files?error=Failed to delete file');
    }
    res.redirect('/files?success=File deleted successfully');
  });
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('File upload system is ready');
  console.log('Default admin account: admin/admin123');
});