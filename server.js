const express = require('express');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const session = require('express-session');

const app = express();
const PORT = 3000;

// Configure paths
const viewsPath = path.join(__dirname, 'views');
const publicPath = path.join(__dirname, 'public');
const usersDBPath = path.join(__dirname, 'users.json');

// Create directories and files if they don't exist
[viewsPath, publicPath].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Initialize users database
if (!fs.existsSync(usersDBPath)) {
  fs.writeFileSync(usersDBPath, JSON.stringify([{
    id: 1,
    username: 'admin',
    password: bcrypt.hashSync('admin123', 10)
  }], null, 2));
}

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicPath));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// HTML templates
const templates = {
  'index.html': `<!DOCTYPE html>
<html>
<head>
  <title>File Host</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
    <div class="container">
      <a class="navbar-brand" href="/">FileHost</a>
      <div>
        <a class="btn btn-light me-2" href="/login"><i class="fas fa-sign-in-alt"></i> Login</a>
        <a class="btn btn-outline-light" href="/register"><i class="fas fa-user-plus"></i> Register</a>
      </div>
    </div>
  </nav>
  <div class="container mt-5">
    <h1>Welcome to File Host</h1>
    <p>A simple local file hosting solution</p>
  </div>
</body>
</html>`,

  'login.html': `<!DOCTYPE html>
<html>
<head>
  <title>Login</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
  <nav class="navbar navbar-dark bg-primary">
    <div class="container">
      <a class="navbar-brand" href="/">FileHost</a>
      <a class="btn btn-outline-light" href="/register">Register</a>
    </div>
  </nav>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card shadow">
          <div class="card-header bg-primary text-white">
            <h4><i class="fas fa-sign-in-alt"></i> Login</h4>
          </div>
          <div class="card-body">
            <form action="/login" method="POST">
              <div class="mb-3">
                <label class="form-label">Username</label>
                <div class="input-group">
                  <span class="input-group-text"><i class="fas fa-user"></i></span>
                  <input type="text" class="form-control" name="username" required>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Password</label>
                <div class="input-group">
                  <span class="input-group-text"><i class="fas fa-lock"></i></span>
                  <input type="password" class="form-control" name="password" required>
                </div>
              </div>
              <button type="submit" class="btn btn-primary w-100">
                <i class="fas fa-sign-in-alt"></i> Login
              </button>
            </form>
          </div>
          <div class="card-footer text-center">
            <p class="mb-0">Don't have an account? <a href="/register">Register here</a></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`,

  'register.html': `<!DOCTYPE html>
<html>
<head>
  <title>Register</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
  <nav class="navbar navbar-dark bg-primary">
    <div class="container">
      <a class="navbar-brand" href="/">FileHost</a>
      <a class="btn btn-outline-light" href="/login">Login</a>
    </div>
  </nav>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card shadow">
          <div class="card-header bg-primary text-white">
            <h4><i class="fas fa-user-plus"></i> Register</h4>
          </div>
          <div class="card-body">
            <form action="/register" method="POST">
              <div class="mb-3">
                <label class="form-label">Username</label>
                <div class="input-group">
                  <span class="input-group-text"><i class="fas fa-user"></i></span>
                  <input type="text" class="form-control" name="username" required>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Password</label>
                <div class="input-group">
                  <span class="input-group-text"><i class="fas fa-lock"></i></span>
                  <input type="password" class="form-control" name="password" required>
                </div>
              </div>
              <button type="submit" class="btn btn-primary w-100">
                <i class="fas fa-user-plus"></i> Register
              </button>
            </form>
          </div>
          <div class="card-footer text-center">
            <p class="mb-0">Already have an account? <a href="/login">Login here</a></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`,

  'dashboard.html': `<!DOCTYPE html>
<html>
<head>
  <title>Dashboard</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
    <div class="container">
      <a class="navbar-brand" href="/">FileHost</a>
      <div class="navbar-nav">
        <a class="nav-link active" href="/dashboard"><i class="fas fa-tachometer-alt"></i> Dashboard</a>
        <a class="nav-link" href="/files"><i class="fas fa-file"></i> Files</a>
        <a class="nav-link" href="/logout"><i class="fas fa-sign-out-alt"></i> Logout</a>
      </div>
    </div>
  </nav>
  <div class="container mt-5">
    <h1><i class="fas fa-tachometer-alt"></i> Dashboard</h1>
    <div class="card mt-4">
      <div class="card-body">
        <h5>Welcome to your Dashboard</h5>
        <p>You can manage your files from here.</p>
        <a href="/files" class="btn btn-primary"><i class="fas fa-file"></i> Go to Files</a>
      </div>
    </div>
  </div>
</body>
</html>`,

  'files.html': `<!DOCTYPE html>
<html>
<head>
  <title>Files</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
    <div class="container">
      <a class="navbar-brand" href="/">FileHost</a>
      <div class="navbar-nav">
        <a class="nav-link" href="/dashboard"><i class="fas fa-tachometer-alt"></i> Dashboard</a>
        <a class="nav-link active" href="/files"><i class="fas fa-file"></i> Files</a>
        <a class="nav-link" href="/logout"><i class="fas fa-sign-out-alt"></i> Logout</a>
      </div>
    </div>
  </nav>
  <div class="container mt-5">
    <h1><i class="fas fa-file"></i> File Management</h1>
    <div class="card mt-4">
      <div class="card-body">
        <h5>Your Files</h5>
        <p>File list will appear here.</p>
        <button class="btn btn-primary"><i class="fas fa-upload"></i> Upload File</button>
      </div>
    </div>
  </div>
</body>
</html>`
};

// Create HTML files if they don't exist
Object.entries(templates).forEach(([file, content]) => {
  const filePath = path.join(viewsPath, file);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    console.log(`Created ${file}`);
  }
});

// Helper functions
function getUsers() {
  return JSON.parse(fs.readFileSync(usersDBPath));
}

function saveUsers(users) {
  fs.writeFileSync(usersDBPath, JSON.stringify(users, null, 2));
}

// Routes
app.get('/', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  res.sendFile(path.join(viewsPath, 'index.html'));
});

app.get('/login', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  res.sendFile(path.join(viewsPath, 'login.html'));
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const users = getUsers();
  const user = users.find(u => u.username === username);
  
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.redirect('/login?error=Invalid credentials');
  }
  
  req.session.userId = user.id;
  req.session.username = user.username;
  res.redirect('/dashboard');
});

app.get('/register', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  res.sendFile(path.join(viewsPath, 'register.html'));
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

app.get('/dashboard', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(viewsPath, 'dashboard.html'));
});

app.get('/files', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(viewsPath, 'files.html'));
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Registration system is ready');
  console.log('Default admin account: admin/admin123');
});