require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:8080',
      'http://10.0.2.2:3000',
      /^http:\/\/localhost:\d+$/,
    ];
    
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return allowed === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

const users = [];
const guaranteeChecks = [];

async function initializeDummyUsers() {
  const dummyUsers = [
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
    },
    {
      id: 4,
      email: 'john.doe@example.com',
      password: 'john123',
      name: 'John Doe'
    },
    {
      id: 5,
      email: 'jane.smith@example.com',
      password: 'jane123',
      name: 'Jane Smith'
    },
    {
      id: 6,
      email: 'bob.wilson@example.com',
      password: 'bob123',
      name: 'Bob Wilson'
    },
    {
      id: 7,
      email: 'alice.brown@example.com',
      password: 'alice123',
      name: 'Alice Brown'
    },
    {
      id: 8,
      email: 'charlie.davis@example.com',
      password: 'charlie123',
      name: 'Charlie Davis'
    },
    {
      id: 9,
      email: 'diana.miller@example.com',
      password: 'diana123',
      name: 'Diana Miller'
    },
    {
      id: 10,
      email: 'frank.taylor@example.com',
      password: 'frank123',
      name: 'Frank Taylor'
    }
  ];

  for (const user of dummyUsers) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    users.push({
      ...user,
      password: hashedPassword,
      createdAt: new Date()
    });
  }
}

function initializeDummyGuaranteeChecks() {
  const now = new Date();
  const dummyChecks = [
    {
      id: 1,
      userId: 1,
      storeName: 'MediaMarkt',
      productName: 'Samsung Galaxy S23',
      purchaseDate: '2024-01-15',
      expiryDate: '2025-01-15',
      imagePath: 'dummy_image_1.jpg',
      notes: 'Új Samsung telefon, 2 év garancia',
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    },
    {
      id: 2,
      userId: 1,
      storeName: 'IKEA',
      productName: 'BILLY könyvespolc',
      purchaseDate: '2024-02-10',
      expiryDate: '2026-02-10',
      imagePath: 'dummy_image_2.jpg',
      notes: 'IKEA bútor, 2 év garancia',
      createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000)
    },
    {
      id: 3,
      userId: 2,
      storeName: 'MediaMarkt',
      productName: 'Dell Inspiron 15',
      purchaseDate: '2023-06-01',
      expiryDate: '2024-12-15',
      imagePath: 'dummy_image_3.jpg',
      notes: 'Dell laptop, 1 év garancia',
      createdAt: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
    },
    {
      id: 4,
      userId: 2,
      storeName: 'Spar',
      productName: 'Sony WH-1000XM4',
      purchaseDate: '2022-03-15',
      expiryDate: '2023-03-15',
      imagePath: 'dummy_image_4.jpg',
      notes: 'Sony fejhallgató, 1 év garancia',
      createdAt: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    },
    {
      id: 5,
      userId: 3,
      storeName: 'Tesco',
      productName: 'Bosch kávéfőző',
      purchaseDate: '2024-03-01',
      expiryDate: '2025-03-01',
      imagePath: 'dummy_image_5.jpg',
      notes: 'Bosch kávéfőző, 1 év garancia',
      createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)
    },
    {
      id: 6,
      userId: 3,
      storeName: 'Auchan',
      productName: 'Nike Air Max 270',
      purchaseDate: '2024-01-20',
      expiryDate: '2025-01-20',
      imagePath: 'dummy_image_6.jpg',
      notes: 'Nike cipő, 1 év garancia',
      createdAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000)
    },
    {
      id: 7,
      userId: 4,
      storeName: 'MediaMarkt',
      productName: 'iPad Air 5',
      purchaseDate: '2023-08-15',
      expiryDate: '2024-12-20',
      imagePath: 'dummy_image_7.jpg',
      notes: 'Apple iPad, 1 év garancia',
      createdAt: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000)
    },
    {
      id: 8,
      userId: 4,
      storeName: 'MediaMarkt',
      productName: 'PlayStation 5',
      purchaseDate: '2024-02-28',
      expiryDate: '2025-02-28',
      imagePath: 'dummy_image_8.jpg',
      notes: 'Sony PlayStation 5, 1 év garancia',
      createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)
    },
    {
      id: 9,
      userId: 5,
      storeName: 'IKEA',
      productName: 'SMÅSTAD szekrény',
      purchaseDate: '2024-01-05',
      expiryDate: '2026-01-05',
      imagePath: 'dummy_image_9.jpg',
      notes: 'IKEA szekrény, 2 év garancia',
      createdAt: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000)
    },
    {
      id: 10,
      userId: 5,
      storeName: 'Spar',
      productName: 'Canon EOS R6',
      purchaseDate: '2021-12-10',
      expiryDate: '2022-12-10',
      imagePath: 'dummy_image_10.jpg',
      notes: 'Canon kamera, 1 év garancia',
      createdAt: new Date(now.getTime() - 500 * 24 * 60 * 60 * 1000)
    }
  ];

  guaranteeChecks.push(...dummyChecks);
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }
    return res.status(403).json({
      success: false,
      message: 'Invalid token.'
    });
  }
}

