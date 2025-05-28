const crypto = require("crypto");
const db = require("../config/db.js");
require("dotenv").config();

const ZWITCH_WEBHOOK_SECRET = process.env.ZWITCH_WEBHOOK_SECRET;

exports.deposit = async (req, res) => {
    const signature = req.headers["x-zwitch-signature"];
    const rawBody = JSON.stringify(req.body);

    const expectedSignature = crypto
        .createHmac("sha256", ZWITCH_WEBHOOK_SECRET)
        .update(rawBody)
        .digest("hex");

    // Verify webhook signature
    // if (signature !== expectedSignature) {
    //     return res.status(400).json({ error: "Invalid signature" });
    // }
    console.log(req.body);
    const { object : event} = req.body;
    console.log("Inside deposit1");
    // Handle deposit event
    if (event === "payment") {
        console.log("Inside deposit");
        const payment = req.body.amount;
        const account_number = req.body.account_id;
        const amount = payment.amount / 100;

        console.log("Deposit received for account:", account_number, "Amount:", amount);

        // Find the user with this virtual account number
        const findUser = "SELECT id FROM users WHERE account_number = ?";
        db.query(findUser, [account_number], (err, users) => {
            if (err || users.length === 0) {
                console.error("User not found or DB error:", err);
                return res.status(404).json({ error: "User not found for account number" });
            }

            const userId = users[0].id;

            // Update user wallet balance
            const updateWallet = "UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?";
            db.query(updateWallet, [amount, userId], (err) => {
                if (err) {
                    console.error("Wallet update failed:", err);
                    return res.status(500).json({ error: "Failed to update wallet" });
                }

                console.log(`Wallet updated for user ID: ${userId}`);
                return res.status(200).json({ message: "Wallet updated successfully" });
            });
        });
    } else {
        return res.status(200).json({ status: "ignored", message: "Event not handled" });
    }
};
