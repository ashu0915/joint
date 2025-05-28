const Razorpay = require('razorpay');
const db = require('../config/db.js');
require('dotenv').config();

const API_URL = 'https://api.zwitch.io/v1/payouts';
const BEARER_TOKEN = process.env.OPEN_MONEY_BEARER_TOKEN;

exports.makeGroupPayment = async (req, res) => {
    const {to, amounts, from} = req.body;
    const group_id=to;
    const amount=amounts;
    const merchant_upi=from;
    try {
        // Fetch group members and their virtual accounts
        db.query(
            'SELECT user_id, virtual_account_number FROM users WHERE id IN (SELECT user_id FROM group_members WHERE group_id = ?)', 
            [group_id], 
            async (err, members) => {
                if (err || members.length === 0) return res.status(400).json({ error: 'Invalid group' });

                const splitAmount = amount / members.length;

                db.query('SELECT virtual_account_id FROM groups WHERE id = ?', [group_id], async (err, result) => {
                    if (err || result.length === 0) return res.status(500).json({ error: 'Group not found' });

                    const masterAccount = JSON.parse(result[0].virtual_account_id);
                    const holdingAccountNumber = masterAccount.virtual_account_id;
                
                // Check if all users have sufficient balance
                for (let user of members) {
                    let [wallet] = await db.promise().query('SELECT wallet_balance FROM users WHERE id = ?', [user.user_id]);
                    if (wallet[0].wallet_balance < splitAmount) {
                        return res.status(400).json({ error: `User ${user.user_id} has insufficient balance` });
                    }
                }

                const payoutData = {
                    amount,
                    mode: "upi",
                    purpose: "payout",
                    remarks: note || "Payment via Joint",
                    virtual_account_id: holdingAccountNumber,
                    upi: {
                      address: merchant_upi,
                      name: "Merchant"
                    }
                  };
              
                  const response = await axios.post(API_URL, payoutData, {
                    headers: {
                      Authorization: `Bearer ${BEARER_TOKEN}`,
                      'Content-Type': 'application/json'
                    }
                  });
                  console.log(response);
            });
                res.json({ message: 'Payment Successful', response });
            }
        );

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
