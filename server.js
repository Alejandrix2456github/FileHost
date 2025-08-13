const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Configure paths
const viewsPath = path.join(__dirname, 'views');
const publicPath = path.join(__dirname, 'public');

// Create views directory if it doesn't exist
if (!fs.existsSync(viewsPath)) {
  fs.mkdirSync(viewsPath);
}

// Create essential HTML files if they don't exist
const htmlFiles = {
  'index.html': `<!DOCTYPE html><html><head>
    <title>Home</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  </head><body>
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <a class="navbar-brand" href="/">FileHost</a>
        <a class="nav-link text-white" href="/login">Login</a>
      </div>
    </nav>
    <div class="container mt-5">
      <h1>Welcome to Local File Host</h1>
      <a href="/login" class="btn btn-primary">Login to Continue</a>
    </div>
  </body></html>`,
  
  'login.html': `<!DOCTYPE html><html><head>
    <title>Login</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  </head><body>
    <nav class="navbar navbar-dark bg-primary">
      <div class="container">
        <a class="navbar-brand" href="/">FileHost</a>
      </div>
    </nav>
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header bg-primary text-white">
              <h4>Login</h4>
            </div>
            <div class="card-body">
              <form>
                <div class="mb-3">
                  <label class="form-label">Username</label>
                  <input type="text" class="form-control" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Password</label>
                  <input type="password" class="form-control" required>
                </div>
                <button type="submit" class="btn btn-primary w-100">Login</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </body></html>`,
  
  'dashboard.html': `<!DOCTYPE html><html><head>
    <title>Dashboard</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  </head><body>
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <a class="navbar-brand" href="/">FileHost</a>
        <div class="navbar-nav">
          <a class="nav-link" href="/dashboard">Dashboard</a>
          <a class="nav-link" href="/files">Files</a>
          <a class="nav-link" href="/logout">Logout</a>
        </div>
      </div>
    </nav>
    <div class="container mt-5">
      <h1>Dashboard</h1>
      <div class="card mt-4">
        <div class="card-body">
          <h5>Welcome to your Dashboard</h5>
          <p>Upload and manage your files here.</p>
          <a href="/files" class="btn btn-primary">View Files</a>
        </div>
      </div>
    </div>
  </body></html>`,
  
  'files.html': `<!DOCTYPE html><html><head>
    <title>My Files</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  </head><body>
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <a class="navbar-brand" href="/">FileHost</a>
        <div class="navbar-nav">
          <a class="nav-link" href="/dashboard">Dashboard</a>
          <a class="nav-link active" href="/files">Files</a>
          <a class="nav-link" href="/logout">Logout</a>
        </div>
      </div>
    </nav>
    <div class="container mt-5">
      <h1>My Files</h1>
      <div class="card mt-4">
        <div class="card-body">
          <p>Your files will appear here.</p>
          <button class="btn btn-primary">Upload File</button>
        </div>
      </div>
    </div>
  </body></html>`
};

// Create files if they don't exist
Object.entries(htmlFiles).forEach(([fileName, content]) => {
  const filePath = path.join(viewsPath, fileName);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    console.log(`Created ${fileName}`);
  }
});

// Middleware
app.use(express.static(publicPath));

// Routes
app.get('/', (req, res) => res.sendFile(path.join(viewsPath, 'index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(viewsPath, 'login.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(viewsPath, 'dashboard.html')));
app.get('/files', (req, res) => res.sendFile(path.join(viewsPath, 'files.html')));

// Error handling
app.use((req, res) => {
  res.status(404).sendFile(path.join(viewsPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Available routes:');
  console.log('- / (Home)');
  console.log('- /login');
  console.log('- /dashboard');
  console.log('- /files');
});