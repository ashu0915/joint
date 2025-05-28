const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const groupRoutes = require('./routes/groupRoutes');
const depositRoutes = require('./routes/depositRoutes');
const crypto = require("crypto");
const cors = require('cors');
const session = require('express-session');
dotenv.config();

const app = express();
app.use(bodyParser.json());
dotenv.config();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true // Required to send cookies/sessions
  }));

app.use(session({
    secret: process.env.SESSION_SECRET || 'secret123',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // set to true only in production with HTTPS
      sameSite: 'lax'
    }
  }));

app.get('/',(req,res)=>{
  res.send("Hii");
});
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/payment', groupRoutes);
app.use('/open/webhook', depositRoutes);

const PORT=8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
