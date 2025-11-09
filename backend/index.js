const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Dummy users database (in production, use a real database)
const users = [
  {
    id: 1,
    email: 'user@example.com',
    password: 'password123',
    name: 'Test User'
  },
  {
    id: 2,
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Admin User'
  },
  {
    id: 3,
    email: 'demo@example.com',
    password: 'demo123',
    name: 'Demo User'
  }
];

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Backend API is running!' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Sign Up endpoint
app.post('/api/auth/signup', (req, res) => {
  const { email, password, name } = req.body;

  // Validation
  if (!email || !password || !name) {
    return res.status(400).json({
      success: false,
      message: 'Email, password, and name are required'
    });
  }

  // Check if user already exists
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'User with this email already exists'
    });
  }

  // Create new user
  const newUser = {
    id: users.length + 1,
    email: email,
    password: password, // In production, hash the password
    name: name
  };

  users.push(newUser);

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name
    }
  });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  // Find user
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // In production, generate a JWT token here
  res.json({
    success: true,
    message: 'Login successful',
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    },
    token: 'dummy_token_' + user.id // In production, use JWT
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Dummy users:');
  users.forEach(u => {
    console.log(`  - ${u.email} / ${u.password}`);
  });
});