function generateToken(user) {
  const payload = {
    userId: user.id,
    email: user.email,
    name: user.name
  };
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

app.get('/', (req, res) => {
  res.json({
    message: 'Secure Backend API is running!',
    version: '2.0.0',
    features: [
      'Password Hashing (bcrypt)',
      'JWT Authentication',
      'Protected Routes',
      'Strict CORS Policy'
    ]
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and name are required'
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: users.length + 1,
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name,
      createdAt: new Date()
    };

    users.push(newUser);

    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      },
      token: token
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during signup'
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token: token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

app.get('/api/auth/profile', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.userId);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt
    }
  });
});

app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { name, password } = req.body;
    const user = users.find(u => u.id === req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (name) {
      user.name = name;
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long'
        });
      }
      user.password = await bcrypt.hash(password, 10);
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile update'
    });
  }
});

app.get('/api/users', authenticateToken, (req, res) => {
  const userList = users.map(u => ({
    id: u.id,
    email: u.email,
    name: u.name,
    createdAt: u.createdAt
  }));

  res.json({
    success: true,
    count: userList.length,
    users: userList
  });
});

app.post('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    user: req.user
  });
});

// Garancia ellenőrzés endpointok
app.get('/api/guarantee-checks', authenticateToken, (req, res) => {
  const userChecks = guaranteeChecks.filter(check => check.userId === req.user.userId);
  res.json({
    success: true,
    count: userChecks.length,
    checks: userChecks
  });
});

app.get('/api/guarantee-checks/:id', authenticateToken, (req, res) => {
  const check = guaranteeChecks.find(
    c => c.id === parseInt(req.params.id) && c.userId === req.user.userId
  );
  
  if (!check) {
    return res.status(404).json({
      success: false,
      message: 'Guarantee check not found'
    });
  }
  
  res.json({
    success: true,
    check: check
  });
});

app.post('/api/guarantee-checks', authenticateToken, (req, res) => {
  try {
    const { storeName, productName, purchaseDate, expiryDate, imagePath, notes } = req.body;

    if (!storeName || !productName || !purchaseDate || !expiryDate || !imagePath) {
      return res.status(400).json({
        success: false,
        message: 'Store name, product name, purchase date, expiry date, and image path are required'
      });
    }

    const newCheck = {
      id: guaranteeChecks.length > 0 ? Math.max(...guaranteeChecks.map(c => c.id)) + 1 : 1,
      userId: req.user.userId,
      storeName,
      productName,
      purchaseDate,
      expiryDate,
      imagePath,
      notes: notes || null,
      createdAt: new Date()
    };

    guaranteeChecks.push(newCheck);

    res.status(201).json({
      success: true,
      message: 'Guarantee check created successfully',
      check: newCheck
    });
  } catch (error) {
    console.error('Create guarantee check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during guarantee check creation'
    });
  }
});

app.put('/api/guarantee-checks/:id', authenticateToken, (req, res) => {
  try {
    const checkIndex = guaranteeChecks.findIndex(
      c => c.id === parseInt(req.params.id) && c.userId === req.user.userId
    );

    if (checkIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Guarantee check not found'
      });
    }

    const { storeName, productName, purchaseDate, expiryDate, imagePath, notes } = req.body;
    const check = guaranteeChecks[checkIndex];

    if (storeName) check.storeName = storeName;
    if (productName) check.productName = productName;
    if (purchaseDate) check.purchaseDate = purchaseDate;
    if (expiryDate) check.expiryDate = expiryDate;
    if (imagePath) check.imagePath = imagePath;
    if (notes !== undefined) check.notes = notes;

    res.json({
      success: true,
      message: 'Guarantee check updated successfully',
      check: check
    });
  } catch (error) {
    console.error('Update guarantee check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during guarantee check update'
    });
  }
});

app.delete('/api/guarantee-checks/:id', authenticateToken, (req, res) => {
  try {
    const checkIndex = guaranteeChecks.findIndex(
      c => c.id === parseInt(req.params.id) && c.userId === req.user.userId
    );

    if (checkIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Guarantee check not found'
      });
    }

    guaranteeChecks.splice(checkIndex, 1);

    res.json({
      success: true,
      message: 'Guarantee check deleted successfully'
    });
  } catch (error) {
    console.error('Delete guarantee check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during guarantee check deletion'
    });
  }
});

app.get('/api/guarantee-checks/stats/summary', authenticateToken, (req, res) => {
  const userChecks = guaranteeChecks.filter(check => check.userId === req.user.userId);
  const now = new Date();
  
  const expired = userChecks.filter(check => {
    const expiry = new Date(check.expiryDate);
    return expiry < now;
  });
  
  const expiringSoon = userChecks.filter(check => {
    const expiry = new Date(check.expiryDate);
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return expiry >= now && expiry <= thirtyDaysFromNow;
  });
  
  res.json({
    success: true,
    stats: {
      total: userChecks.length,
      expired: expired.length,
      expiringSoon: expiringSoon.length,
      valid: userChecks.length - expired.length - expiringSoon.length
    }
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

async function startServer() {
  try {
    await initializeDummyUsers();
    initializeDummyGuaranteeChecks();

    const server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`JWT expires in: ${JWT_EXPIRES_IN}`);
      console.log(`Initialized ${users.length} dummy users`);
      console.log(`Initialized ${guaranteeChecks.length} dummy guarantee checks`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
      } else {
        console.error('Server error:', err.message);
      }
      process.exit(1);
    });

    process.on('SIGTERM', () => {
      server.close(() => process.exit(0));
    });

    process.on('SIGINT', () => {
      server.close(() => process.exit(0));
    });

  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

startServer();
