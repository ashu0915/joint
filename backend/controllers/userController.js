const Razorpay = require('razorpay');
const db = require('../config/db.js');
require('dotenv').config();
const jwt = require("jsonwebtoken");
const axios = require('axios');
const API_URL = 'https://api.zwitch.io/v1/accounts';

exports.createUser = async (req, res) => {
    const { name, phone } = req.body;
    console.log("Request received:", req.body);
    try {
        // Step 1: Create VA
        console.log("Creating");
        const response = await axios.post(API_URL, {
              "type": "virtual",
      "name": name,
      "email": "${name}@example.com",
      "mobile_number": phone,
      "used_as": "wallet",
      "create_vpa": true,
      "metadata": {
        "customer_birthday": "567973799"
      },
      "kyc": {
        "state_code": "KA",
        "city": "Bangalore",
        "pan": "XXXXX2677X",
        "postal_code": "560005",
        "business_type": "individual",
        "business_category": "law_firm"
      }
        }, { headers: {
            Authorization: `Bearer ${process.env.OPEN_MONEY_BEARER_TOKEN}`,
            'Content-Type': 'application/json'
          } });
        console.log("Created");
        const va = response.data;
        console.log(va);
        // Step 2: Store in DB
        const query = 'INSERT INTO users (phone, name, wallet_balance, virtual_acoount_id, account_number, ifsc, beneficiary_name) VALUES (?, ?, 0, ?, ?, ?, ?)';
        db.query(query, [phone, name, va.id, va.account_number, va.ifsc_code, va.vpa], (err) => {
          if (err) return res.status(500).json({ error: 'Database error', err });
          res.status(200).json({ message: 'User created with VA', va });
        });
    
      } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.response?.data || error.message });
      }
};

exports.verifyUser = async (req, res) => {
    const { name, phone } = req.body;

    if (!name || !phone) {
        return res.status(400).json({ error: "Name and phone are required" });
    }

    try {
        const query = "SELECT * FROM users WHERE name = ? AND phone = ?";
        db.query(query, [name, phone], (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Internal server error" });
            }

            if (results.length === 1) {
                const user = results[0];

                // Save user info in session
                req.session.user = {
                    id: user.id,
                    name: user.name,
                    phone: user.phone,
                    wallet_balance: user.wallet_balance,
                    virtual_account_id: user.virtual_account_id,
                };

                const token = jwt.sign(
                    { id: user.id, name: user.name },
                    process.env.JWT_SECRET,
                    { expiresIn: "10h" }
                );
                console.log(token);
                return res.json({ token });
            } else {
                return res.status(404).json({ error: "User not found" });
            }
        });
    } catch (error) {
        console.error("Error in verifyUser:", error);
        return res.status(500).json({ error: "Server error" });
    }
};


exports.fetchWalletBalance = (req, res) => {
    const userId = req.user.id;
  
    const query = 'SELECT wallet_balance FROM users WHERE id = ?';
  
    db.query(query, [userId], (err, results) => {
      if (err) return res.status(500).json({ error: 'Database error' });
  
      if (results.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const balance = results[0].wallet_balance;
      res.json({ wallet_balance: balance });
    });
  };

