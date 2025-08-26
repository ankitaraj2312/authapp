const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;

// Middleware
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(
  session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
  })
);

// Fake database (in-memory)
const users = [];

// Routes
app.get('/', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.redirect('/login');
});

// LOGIN
app.get('/login', (req, res) => {
  res.render('login', { message: null });
});

app.post('/login', async (req, res) => {
  const { identifier, password } = req.body;

  // Find user by email or phone
  const user = users.find(
    (u) => u.email === identifier || (u.phone && u.phone === identifier)
  );

  if (!user) {
    return res.render('login', { message: 'Invalid email/phone or password' });
  }

  // Compare password
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.render('login', { message: 'Invalid email/phone or password' });
  }

  req.session.user = user;
  res.redirect('/dashboard');
});


app.post('/register', async (req, res) => {
  const { name, email, phone, password } = req.body;

  // Check if email or phone already exists
  const existing = users.find(
    (u) => u.email === email || (phone && u.phone === phone)
  );

  if (existing) {
    return res.render('register', { message: 'Email or phone already exists' });
  }

  const hashed = await bcrypt.hash(password, 10);

  // Save user with email, phone, password
  users.push({ name, email, phone, password: hashed });

  res.redirect('/login');
});


// REGISTER
app.get('/register', (req, res) => {
  res.render('register', { message: null });
});

// DASHBOARD
app.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('dashboard', { user: req.session.user });
});

// LOGOUT
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
